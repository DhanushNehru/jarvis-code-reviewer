# Jarvis Code Reviewer

An automated, always-on intelligent code reviewer built for the next generation of engineers, submitted for the AIM Code Kitchen Season 01 presented by Google Cloud.

## Features
- **Multi-language Reviews:** Powered by Vertex AI Gemini, evaluates Python, JavaScript, Java, Go, and more.
- **Historical Learning (RAG):** Ingests organizational CSV data into BigQuery and performs Retrieval-Augmented Generation to ground AI evaluations.
- **Quality Rating:** Strict 1-10 scoring system for every code submission.
- **Persistent Session History:** Firestore tracking visualizes developer growth patterns over time using Chart.js.
- **Cyber-Glass UI:** Highly polished Vanilla CSS/Tailwind frontend reflecting a premium developer experience.

## Architecture
- **Frontend:** React + Vite, deployed on Google Cloud Run.
- **Backend:** Python + FastAPI, deployed on Google Cloud Run.
- **Auth:** Firebase Authentication (Google Sign-In).
- **Core Engine:** Vertex AI Gemini 2.5 Flash for high-speed, structured JSON generation.
- **Databases:** Firestore (Session History), BigQuery (Historical Pattern RAG), Cloud Storage (Code Persistence).

## Running Locally

1. Create a Firebase Web App and place your config in `frontend/src/services/firebase.js`.
2. Generate a Service Account JSON Key (with Owner access) from GCP and place it in `backend/gcp-key.json`.
3. In `backend`, copy `.env.example` to `.env` (or create one) and set:
   ```env
   PROJECT_ID=your-gcp-project-id
   GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/backend/gcp-key.json
   ```
4. Run BigQuery Setup:
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   cd ../deploy
   python3 setup_bq.py
   ```
5. Run Backend:
   ```bash
   cd backend
   uvicorn app.main:app --reload --port 8000
   ```
6. Run Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Cloud Run Deployment

Use the provided `Dockerfile`s in both the `frontend` and `backend` directories to build and deploy to Google Artifact Registry and Google Cloud Run.
