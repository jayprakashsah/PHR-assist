import os
import io
import json
import traceback
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn
from google import genai
from google.genai import types
from gtts import gTTS
from dotenv import load_dotenv
from PIL import Image

load_dotenv()

app = FastAPI(title="Smart PHR AI Engine ULTRA")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini Client
client = genai.Client()

# 1. Setup Static Folders
os.makedirs("audio_reports", exist_ok=True)
os.makedirs("scans", exist_ok=True) 
app.mount("/audio", StaticFiles(directory="audio_reports"), name="audio")
app.mount("/scans", StaticFiles(directory="scans"), name="scans")

# --- 1. REPORT ANALYZER MODULE (WITH INTERACTION & VITALS) ---
@app.post("/analyze-report")
async def analyze_report(
    files: List[UploadFile] = File(...),
    current_meds: str = Form(default="None") 
):
    try:
        print(f"\n📥 Analysis Started. Pages: {len(files)} | Current Meds: {current_meds}")
        
        image_list = []
        for file in files:
            image_data = await file.read()
            image = Image.open(io.BytesIO(image_data))
            if image.mode != 'RGB':
                image = image.convert('RGB')
            image_list.append(image)
        
        # ADVANCED PROMPT: Handling Interactions, Vitals, and Scans
        prompt = f"""
        You are an elite Medical Consultant and Clinical Pharmacist. 
        Analyze these report images and provide a deep clinical extraction.
        
        SAFETY CHECK: The patient is currently taking: {current_meds}.
        Cross-reference ALL new medications found in this report against these current meds.

        Return STRICTLY a JSON object:
        {{
            "doctorName": "string",
            "hospitalName": "string",
            "visitDate": "YYYY-MM-DD",
            "diseaseName": "string",
            "reasonForCondition": "string",
            "patientFriendlySummary": "Deep explanation of the condition and findings.",
            
            "vitals": {{
                "bloodPressure": "string (e.g. '120/80'). Return null if not found.",
                "heartRate": "integer (e.g. 75). Return null if not found.",
                "bloodSugar": "integer (e.g. 110). Return null if not found.",
                "temperature": "float (e.g. 98.6). Return null if not found."
            }},

            "medicines": [
                {{
                    "name": "string", 
                    "specification": "dosage",
                    "purpose": "why is this prescribed?",
                    "durationInDays": 10,
                    "frequency": "e.g. 1-0-1"
                }}
            ],

            "drugInteractions": [
                {{
                    "interactingDrugs": "Drug A + Drug B",
                    "severity": "High / Medium / Low",
                    "description": "Why is this dangerous?"
                }}
            ],

            "audioScript": "Professional summary for audio briefing.",
            "containsVisualScan": "boolean",
            "scanType": "e.g. Chest X-Ray",
            "scanImageIndex": 0,
            "scanBoundingBox": [0, 0, 1000, 1000]
        }}
        """
        
        contents_payload = [prompt] + image_list
        response = client.models.generate_content(
            model='gemini-2.0-flash', 
            contents=contents_payload,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        
        extracted_data = json.loads(response.text)

        # --- CROPPING LOGIC ---
        if extracted_data.get("containsVisualScan") and extracted_data.get("scanBoundingBox"):
            try:
                box = extracted_data["scanBoundingBox"]
                idx = int(extracted_data.get("scanImageIndex", 0))
                if len(box) == 4 and idx < len(image_list):
                    target_img = image_list[idx]
                    w, h = target_img.size
                    left, top, right, bottom = (box[1]/1000)*w, (box[0]/1000)*h, (box[3]/1000)*w, (box[2]/1000)*h
                    cropped_img = target_img.crop((left, top, right, bottom))
                    
                    safe_filename = files[0].filename.split('.')[0] if files[0].filename else "scan"
                    fname = f"scan_{safe_filename}.jpg"
                    fpath = os.path.join("scans", fname)
                    cropped_img.save(fpath)
                    extracted_data["croppedScanUrl"] = f"http://localhost:8000/scans/{fname}"
            except Exception as e:
                print(f"Crop Error: {e}")

        # --- AUDIO GENERATION ---
        audio_text = extracted_data.get('audioScript', 'No script generated.')
        tts = gTTS(text=audio_text, lang='en')
        safe_audio_name = files[0].filename.split('.')[0] if files[0].filename else "audio"
        a_name = f"audio_{safe_audio_name}.mp3"
        a_path = f"audio_reports/{a_name}"
        tts.save(a_path)
        
        extracted_data["extractedText"] = extracted_data.get("patientFriendlySummary", "")
        extracted_data["voiceReportUrl"] = f"http://localhost:8000/audio/{a_name}"
        
        return JSONResponse(content={"status": "success", "data": extracted_data})
        
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)

# --- 2. ADVANCED AI HEALTH AGENT CHATBOT ---

class ChatRequest(BaseModel):
    message: str
    patient_context: str = "No medical history provided."

@app.post("/chat")
async def ai_chat(request: ChatRequest):
    try:
        user_message = request.message
        context = request.patient_context
        print(f"\n💬 Chat query received: {user_message}")
        print(f"🧠 Injecting Context: {context}")

        if not user_message:
            return JSONResponse(content={"status": "error", "message": "No message provided"}, status_code=400)

        # --- THE ULTRA-STRICT CLINICAL PROMPT ---
        prompt = f"""
        You are 'SmartPHR Agent', an elite, highly accurate medical AI. 
        You have direct access to the user's private medical vault. 
        
        HERE IS THE PATIENT'S ACTUAL MEDICAL RECORD (YOUR SOURCE OF TRUTH):
        {context}
        
        STRICT RULES YOU MUST FOLLOW:
        1. NO GENERIC ANSWERS: If the user asks "What are my conditions?" you MUST read the Patient's Record above and list them exactly. If the record says "No medical history", you MUST reply "I don't see any conditions in your vault yet. Please upload a report."
        2. BE DIRECT: Do not say "I can help you with that" or "Here is your answer." Just give the exact answer immediately.
        3. ACCURACY: Do not invent diseases or medicines. Only state what is in the provided context.
        4. GENERAL QUESTIONS: If they ask a general health question (e.g., "What is good for a fever?"), give standard medical advice (e.g., "Paracetamol, rest, and hydration") but cross-check it against their medications in the context to ensure there are no bad interactions.
        5. FORMATTING: Use bullet points for readability.
        
        Patient's Question: {user_message}
        """

        # Using your Gemini API Client
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )

        reply_text = response.text
        print("✅ Strict AI Reply generated successfully")

        return JSONResponse(content={"status": "success", "reply": reply_text})

    except Exception as e:
        print("\n❌ CHAT ERROR OCCURRED:")
        traceback.print_exc()
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)
    
# --- 3. NATIVE LANGUAGE TRANSLATION MODULE ---
class TranslationRequest(BaseModel):
    text: str
    target_language: str

@app.post("/translate")
async def translate_text(request: TranslationRequest):
    try:
        print(f"🌍 Translating summary to {request.target_language}...")
        prompt = f"""
        You are an expert medical translator. Translate the following medical summary into {request.target_language}.
        Keep the clinical meaning 100% accurate, but make sure it is easy for a normal patient to understand.
        Do not add any conversational filler. Just return the translated text.
        
        Text to translate:
        {request.text}
        """
        response = client.models.generate_content(model='gemini-2.0-flash', contents=prompt)
        print("✅ Translation complete!")
        return JSONResponse(content={"status": "success", "translatedText": response.text})
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)

# --- 4. AI DIET & LIFESTYLE ENGINE ---
class LifestyleRequest(BaseModel):
    medical_history: str

@app.post("/generate-lifestyle")
async def generate_lifestyle(request: LifestyleRequest):
    try:
        print(f"🥗 Generating Lifestyle Plan for history length: {len(request.medical_history)}")
        
        prompt = f"""
        You are an elite clinical nutritionist and physical therapist. 
        Analyze the following patient medical history (which includes past diagnoses, medicines, and vitals).
        
        Patient History:
        {request.medical_history}
        
        Create a personalized, medically-safe dietary and exercise plan. 
        If they have conditions like hypertension, ensure the diet is low-sodium. If they have diabetes, ensure low glycemic index, etc.
        
        Return STRICTLY as a JSON object with this exact structure. Do not add markdown formatting to the JSON:
        {{
            "healthAnalysis": "A short, encouraging paragraph explaining how this plan targets their specific conditions.",
            "foodsToAvoid": ["Food 1", "Food 2", "Food 3"],
            "superfoods": ["Food 1", "Food 2", "Food 3"],
            "dailyDiet": [
                {{
                    "meal": "Breakfast",
                    "suggestion": "Detailed healthy meal idea",
                    "benefits": "Why this helps their condition"
                }},
                {{
                    "meal": "Lunch",
                    "suggestion": "Detailed healthy meal idea",
                    "benefits": "Why this helps their condition"
                }},
                {{
                    "meal": "Dinner",
                    "suggestion": "Detailed healthy meal idea",
                    "benefits": "Why this helps their condition"
                }}
            ],
            "exercisePlan": [
                {{
                    "activity": "Name of exercise",
                    "duration": "How many minutes",
                    "frequency": "How many times a week",
                    "precautions": "Safety warnings based on their health"
                }}
            ]
        }}
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        
        lifestyle_data = json.loads(response.text)
        print("✅ Lifestyle Plan generated successfully!")
        
        return JSONResponse(content={"status": "success", "data": lifestyle_data})

    except Exception as e:
        print("\n❌ LIFESTYLE ENGINE ERROR:")
        traceback.print_exc()
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)
    
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)