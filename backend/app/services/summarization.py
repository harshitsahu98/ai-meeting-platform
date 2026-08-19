import json
import os

from dotenv import load_dotenv
from groq import Groq


load_dotenv()


def summarize_transcript(
    transcript_text: str
):
    if (
        not transcript_text
        or not transcript_text.strip()
    ):
        return {
            "summary": "",
            "key_points": [],
            "action_items": [],
            "decisions": []
        }

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

    prompt = f"""
You are an expert meeting intelligence assistant.

Analyze the following meeting transcript and produce a concise,
accurate and useful meeting summary.

IMPORTANT RULES:

1. Do not invent information.
2. Only use information explicitly present in the transcript.
3. Keep the summary concise but informative.
4. Extract the most important discussion points.
5. Extract concrete action items.
6. Extract decisions that were actually made.
7. If there are no action items, return an empty array.
8. If there are no decisions, return an empty array.
9. Return ONLY valid JSON.
10. Do not include markdown or code fences.

Return exactly this structure:

{{
    "summary": "A concise summary of the meeting.",
    "key_points": [
        "Important point 1",
        "Important point 2"
    ],
    "action_items": [
        "Action item 1",
        "Action item 2"
    ],
    "decisions": [
        "Decision 1",
        "Decision 2"
    ]
}}

MEETING TRANSCRIPT:

{transcript_text}
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a professional meeting "
                    "analysis assistant. "
                    "Return accurate structured JSON."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2,
        response_format={
            "type": "json_object"
        }
    )

    content = (
        response.choices[0]
        .message
        .content
    )

    if not content:

        raise RuntimeError(
            "Groq returned an empty summary"
        )

    try:

        result = json.loads(
            content
        )

    except json.JSONDecodeError as error:

        raise RuntimeError(
            "Groq returned invalid JSON"
        ) from error

    return {
        "summary": result.get(
            "summary",
            ""
        ),
        "key_points": result.get(
            "key_points",
            []
        ),
        "action_items": result.get(
            "action_items",
            []
        ),
        "decisions": result.get(
            "decisions",
            []
        )
    }