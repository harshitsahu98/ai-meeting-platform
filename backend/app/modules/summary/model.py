from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class Summary(Base):
    __tablename__ = "summaries"

    id = Column(Integer, primary_key=True, index=True)

    transcript_id = Column(
        Integer,
        ForeignKey("transcripts.id"),
        nullable=False,
        unique=True
    )

    summary = Column(
        Text,
        nullable=False
    )

    key_points = Column(
        Text,
        nullable=False
    )

    action_items = Column(
        Text,
        nullable=False
    )

    decisions = Column(
        Text,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    transcript = relationship(
        "Transcript",
        back_populates="summary"
    )