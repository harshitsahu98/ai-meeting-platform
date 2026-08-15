from datetime import datetime

from pydantic import BaseModel, ConfigDict


class RecordingCreate(BaseModel):
    meeting_id: int
    audio_url: str


class RecordingResponse(BaseModel):
    id: int
    meeting_id: int
    audio_url: str
    status: str
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )