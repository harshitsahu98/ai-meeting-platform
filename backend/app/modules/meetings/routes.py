from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.auth.dependencies import get_current_user

from app.modules.meetings.model import Meeting
from app.modules.meetings.schema import (
    MeetingCreate,
    MeetingResponse,
    MeetingUpdate,
)

from app.modules.recordings.model import Recording
from app.modules.transcripts.model import Transcript
from app.modules.summary.model import Summary

from app.modules.users.model import User


router = APIRouter(
    prefix="/meetings",
    tags=["Meetings"]
)


@router.post("/", response_model=MeetingResponse)
def create_meeting(
    meeting: MeetingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_meeting = Meeting(
        title=meeting.title,
        duration=meeting.duration,
        date=meeting.date,
        description=meeting.description,
        user_id=current_user.id
    )

    db.add(new_meeting)
    db.commit()
    db.refresh(new_meeting)

    return new_meeting


@router.get("/", response_model=List[MeetingResponse])
def get_meetings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meetings = (
        db.query(Meeting)
        .filter(
            Meeting.user_id == current_user.id
        )
        .all()
    )

    return meetings


@router.get(
    "/{meeting_id}",
    response_model=MeetingResponse
)
def get_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meeting = (
        db.query(Meeting)
        .filter(
            Meeting.id == meeting_id,
            Meeting.user_id == current_user.id
        )
        .first()
    )

    if not meeting:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found"
        )

    return meeting


@router.put(
    "/{meeting_id}",
    response_model=MeetingResponse
)
def update_meeting(
    meeting_id: int,
    meeting: MeetingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing_meeting = (
        db.query(Meeting)
        .filter(
            Meeting.id == meeting_id,
            Meeting.user_id == current_user.id
        )
        .first()
    )

    if not existing_meeting:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found"
        )

    if meeting.title is not None:
        existing_meeting.title = meeting.title

    if meeting.duration is not None:
        existing_meeting.duration = meeting.duration

    if meeting.date is not None:
        existing_meeting.date = meeting.date

    if meeting.description is not None:
        existing_meeting.description = meeting.description

    db.commit()
    db.refresh(existing_meeting)

    return existing_meeting


@router.delete("/{meeting_id}")
def delete_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # =========================================
    # STEP 1: Find meeting owned by user
    # =========================================

    meeting = (
        db.query(Meeting)
        .filter(
            Meeting.id == meeting_id,
            Meeting.user_id == current_user.id
        )
        .first()
    )

    if not meeting:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found"
        )


    # =========================================
    # STEP 2: Find recordings
    # =========================================

    recordings = (
        db.query(Recording)
        .filter(
            Recording.meeting_id == meeting.id
        )
        .all()
    )


    # =========================================
    # STEP 3: Delete summaries and transcripts
    # =========================================

    for recording in recordings:

        transcripts = (
            db.query(Transcript)
            .filter(
                Transcript.recording_id ==
                recording.id
            )
            .all()
        )

        for transcript in transcripts:

            summaries = (
                db.query(Summary)
                .filter(
                    Summary.transcript_id ==
                    transcript.id
                )
                .all()
            )

            for summary in summaries:
                db.delete(summary)

            db.delete(transcript)


    # =========================================
    # STEP 4: Delete recordings
    # =========================================

    for recording in recordings:
        db.delete(recording)


    # =========================================
    # STEP 5: Delete meeting
    # =========================================

    db.delete(meeting)


    # =========================================
    # STEP 6: Commit everything
    # =========================================

    try:
        db.commit()

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to delete meeting"
        )


    return {
        "message": "Meeting deleted successfully"
    }