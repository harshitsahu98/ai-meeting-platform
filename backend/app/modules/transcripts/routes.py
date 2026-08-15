from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.core.database import get_db
from app.modules.meetings.model import Meeting
from app.modules.recordings.model import Recording
from app.modules.transcripts.model import Transcript
from app.modules.transcripts.schema import TranscriptResponse
from app.modules.users.model import User


router = APIRouter(
    prefix="/transcripts",
    tags=["Transcripts"]
)

@router.get("/", response_model=List[TranscriptResponse])
def get_transcripts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    transcripts = (
        db.query(Transcript)
        .join(Recording)
        .join(Meeting)
        .filter(Meeting.user_id == current_user.id)
        .all()
    )

    return transcripts

@router.get("/{transcript_id}", response_model=TranscriptResponse)
def get_transcript(
    transcript_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    transcript = (
        db.query(Transcript)
        .join(Recording)
        .join(Meeting)
        .filter(
            Transcript.id == transcript_id,
            Meeting.user_id == current_user.id
        )
        .first()
    )

    if not transcript:
        raise HTTPException(
            status_code=404,
            detail="Transcript not found"
        )

    return transcript