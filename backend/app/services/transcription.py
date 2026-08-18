import gc
import os
import shutil
import subprocess
import tempfile

import whisper


def transcribe_audio(
    file_path: str
):
    model = whisper.load_model(
        "tiny",
        device="cpu"
    )

    chunk_directory = tempfile.mkdtemp()

    try:

        chunk_pattern = os.path.join(
            chunk_directory,
            "chunk_%03d.wav"
        )

        print(
            "Splitting audio into 10-minute chunks..."
        )

        subprocess.run(
            [
                "ffmpeg",
                "-i",
                file_path,
                "-f",
                "segment",
                "-segment_time",
                "600",
                "-ar",
                "16000",
                "-ac",
                "1",
                "-c:a",
                "pcm_s16le",
                chunk_pattern
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE
        )

        chunk_files = sorted(
            os.path.join(
                chunk_directory,
                file_name
            )
            for file_name in os.listdir(
                chunk_directory
            )
            if file_name.endswith(".wav")
        )

        if not chunk_files:

            raise RuntimeError(
                "FFmpeg did not create any audio chunks"
            )

        transcripts = []

        total_chunks = len(
            chunk_files
        )

        print(
            f"Created {total_chunks} audio chunks"
        )

        for index, chunk_file in enumerate(
            chunk_files,
            start=1
        ):

            print(
                f"Transcribing chunk {index}/{total_chunks}"
            )

            result = model.transcribe(
                chunk_file,
                fp16=False
            )

            text = result.get(
                "text",
                ""
            ).strip()

            if text:

                transcripts.append(
                    text
                )

        final_transcript = "\n\n".join(
            transcripts
        )

        if not final_transcript:

            raise RuntimeError(
                "Whisper returned an empty transcript"
            )

        print(
            "Audio transcription completed"
        )

        return final_transcript

    finally:

        shutil.rmtree(
            chunk_directory,
            ignore_errors=True
        )

        del model

        gc.collect()