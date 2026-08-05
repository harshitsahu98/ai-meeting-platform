from fastapi import FastAPI

from app.core.database import Base, engine
from app.modules.users.model import User

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Meeting Intelligence API",
    version="1.0.0",
)


@app.get("/")
def root():
    return {
        "message": "AI Meeting Intelligence API"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }