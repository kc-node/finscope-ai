# Backend Service 

Welcome to the core engine of the application. This directory houses the "brain" of the system, responsible for document analysis, AI processing, prediction logic, file handling, and exposing the system's APIs.

---

## Tech Stack

*   **Python:** The core programming language.
*   **FastAPI:** Our modern, fast backend framework used to create APIs, handle routing, manage file uploads, and serve JSON responses.
*   **Uvicorn:** The lightning-fast ASGI web server required to run and serve the FastAPI application.

---

## Architecture & Directory Structure

Here is a breakdown of how the backend code is organized:

```text
backend/
├── ml/             # Machine learning code (prediction models, anomaly detection)
├── models/         # Data models and validation schemas
├── services/       # Core business logic (PDF processing, AI insight generation)
├── upload/         # Temporary storage folder for uploaded files
└── utils/          # Helper functions (text cleaning, date formatting)
