from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SummaryResponse(BaseModel):
    id: int
    transcript_id: int
    summary: str
    key_points: str
    action_items: str
    decisions: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)