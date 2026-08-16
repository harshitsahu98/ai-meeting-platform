import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.auth.routes import router as auth_router
from app.core.database import Base, engine

from app.modules.users.model import User
from app.modules.meetings.model import Meeting
from app.modules.recordings.model import Recording
from app.modules.transcripts.model import Transcript

from app.modules.meetings.routes import router as meetings_router
from app.modules.recordings.routes import router as recordings_router
from app.modules.transcripts.routes import router as transcripts_router
from app.modules.summary.routes import router as summary_router


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="AI Meeting Intelligence API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://ai-meeting-platform-3.onrender.com",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================
# Static uploaded files
# =========================================

UPLOADS_DIR = os.path.join(
    os.path.dirname(
        os.path.dirname(__file__)
    ),
    "uploads"
)

os.makedirs(
    UPLOADS_DIR,
    exist_ok=True
)

app.mount(
    "/uploads",
    StaticFiles(directory=UPLOADS_DIR),
    name="uploads"
)

# =========================================
# API routes
# =========================================

app.include_router(auth_router)
app.include_router(meetings_router)
app.include_router(recordings_router)
app.include_router(transcripts_router)
app.include_router(summary_router)


@app.get("/")
def root():
    return {
        "message": "AI Meeting Intelligence API"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }