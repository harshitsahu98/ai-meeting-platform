from app.services.transcription import transcribe_audio


audio_path = "uploads/recordings/430dba18-44ae-410d-b88b-55b2e14be3a6.mp3"

text = transcribe_audio(audio_path)

print("\n================ TRANSCRIPT ================\n")
print(text)
print("\n=============================================\n")