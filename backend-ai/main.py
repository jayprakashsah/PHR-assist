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

# Load the API key from the .env file
load_dotenv()

app = FastAPI(title="Smart PHR AI Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client()

# Create a folder to save the generated audio files
os.makedirs("audio_reports", exist_ok=True)
app.mount("/audio", StaticFiles(directory="audio_reports"), name="audio")

@app.get("/")
def read_root():
    return {"message": "🤖 Python AI Backend is ready!"}

@app.post("/analyze-report")
async def analyze_report(file: UploadFile = File(...)):
    try:
        print(f"\n📥 Received file: {file.filename}")
        
        # 1. Read the image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        print("✅ Image loaded successfully")
        
        prompt = """
        Analyze this medical report. Extract the following details and return strictly as JSON.
        {
            "doctorName": "name of the doctor",
            "hospitalName": "name of the hospital or clinic",
            "visitDate": "YYYY-MM-DD",
            "diseaseName": "diagnosis or main symptom",
            "medicines": [{"name": "medicine name", "specification": "dosage and instructions"}],
            "extractedText": "A simple 2-sentence summary of this report for the patient to understand."
        }
        """
        
        print("🧠 Sending image to Gemini AI (using 2.5-flash)...")
        # --- FIXED: USING 2.5-FLASH TO BYPASS QUOTA & 404 ERRORS ---
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[prompt, image],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        print("✅ Received response from Gemini")
        
        # 2. Parse the JSON
        extracted_data = json.loads(response.text)
        print("✅ Data extracted successfully")
        
        # 3. Generate Audio
        print("🗣️ Generating Audio Summary...")
        doctor = extracted_data.get('doctorName', 'your doctor')
        disease = extracted_data.get('diseaseName', 'your condition')
        summary = extracted_data.get('extractedText', 'Please consult your doctor for details.')
        
        audio_text = f"Hello. Here is your medical summary. You visited {doctor} for {disease}. {summary}"
        
        tts = gTTS(text=audio_text, lang='en')
        
        # Make sure the filename is safe
        safe_filename = file.filename.split('.')[0] if file.filename else "report"
        audio_filename = f"audio_{safe_filename}.mp3"
        audio_filepath = f"audio_reports/{audio_filename}"
        tts.save(audio_filepath)
        
        extracted_data["voiceReportUrl"] = f"http://localhost:8000/audio/{audio_filename}"
        print("✅ Audio generated and process complete!")
        
        return JSONResponse(content={"status": "success", "data": extracted_data})
        
    except Exception as e:
        print("\n❌ ERROR OCCURRED:")
        traceback.print_exc()
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)