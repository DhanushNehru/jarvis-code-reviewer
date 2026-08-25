# J.A.R.V.I.S. Code Reviewer 🤖✨

An intelligent, full-stack application that provides real-time, AI-driven code reviews, architectural insights, and performance optimizations. Powered by Gemini 2.5 and built with a modern React/FastAPI stack, J.A.R.V.I.S. acts as your personal AI engineering assistant.

<img width="1908" height="1002" alt="Jarvis Code Reviewer" src="https://github.com/user-attachments/assets/0de20e91-8030-44f4-92d7-9637d15a9383" />


## 🚀 Features

- **Instant AI Code Evaluation:** Paste your code or import directly from GitHub to receive immediate feedback on bugs, best practices, and optimizations.
- **Cyber-Glass UI:** A beautiful, responsive interface featuring Dark/Light mode and Tailwind v4 cyber-glass aesthetics.
- **Interactive Editor:** Integrated Monaco Editor (VS Code engine) for seamless code writing and applying AI-suggested fixes in real-time.
- **Skill Matrix Analytics:** View granular radar charts (`Chart.js`) mapping your code quality across Security, Performance, Testing, and Architecture.
- **Persistent Archives:** Built-in history tracking via Firebase/Firestore to monitor your engineering growth over time.
- **Voice Synthesis:** Native Web Speech API integration allows J.A.R.V.I.S. to verbally summarize his findings with interactive playback controls.

## 🛠 Tech Stack

### Frontend
- **Framework:** React 19 + Vite 8
- **Styling:** Tailwind CSS v4 + Framer Motion
- **Editor:** `@monaco-editor/react`
- **Charts:** `react-chartjs-2` + `Chart.js`
- **Icons:** `lucide-react`

### Backend
- **Framework:** FastAPI (Python)
- **AI Engine:** Google Gemini 2.5 Flash
- **Database:** Firebase Firestore
- **Storage:** Google Cloud Storage

## 📦 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/your-username/jarvis-code-reviewer.git
cd jarvis-code-reviewer
```

### 2. Backend Setup
Navigate to the backend directory and set up your Python environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory with your Google API Key:
```env
GOOGLE_API_KEY=your_gemini_api_key
```

Start the FastAPI server:
```bash
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory:
```bash
cd frontend
npm install
npm run dev
```

The application will be running at `http://localhost:5173`.

## ☁️ Deployment

This application is container-ready and configured for seamless deployment on Google Cloud Run.

### Frontend Deployment (Cloud Run Buildpacks)
```bash
cd frontend
gcloud run deploy jarvis-frontend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

### Backend Deployment (Dockerfile)
```bash
cd backend
gcloud run deploy jarvis-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 📄 License
[MIT](https://choosealicense.com/licenses/mit/)
