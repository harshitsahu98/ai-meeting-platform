from sqlalchemy import Column, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class Transcript(Base):
    __tablename__ = "transcripts"

    id = Column(Integer, primary_key=True, index=True)

    recording_id = Column(
        Integer,
        ForeignKey("recordings.id"),
        nullable=False
    )

    text = Column(
        Text,
        nullable=False
    )

    recording = relationship(
        "Recording",
        back_populates="transcript"
    )

    summary = relationship(
    "Summary",
    back_populates="transcript",
    uselist=False
)