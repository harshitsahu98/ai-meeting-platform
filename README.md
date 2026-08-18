# 🤖 AI Meeting Platform

> **Record. Transcribe. Understand. Act.**

An AI-powered meeting platform that transforms recorded meetings into searchable, structured insights. Upload meeting recordings, automatically transcribe them with **OpenAI Whisper**, and generate AI-powered **summaries, key points, action items, and decisions** — all through a modern React interface.

🌐 **Live Demo:** https://ai-meeting-platform-3.onrender.com

---

## ✨ Features

### 🎙️ Meeting Recording Management

* Create and manage meetings
* Upload multiple recordings for a meeting
* View individual recordings
* Delete recordings and their associated transcripts and summaries
* Track recording processing status

### 📝 Automatic Transcription

* Audio transcription powered by **OpenAI Whisper**
* Supports long meeting recordings
* Automatic audio downloading and temporary processing
* FFmpeg-based audio processing
* CPU-compatible transcription for deployment environments

### 🧠 AI Meeting Intelligence

Automatically converts transcripts into structured meeting insights:

* 📌 **Meeting Summary**
* 🔑 **Key Points**
* ✅ **Action Items**
* 💡 **Decisions**

### ☁️ Cloud Audio Storage

* Audio files are uploaded to **Cloudinary**
* Backend processes recordings from their stored URLs
* Temporary local files are removed after processing

### 🔐 Authentication & Data Isolation

* User authentication
* Protected meeting and recording routes
* Users can only access their own meetings and recordings

### 📱 Responsive Interface

* React-based modern UI
* Responsive meeting workflow
* Meeting details and recording management
* Designed for desktop and mobile screens

### ⚙️ Background Processing

Recording processing is handled in the backend using background tasks:

```text
Upload Recording
      ↓
Cloudinary Storage
      ↓
Background Processing
      ↓
Download Audio
      ↓
FFmpeg / Audio Processing
      ↓
Whisper Transcription
      ↓
Transcript Database Record
      ↓
AI Summarization
      ↓
Summary Database Record
      ↓
Completed
```

---

# 🏗️ Architecture

```text
                         ┌──────────────────────┐
                         │      React + Vite    │
                         │      Frontend        │
                         └──────────┬───────────┘
                                    │
                                    │ REST API
                                    ▼
                         ┌──────────────────────┐
                         │     FastAPI          │
                         │     Backend          │
                         └──────────┬───────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
                 ▼                  ▼                  ▼
        ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
        │   PostgreSQL   │  │   Cloudinary   │  │    Whisper     │
        │    Database    │  │ Audio Storage  │  │ Transcription  │
        └────────────────┘  └────────────────┘  └───────┬────────┘
                                                        │
                                                        ▼
                                                ┌───────────────┐
                                                │ AI Summarizer │
                                                └───────────────┘
```

---

# 🛠️ Tech Stack

## Frontend

| Technology | Purpose                                  |
| ---------- | ---------------------------------------- |
| React      | User interface                           |
| TypeScript | Type-safe frontend development           |
| Vite       | Development and production build tooling |
| CSS        | Responsive styling                       |

## Backend

| Technology | Purpose                     |
| ---------- | --------------------------- |
| Python     | Backend language            |
| FastAPI    | REST API framework          |
| SQLAlchemy | Database ORM                |
| PostgreSQL | Persistent data storage     |
| Pydantic   | Request/response validation |
| Uvicorn    | ASGI server                 |

## AI & Audio

| Technology       | Purpose                         |
| ---------------- | ------------------------------- |
| OpenAI Whisper   | Speech-to-text transcription    |
| FFmpeg           | Audio processing                |
| AI summarization | Meeting intelligence generation |

## Infrastructure

| Technology | Purpose                  |
| ---------- | ------------------------ |
| Cloudinary | Audio file storage       |
| Docker     | Backend containerization |
| Render     | Cloud deployment         |
| GitHub     | Source control and CI/CD |

---

# 📂 Project Structure

```text
ai-meeting-platform/
│
├── backend/
│   │
│   ├── app/
│   │   ├── auth/
│   │   │
│   │   ├── core/
│   │   │   └── database.py
│   │   │
│   │   ├── modules/
│   │   │   ├── meetings/
│   │   │   ├── recordings/
│   │   │   ├── transcripts/
│   │   │   ├── summary/
│   │   │   └── users/
│   │   │
│   │   ├── services/
│   │   │   ├── cloudinary_service.py
│   │   │   ├── transcription.py
│   │   │   └── summarization.py
│   │   │
│   │   └── main.py
│   │
│   ├── requirements-full.txt
│   └── ...
│
├── frontend/
│   │
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Meetings.tsx
│   │   │   ├── MeetingDetails.tsx
│   │   │   ├── Recordings.tsx
│   │   │   └── ...
│   │   │
│   │   ├── services/
│   │   │   └── api.ts
│   │   │
│   │   └── ...
│   │
│   ├── package.json
│   └── ...
│
├── Dockerfile
└── README.md
```

---

# 🔄 Recording Processing Pipeline

The core workflow is designed around asynchronous processing so that uploading a recording does not require the user to wait for the entire AI pipeline to finish.

### 1. Upload

The user selects an audio recording from the frontend.

```text
Frontend
   ↓
FastAPI /recordings/upload
```

### 2. Cloud Storage

The backend temporarily stores the uploaded file and sends it to Cloudinary.

```text
Audio File
    ↓
Temporary File
    ↓
Cloudinary
    ↓
Audio URL
```

The temporary local file is removed after upload.

### 3. Database Record

A recording record is created with:

```text
status = "pending"
```

### 4. Background Processing

The backend starts processing the recording in the background.

```text
pending
   ↓
transcribing
   ↓
summarizing
   ↓
completed
```

If processing fails:

```text
failed
```

### 5. Transcription

The backend downloads the audio from its Cloudinary URL and passes the file to Whisper.

```python
transcript_text = transcribe_audio(
    file_path
)
```

### 6. Transcript Storage

The generated transcript is stored in PostgreSQL and linked to the recording.

```text
Recording
    │
    └── Transcript
```

### 7. AI Analysis

The transcript is passed to the summarization service.

The result is structured into:

```text
Summary
├── Summary
├── Key Points
├── Action Items
└── Decisions
```

---

# 🗄️ Data Model

The application follows a relational structure:

```text
User
 │
 └── Meetings
       │
       └── Recordings
              │
              └── Transcripts
                     │
                     └── Summaries
```

This allows one meeting to contain multiple recordings while keeping each transcript and AI-generated summary associated with the correct recording.

---

# 🚀 Running Locally

## Prerequisites

Make sure you have:

* Python 3.12+
* Node.js
* npm
* PostgreSQL
* FFmpeg
* Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/harshitsahu98/ai-meeting-platform.git

cd ai-meeting-platform
```

---

# 🐍 Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

### Windows

```powershell
python -m venv .venv
```

Activate it:

```powershell
.venv\Scripts\activate
```

Install dependencies:

```powershell
pip install -r requirements-full.txt
```

If CPU-only PyTorch installation is required:

```powershell
pip install --index-url https://download.pytorch.org/whl/cpu torch
```

---

## 🎵 FFmpeg

FFmpeg is required for audio processing.

Verify the installation:

```powershell
ffmpeg -version
```

The backend uses FFmpeg-compatible audio processing so that recordings can be handled reliably before transcription.

---

# 🔐 Environment Variables

Create your backend environment configuration with the required values:

```env
DATABASE_URL=your_postgresql_connection_string

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

SECRET_KEY=your_application_secret
```

If your summarization service requires an additional AI API key, configure that key according to the implementation in your backend.

> **Never commit `.env` files or API keys to GitHub.**

---

# ▶️ Start the Backend

From the `backend` directory:

```powershell
uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

---

# ⚛️ Frontend Setup

Open another terminal and navigate to the frontend:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

# 🐳 Docker Deployment

The backend includes a Docker configuration designed for deployment environments where FFmpeg needs to be installed inside the container.

The Docker image:

```text
Python 3.12
     ↓
FFmpeg
     ↓
PyTorch CPU
     ↓
Backend dependencies
     ↓
FastAPI
     ↓
Uvicorn
```

Build the image:

```bash
docker build -t ai-meeting-platform .
```

Run it:

```bash
docker run -p 8000:8000 ai-meeting-platform
```

---

# ☁️ Render Deployment

The application is designed to run on Render using Docker.

The Dockerfile installs FFmpeg directly inside the image, avoiding the need for `apt-get` commands in Render's Python build environment.

Recommended configuration:

```text
Environment:
Docker

Dockerfile Path:
./Dockerfile

Docker Build Context:
.
```

The application listens on Render's dynamically assigned `$PORT`:

```bash
uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
```

### Deployment Environment Variables

Configure the required environment variables in Render rather than committing secrets to the repository.

```text
DATABASE_URL
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
CLOUDINARY_CLOUD_NAME
SECRET_KEY
```

Add any additional API keys required by the summarization implementation.

---

# 💰 Cost-Conscious Architecture

This project was intentionally designed without requiring a paid AI infrastructure service.

The architecture uses:

```text
React
   +
FastAPI
   +
PostgreSQL
   +
Whisper
   +
FFmpeg
   +
Cloudinary
   +
Render
```

Whisper runs locally inside the backend rather than requiring a separate transcription API.

This makes the architecture suitable for experimentation, learning, portfolio demonstrations, and free-tier deployments where available.

> Free-tier providers have resource, storage, execution-time, and usage limitations. Performance for very long recordings depends heavily on the available CPU and memory.

---

# 🧠 Long Recording Support

A major design consideration of this project is processing longer meeting recordings.

The transcription pipeline:

```text
Cloud Audio URL
       ↓
Temporary Local Audio File
       ↓
FFmpeg
       ↓
Whisper
       ↓
Transcript
       ↓
AI Summary
```

The backend uses temporary files rather than attempting to keep the complete recording in application memory.

Whisper is configured for CPU-compatible execution:

```python
model = whisper.load_model(
    "tiny",
    device="cpu"
)
```

and:

```python
result = model.transcribe(
    file_path,
    fp16=False
)
```

This makes the implementation compatible with CPU-based deployment environments.

---

# 📡 API Overview

### Meetings

```text
GET    /meetings/
POST   /meetings/
GET    /meetings/{meeting_id}
DELETE /meetings/{meeting_id}
```

### Recordings

```text
POST   /recordings/
POST   /recordings/upload
GET    /recordings/
GET    /recordings/{recording_id}
DELETE /recordings/{recording_id}
POST   /recordings/{recording_id}/transcribe
```

### Processing

The recording processing pipeline handles:

```text
Upload
→ Storage
→ Transcription
→ Transcript
→ Summarization
→ Summary
```

---

# 🔒 Security Considerations

The application protects user-owned resources through authenticated database queries.

For example, recordings are retrieved together with their associated meeting and user ownership:

```python
.filter(
    Recording.id == recording_id,
    Meeting.user_id == current_user.id
)
```

This prevents users from directly accessing recordings belonging to another account through the API.

Additional production recommendations include:

* Store secrets exclusively in environment variables
* Never commit API credentials
* Rotate exposed credentials
* Use HTTPS in production
* Apply appropriate database access controls
* Add rate limiting for public deployments
* Validate uploaded file types and sizes

---

# 📈 Future Improvements

The platform can be extended with:

* 🎤 Live meeting transcription
* 🌍 Multi-language transcription
* 👥 Speaker identification
* 🔎 Transcript search
* 📊 Meeting analytics
* 📅 Calendar integration
* 📧 Automated meeting follow-ups
* 📄 PDF meeting reports
* 📥 Transcript export
* 🔔 Action-item notifications
* 🧠 Larger Whisper models when more compute is available
* ⚡ Job queues such as Celery/RQ for production-scale processing
* 📦 Object-storage lifecycle management
* 🧪 Automated backend and frontend tests

---

# 🎯 Why This Project?

Meetings generate enormous amounts of information, but the important decisions and action items are often buried inside hours of conversation.

This project solves that problem by turning:

```text
🎙️ Hours of Audio
        ↓
📝 Full Transcript
        ↓
🧠 AI Understanding
        ↓
📌 Key Points
        ↓
✅ Action Items
        ↓
💡 Decisions
```

into a single streamlined workflow.

---

# 🧪 Project Highlights

This project demonstrates practical experience with:

* Full-stack application development
* REST API design
* React + TypeScript
* FastAPI
* SQLAlchemy
* PostgreSQL
* Authentication
* File uploads
* Cloud storage
* Audio processing
* Speech-to-text AI
* AI-powered text summarization
* Background processing
* Docker
* Cloud deployment
* Responsive UI development
* Git/GitHub workflow

---

# 🌐 Live Application

### 🚀 Try the Application

**https://ai-meeting-platform-3.onrender.com**

---

# 👨‍💻 Author

**Harshit Sahu**

GitHub:
https://github.com/harshitsahu98

---

# ⭐ Support

If you find this project useful or interesting, consider giving the repository a ⭐ on GitHub.

---

## 📜 License

This project is intended for educational, portfolio, and development purposes. Add a formal open-source license to the repository if you intend to distribute the project under specific licensing terms.
