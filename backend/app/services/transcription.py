import whisper


model = None


def get_model():
    global model

    if model is None:
        model = whisper.load_model(
            "tiny",
            device="cpu"
        )

    return model


def transcribe_audio(
    file_path: str
):
    transcription_model = get_model()

    result = transcription_model.transcribe(
        file_path,
        fp16=False
    )

    return result["text"]