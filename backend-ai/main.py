import os
import io
import json
import traceback
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
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

@app.post("/analyze-report")
async def analyze_report(file: UploadFile = File(...)):
    try:
        print(f"\n📥 Received file for PRO analysis: {file.filename}")
        
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        
        # --- THE ENTERPRISE CLINICAL PROMPT ---
        # Strictly factual, zero fluff, highly professional.
        prompt = """
        You are an enterprise medical data extractor. Analyze this medical report and extract the exact details.
        
        Return STRICTLY as a JSON object with this exact structure. Do not add markdown formatting to the JSON.
        {
            "doctorName": "name of the doctor",
            "hospitalName": "name of the hospital or clinic",
            "visitDate": "YYYY-MM-DD",
            "diseaseName": "The exact diagnosis",
            "reasonForCondition": "The symptoms or root cause identified in the report",
            "patientFriendlySummary": "A clear, professional, jargon-free explanation of the report.",
            "actionPlan": ["Strict clinical step 1", "Strict clinical step 2"],
            "medicines": [
                {
                    "name": "medicine name", 
                    "specification": "dosage and instructions",
                    "purpose": "clinical reason for this medicine"
                }
            ],
            "audioScript": "Write a strictly factual, professional audio script. DO NOT use any greetings (no 'hello' or 'hi'). It MUST strictly state exactly these 4 things in order: 1. The diagnosed disease, 2. The hospital visited, 3. The reason or cause of the condition, 4. The exact solution, treatment, or action plan given by the doctor."
        }
        """
        
        print("🧠 Sending image to Gemini AI 2.5-Flash (Clinical Prompt)...")
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[prompt, image],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        
        extracted_data = json.loads(response.text)
        print("✅ Clinical Data extracted successfully")
        
        # 3. Generate Audio using the strict factual script
        print("🗣️ Generating Factual Audio Briefing...")
        
        audio_text = extracted_data.get('audioScript', 'Error reading script. Please check the text report.')
        tts = gTTS(text=audio_text, lang='en')
        
        safe_filename = file.filename.split('.')[0] if file.filename else "report"
        audio_filename = f"audio_{safe_filename}.mp3"
        audio_filepath = f"audio_reports/{audio_filename}"
        tts.save(audio_filepath)
        
        # Map the new summary to our old variable temporarily so the app doesn't break
        extracted_data["extractedText"] = extracted_data.get("patientFriendlySummary", "")
        extracted_data["voiceReportUrl"] = f"http://localhost:8000/audio/{audio_filename}"
        
        return JSONResponse(content={"status": "success", "data": extracted_data})
        
    except Exception as e:
        print("\n❌ ERROR OCCURRED:")
        traceback.print_exc()
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)