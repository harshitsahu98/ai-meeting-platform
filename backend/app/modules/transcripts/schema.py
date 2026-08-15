from pydantic import BaseModel, ConfigDict


class TranscriptResponse(BaseModel):
    id: int
    recording_id: int
    text: str

    model_config = ConfigDict(
        from_attributes=True
    )