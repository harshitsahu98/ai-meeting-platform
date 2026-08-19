import os
import shutil
import subprocess
import tempfile

from dotenv import load_dotenv
from groq import Groq


load_dotenv()

def transcribe_audio(
    file_path: str
):
    chunk_directory = tempfile.mkdtemp()

    try:

        groq_api_key = os.getenv(
            "GROQ_API_KEY"
        )

        if not groq_api_key:

            raise RuntimeError(
                "GROQ_API_KEY is not configured"
            )

        client = Groq(
            api_key=groq_api_key
        )

        chunk_pattern = os.path.join(
            chunk_directory,
            "chunk_%03d.wav"
        )

        print(
            "Splitting audio into 5-minute chunks..."
        )

        subprocess.run(
            [
                "ffmpeg",
                "-i",
                file_path,
                "-f",
                "segment",
                "-segment_time",
                "300",
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

        print(
            f"Created {len(chunk_files)} audio chunks"
        )

        transcripts = []

        total_chunks = len(
            chunk_files
        )

        for index, chunk_file in enumerate(
            chunk_files,
            start=1
        ):

            print(
                f"Transcribing chunk {index}/{total_chunks}"
            )

            with open(
                chunk_file,
                "rb"
            ) as audio_file:

                transcription = (
                    client.audio.transcriptions.create(
                        file=audio_file,
                        model="whisper-large-v3-turbo",
                        response_format="text"
                    )
                )

            chunk_text = str(
                transcription
            ).strip()

            if chunk_text:

                transcripts.append(
                    chunk_text
                )

            print(
                f"Completed chunk {index}/{total_chunks}"
            )

        final_transcript = "\n\n".join(
            transcripts
        )

        if not final_transcript:

            raise RuntimeError(
                "Groq Whisper returned an empty transcript"
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