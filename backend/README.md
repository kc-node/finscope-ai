# Backend Service

Welcome to the core backend of the application.
This service acts as the **brain of the system**, handling document analysis, AI-driven processing, prediction logic, file management, and API exposure for the frontend.

---

## Tech Stack

* **Python** – Core programming language for the backend logic
* **FastAPI** – High-performance framework for building APIs, routing requests, handling uploads, and returning JSON responses
* **Uvicorn** – Lightweight ASGI server used to run and serve the FastAPI application efficiently

---

## Architecture & Directory Structure

The backend is structured in a modular way to separate concerns and improve maintainability:

```text
backend/
├── ml/         # Machine learning logic (models, prediction, anomaly detection)
├── models/     # Data schemas and validation models
├── services/   # Business logic (PDF processing, AI insights, orchestration)
├── upload/     # Temporary storage for uploaded files
└── utils/      # Utility/helper functions (text cleaning, formatting, etc.)
```

Each folder has a clear responsibility:

* **ml/** → Handles all AI/ML-related functionality
* **models/** → Defines data structures and validation rules
* **services/** → Core application logic and processing workflows
* **upload/** → Temporary file handling
* **utils/** → Reusable helper functions

---

## Getting Started

Follow the steps below to set up and run the backend locally.

### Prerequisites

* Ensure you are inside the `backend/` directory before running any commands
* It is strongly recommended to use a virtual environment to isolate dependencies

---

## Setup & Installation

### 1. Create & Activate Virtual Environment

```bash
# Create virtual environment
python -m venv venv
```

Activate it based on your OS:

**macOS / Linux**

```bash
source venv/bin/activate
```

**Windows (PowerShell)**

```bash
.\venv\Scripts\Activate.ps1
```

**Windows (CMD)**

```bash
.\venv\Scripts\activate.bat
```

---

### 2. Install Dependencies

Upgrade pip and install required packages:

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

---

### 3. Run the Server

Start the development server using Uvicorn:

```bash
uvicorn main:app --reload
```

The `--reload` flag enables hot-reloading, meaning the server automatically restarts when code changes are detected.

---

## Notes

* Make sure all dependencies are installed before running the server
* If you encounter issues, verify your virtual environment is activated
* The entry point of the app is `main.py` with `app = FastAPI()`

---


