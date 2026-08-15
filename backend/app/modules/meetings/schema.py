from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MeetingCreate(BaseModel):
    title: str
    duration: int
    date: datetime
    description: str | None = None


class MeetingUpdate(BaseModel):
    title: str | None = None
    duration: int | None = None
    date: datetime | None = None
    description: str | None = None


class MeetingResponse(BaseModel):
    id: int
    title: str
    duration: int
    date: datetime
    description: str | None
    user_id: int

    model_config = ConfigDict(from_attributes=True)