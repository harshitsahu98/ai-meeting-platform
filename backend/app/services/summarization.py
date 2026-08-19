import json
import os

from dotenv import load_dotenv
from groq import Groq


load_dotenv()


MODEL_NAME = "openai/gpt-oss-120b"

MAX_WORDS_PER_CHUNK = 2500


def split_transcript(
    text: str,
    max_words: int = MAX_WORDS_PER_CHUNK
):
    words = text.split()

    chunks = []

    for i in range(
        0,
        len(words),
        max_words
    ):
        chunk = " ".join(
            words[i:i + max_words]
        )

        if chunk.strip():
            chunks.append(
                chunk
            )

    return chunks


def call_groq(
    client: Groq,
    prompt: str
):
    response = client.chat.completions.create(
        model=MODEL_NAME,
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
            "Groq returned an empty response"
        )

    try:

        return json.loads(
            content
        )

    except json.JSONDecodeError as error:

        raise RuntimeError(
            "Groq returned invalid JSON"
        ) from error


def summarize_chunk(
    client: Groq,
    transcript_chunk: str
):
    prompt = f"""
You are analyzing one section of a meeting transcript.

Extract ONLY information explicitly present
in the transcript.

Do not invent information.

Return ONLY valid JSON.

Return exactly:

{{
    "summary": "Concise summary of this section.",
    "key_points": [],
    "action_items": [],
    "decisions": []
}}

TRANSCRIPT SECTION:

{transcript_chunk}
"""

    return call_groq(
        client,
        prompt
    )


def combine_summaries(
    client: Groq,
    summaries
):
    combined_text = "\n\n".join(
        f"""
SECTION {index}:

Summary:
{summary.get("summary", "")}

Key points:
{json.dumps(summary.get("key_points", []))}

Action items:
{json.dumps(summary.get("action_items", []))}

Decisions:
{json.dumps(summary.get("decisions", []))}
"""
        for index, summary in enumerate(
            summaries,
            start=1
        )
    )

    prompt = f"""
You are the final meeting intelligence assistant.

Combine the following section analyses into
one accurate final meeting analysis.

IMPORTANT RULES:

1. Do not invent information.
2. Remove duplicate information.
3. Preserve important details.
4. Combine related key points.
5. Combine related action items.
6. Combine related decisions.
7. Keep the final summary concise.
8. Only use information contained in the section analyses.
9. Return ONLY valid JSON.
10. Do not use markdown.

Return exactly:

{{
    "summary": "A concise overall meeting summary.",
    "key_points": [
        "Important point 1"
    ],
    "action_items": [
        "Action item 1"
    ],
    "decisions": [
        "Decision 1"
    ]
}}

SECTION ANALYSES:

{combined_text}
"""

    return call_groq(
        client,
        prompt
    )


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

    transcript_chunks = split_transcript(
        transcript_text
    )

    print(
        f"Transcript split into "
        f"{len(transcript_chunks)} summarization chunks"
    )

    summaries = []

    for index, chunk in enumerate(
        transcript_chunks,
        start=1
    ):

        print(
            f"Summarizing chunk "
            f"{index}/{len(transcript_chunks)}"
        )

        summary = summarize_chunk(
            client,
            chunk
        )

        summaries.append(
            summary
        )

    if len(summaries) == 1:

        result = summaries[0]

    else:

        print(
            "Combining chunk summaries..."
        )

        result = combine_summaries(
            client,
            summaries
        )

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