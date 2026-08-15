from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Recording(Base):
    __tablename__ = "recordings"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    meeting_id = Column(
        Integer,
        ForeignKey("meetings.id"),
        nullable=False
    )

    audio_url = Column(
        String(500),
        nullable=False
    )

    status = Column(
        String(30),
        default="pending",
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    meeting = relationship(
        "Meeting",
        back_populates="recordings"
    )

    transcript = relationship(
        "Transcript",
        back_populates="recording",
        uselist=False
    )