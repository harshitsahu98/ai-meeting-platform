import gc
import os
import shutil
import subprocess
import tempfile

from faster_whisper import WhisperModel


def transcribe_audio(
    file_path: str
):
    chunk_directory = tempfile.mkdtemp()

    model = None

    try:

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

        print(
            "Loading faster-whisper tiny INT8 model..."
        )

        model = WhisperModel(
            "tiny",
            device="cpu",
            compute_type="int8",
            cpu_threads=1,
            num_workers=1
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

            segments, info = model.transcribe(
                chunk_file,
                beam_size=1,
                condition_on_previous_text=False
            )

            chunk_text = " ".join(
                segment.text.strip()
                for segment in segments
                if segment.text.strip()
            )

            if chunk_text:

                transcripts.append(
                    chunk_text
                )

            gc.collect()

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

        if model is not None:

            del model

        gc.collect()

        shutil.rmtree(
            chunk_directory,
            ignore_errors=True
        )

        gc.collect()