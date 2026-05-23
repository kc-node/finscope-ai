from fastapi import FastAPI, UploadFile, File 
from app.services.pdf_service import extract_text_from_pdf
# File tells FastAPI = endpoint expects a file upload 
# Used for copying file contents
import shutil 
# to handle file paths
from pathlib import Path 

# Create backend application.
app = FastAPI()

# Create uploads folder path
UPLOAD_DIR = Path("uploads")
# create a upload folder
UPLOAD_DIR.mkdir(exist_ok=True)

# root route 
@app.get("/")
def root():
    return {"message" : "FinScope AI Backend Running"} 

# old one: upload => save

# @app.post("/upload")
# # to know: fastAPI is built around async 
# async def upload_file(file: UploadFile = File(...)):
#     # create a full file path e.g. upload/report.pdf
#     file_path = UPLOAD_DIR / file.filename 

#     # Save uploaded file 
#     # pdfs and docx are binary files so wb means write binary
#     with open(file_path, "wb") as buffer:
#         # Copies uploaded file data into saved file.
#         shutil.copyfileobj(file.file, buffer)
#     # response in json
#     return {
#         "filename": file.filename,
#         "message": "File uploaded successfully"
#     }

# updated one: upload => save => extract text

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = UPLOAD_DIR / file.filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    extracted_text = extract_text_from_pdf(file_path)

    return {
        "filename": file.filename,
        "extracted_text": extracted_text
    }