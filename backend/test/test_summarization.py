from app.services.summarization import summarize_transcript


transcript = """
Hi everyone. Today we discussed the development of our AI meeting platform.
The backend authentication system has been completed and users can register
and log in successfully. The meeting module is also working, and users can
create, view, and delete their meetings.

We also completed the recording system. Users can upload audio recordings
and associate them with meetings. Whisper is being used locally to convert
the audio into text. The transcription process was successfully tested with
a sample audio file.

The team decided that the next step is to build an AI summarization feature.
The system should generate a concise meeting summary, identify important key
points, extract action items, and identify decisions made during the meeting.

The backend developer will implement the summarization API. The frontend
developer will later create the interface for displaying summaries and action
items. The team also agreed to keep the AI processing local for now so that
the project does not depend on paid API credits.
"""


summary = summarize_transcript(transcript)


print("\n================ SUMMARY ================\n")
print(summary)
print("\n=========================================\n")