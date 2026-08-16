FROM python:3.12-slim

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements-full.txt ./requirements-full.txt

RUN pip install --no-cache-dir \
    --index-url https://download.pytorch.org/whl/cpu \
    torch

RUN pip install --no-cache-dir \
    -r requirements-full.txt

COPY backend ./backend

WORKDIR /app/backend

CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT}