import os
import io
import json
import traceback
from typing import List
from fastapi import FastAPI, UploadFile, File
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

app = FastAPI(title="Smart PHR AI Engine PRO")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client()

os.makedirs("audio_reports", exist_ok=True)
app.mount("/audio", StaticFiles(directory="audio_reports"), name="audio")

# --- 1. REPORT ANALYZER MODULE (Multi-Page + Medicine Timelines) ---
@app.post("/analyze-report")
async def analyze_report(files: List[UploadFile] = File(...)):
    try:
        print(f"\n📥 Received {len(files)} pages for Multi-Page PRO analysis.")
        
        # 1. Process all uploaded images into a list
        image_list = []
        for file in files:
            image_data = await file.read()
            image = Image.open(io.BytesIO(image_data))
            image_list.append(image)
        
        # 2. Tell the AI it is looking at a multi-page document and ask for medicine duration
        prompt = """
        You are an enterprise medical data extractor. Analyze this MULTI-PAGE medical report and extract the exact details.
        Synthesize the information across all the provided pages into a single, cohesive summary.
        
        Return STRICTLY as a JSON object with this exact structure. Do not add markdown formatting to the JSON.
        {
            "doctorName": "name of the doctor",
            "hospitalName": "name of the hospital or clinic",
            "visitDate": "YYYY-MM-DD",
            "diseaseName": "The exact diagnosis",
            "reasonForCondition": "The symptoms or root cause identified",
            "patientFriendlySummary": "A clear, professional, jargon-free explanation covering ALL pages.",
            "actionPlan": ["Strict clinical step 1", "Strict clinical step 2"],
            "medicines": [
                {
                    "name": "medicine name", 
                    "specification": "dosage and instructions",
                    "purpose": "clinical reason for this medicine",
                    "durationInDays": "Number of days to take it (extract as an integer, e.g., 5. If not specified, estimate based on standard prescription or use 7)",
                    "frequency": "How often? (e.g., 'Twice a day - Morning & Night')"
                }
            ],
            "audioScript": "Write a strictly factual, professional audio script summarizing the diagnosis and action plan. No greetings."
        }
        """
        
        print(f"🧠 Sending {len(image_list)} images to Gemini AI...")
        
        # 3. Pass the prompt AND the entire list of images to Gemini!
        contents_payload = [prompt] + image_list
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=contents_payload,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        
        extracted_data = json.loads(response.text)
        print("✅ Multi-Page Clinical Data extracted successfully")
        
        # 4. Generate Audio
        print("🗣️ Generating Factual Audio Briefing...")
        audio_text = extracted_data.get('audioScript', 'Error reading script.')
        tts = gTTS(text=audio_text, lang='en')
        
        safe_filename = files[0].filename.split('.')[0] if files[0].filename else "multi_report"
        audio_filename = f"audio_{safe_filename}.mp3"
        audio_filepath = f"audio_reports/{audio_filename}"
        tts.save(audio_filepath)
        
        extracted_data["extractedText"] = extracted_data.get("patientFriendlySummary", "")
        extracted_data["voiceReportUrl"] = f"http://localhost:8000/audio/{audio_filename}"
        
        return JSONResponse(content={"status": "success", "data": extracted_data})
        
    except Exception as e:
        print("\n❌ MULTI-PAGE ERROR OCCURRED:")
        traceback.print_exc()
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)

# --- 2. AI HEALTH AGENT CHATBOT MODULE ---

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def ai_chat(request: ChatRequest):
    try:
        user_message = request.message
        print(f"\n💬 Received chat query: {user_message}")

        if not user_message:
            return JSONResponse(content={"status": "error", "message": "No message provided"}, status_code=400)

        # --- THE CHATBOT PERSONA PROMPT ---
        prompt = f"""
        You are 'SmartPHR Agent', a highly advanced, empathetic, and professional AI Health Assistant. 
        Your job is to help users understand their symptoms, answer general medical questions, and provide healthy lifestyle advice.
        
        Rules:
        1. Be incredibly polite and comforting.
        2. Keep your answers concise, formatted with clear bullet points if necessary.
        3. ALWAYS include a brief disclaimer at the end that you are an AI and they should consult a real doctor for serious issues.
        
        User's Question: {user_message}
        """

        print("🧠 Thinking...")
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )

        reply_text = response.text
        print("✅ Reply generated successfully")

        return JSONResponse(content={"status": "success", "reply": reply_text})

    except Exception as e:
        print("\n❌ CHAT ERROR OCCURRED:")
        traceback.print_exc()
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)