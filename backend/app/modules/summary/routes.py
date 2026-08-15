from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.core.database import get_db
from app.modules.transcripts.model import Transcript
from app.modules.recordings.model import Recording
from app.modules.meetings.model import Meeting
from app.modules.summary.model import Summary
from app.modules.summary.schema import SummaryResponse
from app.modules.users.model import User
from app.services.summarization import summarize_transcript
from typing import List


router = APIRouter(
    prefix="/summaries",
    tags=["Summaries"]
)

@router.get(
    "/",
    response_model=List[SummaryResponse]
)
def get_summaries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    summaries = (
        db.query(Summary)
        .join(Transcript)
        .join(Recording)
        .join(Meeting)
        .filter(
            Meeting.user_id == current_user.id
        )
        .all()
    )

    return summaries


@router.get(
    "/{summary_id}",
    response_model=SummaryResponse
)
def get_summary(
    summary_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    summary = (
        db.query(Summary)
        .join(Transcript)
        .join(Recording)
        .join(Meeting)
        .filter(
            Summary.id == summary_id,
            Meeting.user_id == current_user.id
        )
        .first()
    )

    if not summary:
        raise HTTPException(
            status_code=404,
            detail="Summary not found"
        )

    return summary

@router.post(
    "/transcript/{transcript_id}",
    response_model=SummaryResponse
)
def create_summary(
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

    existing_summary = (
        db.query(Summary)
        .filter(
            Summary.transcript_id == transcript_id
        )
        .first()
    )

    if existing_summary:
        raise HTTPException(
            status_code=400,
            detail="Summary already exists for this transcript"
        )

    summary_data = summarize_transcript(
        transcript.text
    )

    new_summary = Summary(
    transcript_id=transcript.id,
    summary=summary_data["summary"],
    key_points="\n".join(
        summary_data["key_points"]
    ),
    action_items="\n".join(
        summary_data["action_items"]
    ),
    decisions="\n".join(
        summary_data["decisions"]
    )
)

    db.add(new_summary)
    db.commit()
    db.refresh(new_summary)

    return new_summary