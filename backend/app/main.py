# File tells FastAPI = endpoint expects a file upload 
from fastapi import FastAPI, UploadFile, File 
from app.services.pdf_service import extract_text_from_pdf
from app.services.insights_service import analyse_financial_text# Used for copying file contents
from app.services.insights_service import generate_financial_summary
from fastapi.middleware.cors import CORSMiddleware
from app.services.metrics_service import extract_financial_metrics

import shutil 
# to handle file paths
from pathlib import Path 

# Create backend application.
app = FastAPI()

# to help frontend to talk to backend 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],             
    allow_credentials=False,      
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Create uploads folder path
UPLOAD_DIR = Path("uploads")
# create a upload folder
UPLOAD_DIR.mkdir(exist_ok=True)

# root route 
@app.get("/")
def root():
    return {"message" : "FinScope AI Backend Running"} 

# old one: upload => save

@app.post("/upload")
# to know: fastAPI is built around async 
async def upload_file(file: UploadFile = File(...)):
    # create a full file path e.g. upload/report.pdf
    file_path = UPLOAD_DIR / file.filename 

    # Save uploaded file 
    # pdfs and docx are binary files so wb means write binary
    with open(file_path, "wb") as buffer:
        # Copies uploaded file data into saved file.
        shutil.copyfileobj(file.file, buffer)
    # response in json
    return {
        "filename": file.filename,
        "message": "File uploaded successfully"
    }

# updated one: upload => save => extract text

@app.get("/analyse/{filename}")
async def analyse_file(filename: str):
    file_path = UPLOAD_DIR / filename

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Requested file not found on server.")

    try: 
        # Extract text from PDF
        extracted_text = extract_text_from_pdf(file_path)

        # Analyse financial text
        insights = analyse_financial_text(extracted_text)

        summary = generate_financial_summary(insights)

        metrics = extract_financial_metrics(extracted_text)

        return {
            "filename": filename,
            "summary": summary,
            "insights": insights,
            "metrics": metrics
        }

    except Exception as e:
        print(f"BACKEND PIPELINE CRASH: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis pipeline failed: {str(e)}")
