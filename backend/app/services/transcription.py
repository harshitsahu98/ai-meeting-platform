import gc
import whisper


def transcribe_audio(
    file_path: str
):
    model = whisper.load_model(
        "tiny",
        device="cpu"
    )

    try:
        result = model.transcribe(
            file_path,
            fp16=False
        )

        return result["text"]

    finally:
        del model
        gc.collect()