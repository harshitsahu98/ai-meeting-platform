import os
import uuid

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    HTTPException,
    UploadFile,
    File
)
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.core.database import get_db
from app.modules.meetings.model import Meeting
from app.modules.recordings.model import Recording
from app.modules.recordings.schema import RecordingResponse
from app.modules.recordings.schema import RecordingCreate
from app.modules.users.model import User
from typing import List
from app.modules.transcripts.model import Transcript
from app.services.transcription import transcribe_audio
from app.core.database import SessionLocal
from app.modules.summary.model import Summary
from app.services.summarization import summarize_transcript

router = APIRouter(
    prefix="/recordings",
    tags=["Recordings"]

)

def process_recording(recording_id: int):
    db = SessionLocal()

    try:
        recording = (
            db.query(Recording)
            .filter(
                Recording.id == recording_id
            )
            .first()
        )

        if not recording:
            return

        # -------------------------
        # TRANSCRIPTION
        # -------------------------

        recording.status = "transcribing"
        db.commit()

        transcript_text = transcribe_audio(
            recording.audio_url
        )

        transcript = Transcript(
            recording_id=recording.id,
            text=transcript_text
        )

        db.add(transcript)
        db.commit()
        db.refresh(transcript)

        # -------------------------
        # SUMMARIZATION
        # -------------------------

        recording.status = "summarizing"
        db.commit()

        summary_data = summarize_transcript(
            transcript.text
        )

        summary = Summary(
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

        db.add(summary)

        # -------------------------
        # COMPLETED
        # -------------------------

        recording.status = "completed"

        db.commit()

    except Exception:
        db.rollback()

        recording = (
            db.query(Recording)
            .filter(
                Recording.id == recording_id
            )
            .first()
        )

        if recording:
            recording.status = "failed"
            db.commit()

    finally:
        db.close()


@router.post("/", response_model=RecordingResponse)
def create_recording(
    recording: RecordingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meeting = (
        db.query(Meeting)
        .filter(
            Meeting.id == recording.meeting_id,
            Meeting.user_id == current_user.id
        )
        .first()
    )

    if not meeting:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found"
        )

    new_recording = Recording(
        meeting_id=recording.meeting_id,
        audio_url=recording.audio_url
    )

    db.add(new_recording)
    db.commit()
    db.refresh(new_recording)

    return new_recording

@router.get("/", response_model=List[RecordingResponse])
def get_recordings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    recordings = (
        db.query(Recording)
        .join(Meeting)
        .filter(Meeting.user_id == current_user.id)
        .all()
    )

    return recordings

@router.get("/{recording_id}", response_model=RecordingResponse)
def get_recording(
    recording_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    recording = (
        db.query(Recording)
        .join(Meeting)
        .filter(
            Recording.id == recording_id,
            Meeting.user_id == current_user.id
        )
        .first()
    )

    if not recording:
        raise HTTPException(
            status_code=404,
            detail="Recording not found"
        )

    return recording

@router.delete("/{recording_id}")
def delete_recording(
    recording_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    recording = (
        db.query(Recording)
        .join(Meeting)
        .filter(
            Recording.id == recording_id,
            Meeting.user_id == current_user.id
        )
        .first()
    )

    if not recording:
        raise HTTPException(
            status_code=404,
            detail="Recording not found"
        )

    try:
        # Find all transcripts belonging to this recording
        transcripts = (
            db.query(Transcript)
            .filter(
                Transcript.recording_id == recording.id
            )
            .all()
        )

        # Delete summaries belonging to those transcripts
        for transcript in transcripts:
            db.query(Summary).filter(
                Summary.transcript_id == transcript.id
            ).delete(
                synchronize_session=False
            )

        # Delete transcripts before deleting the recording
        for transcript in transcripts:
            db.delete(transcript)

        db.flush()

        # Delete the recording
        db.delete(recording)

        db.commit()

        return {
            "message": "Recording deleted successfully"
        }

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to delete recording"
        )

@router.post("/upload", response_model=RecordingResponse)
def upload_recording(
    meeting_id: int,
    audio_file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None,
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

    upload_directory = "uploads/recordings"

    os.makedirs(upload_directory, exist_ok=True)

    file_extension = os.path.splitext(audio_file.filename)[1]

    file_name = f"{uuid.uuid4()}{file_extension}"

    file_path = os.path.join(
        upload_directory,
        file_name
    )

    with open(file_path, "wb") as file:
        file.write(audio_file.file.read())

    new_recording = Recording(
        meeting_id=meeting_id,
        audio_url=file_path,
        status="pending"
    )

    db.add(new_recording)
    db.commit()
    db.refresh(new_recording)

    background_tasks.add_task(
    process_recording,
    new_recording.id
)

    return new_recording

@router.post("/{recording_id}/transcribe")
def transcribe_recording(
    recording_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # =====================================
    # STEP 1: Find recording
    # =====================================

    recording = (
        db.query(Recording)
        .join(Meeting)
        .filter(
            Recording.id == recording_id,
            Meeting.user_id == current_user.id
        )
        .first()
    )


    if not recording:
        raise HTTPException(
            status_code=404,
            detail="Recording not found"
        )


    # =====================================
    # STEP 2: Transcribe audio
    # =====================================

    transcript_text = transcribe_audio(
        recording.audio_url
    )


    # =====================================
    # STEP 3: Create transcript
    # =====================================

    new_transcript = Transcript(
        recording_id=recording.id,
        text=transcript_text
    )

    db.add(new_transcript)
    db.commit()
    db.refresh(new_transcript)


    # =====================================
    # STEP 4: Generate AI analysis
    # =====================================

    ai_result = summarize_transcript(
        transcript_text
    )


    # =====================================
    # STEP 5: Convert lists to database text
    # =====================================

    key_points_text = "\n".join(
        ai_result["key_points"]
    )

    action_items_text = "\n".join(
        ai_result["action_items"]
    )

    decisions_text = "\n".join(
        ai_result["decisions"]
    )


    # =====================================
    # STEP 6: Create Summary
    # =====================================

    new_summary = Summary(
        transcript_id=new_transcript.id,
        summary=ai_result["summary"],
        key_points=key_points_text,
        action_items=action_items_text,
        decisions=decisions_text
    )


    db.add(new_summary)
    db.commit()
    db.refresh(new_summary)


    # =====================================
    # STEP 7: Return transcript + AI data
    # =====================================

    return {
        "transcript": {
            "id": new_transcript.id,
            "recording_id": new_transcript.recording_id,
            "text": new_transcript.text
        },
        "summary": {
            "id": new_summary.id,
            "transcript_id": new_summary.transcript_id,
            "summary": new_summary.summary,
            "key_points": new_summary.key_points,
            "action_items": new_summary.action_items,
            "decisions": new_summary.decisions
        }
    }