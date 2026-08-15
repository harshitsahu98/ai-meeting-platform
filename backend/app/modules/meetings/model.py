from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255), nullable=False)

    duration = Column(Integer, nullable=False)

    date = Column(DateTime, nullable=False)

    description = Column(Text, nullable=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )
    recordings = relationship(
    "Recording",
    back_populates="meeting",
    cascade="all, delete-orphan"
)