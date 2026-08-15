import re

from transformers import (
    AutoTokenizer,
    AutoModelForSeq2SeqLM
)


MODEL_NAME = "facebook/bart-large-cnn"


tokenizer = AutoTokenizer.from_pretrained(
    MODEL_NAME
)

model = AutoModelForSeq2SeqLM.from_pretrained(
    MODEL_NAME
)


def summarize_text(text: str):
    if not text or not text.strip():
        return ""

    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        max_length=1024
    )

    summary_ids = model.generate(
        inputs["input_ids"],
        max_length=150,
        min_length=40,
        num_beams=4,
        early_stopping=True
    )

    return tokenizer.decode(
        summary_ids[0],
        skip_special_tokens=True
    )


def split_into_chunks(
    text: str,
    chunk_size: int = 700
):
    words = text.split()

    chunks = []

    for i in range(
        0,
        len(words),
        chunk_size
    ):
        chunk = " ".join(
            words[i:i + chunk_size]
        )

        if chunk.strip():
            chunks.append(chunk)

    return chunks


def extract_sentences(
    text: str,
    keywords
):
    sentences = []

    text = text.replace(
        "\n",
        " "
    )

    raw_sentences = re.split(
        r"(?<=[.!?])\s+",
        text
    )

    for sentence in raw_sentences:

        sentence = sentence.strip()

        if not sentence:
            continue

        sentence_lower = sentence.lower()

        for keyword in keywords:

            if keyword.lower() in sentence_lower:

                if sentence not in sentences:
                    sentences.append(sentence)

                break

    return sentences


def summarize_transcript(
    transcript_text: str
):
    if not transcript_text or not transcript_text.strip():
        return {
            "summary": "",
            "key_points": [],
            "action_items": [],
            "decisions": []
        }


    # =====================================
    # STEP 1: Split transcript
    # =====================================

    chunks = split_into_chunks(
        transcript_text
    )


    # =====================================
    # STEP 2: Summarize each chunk
    # =====================================

    chunk_summaries = []

    for chunk in chunks:

        summary = summarize_text(
            chunk
        )

        if summary:
            chunk_summaries.append(
                summary
            )


    # =====================================
    # STEP 3: Create final summary
    # =====================================

    combined_summary = " ".join(
        chunk_summaries
    )


    if not combined_summary:
        final_summary = ""

    elif len(chunk_summaries) == 1:

        final_summary = combined_summary

    else:

        final_summary = summarize_text(
            combined_summary
        )


    # =====================================
    # STEP 4: Extract key points
    # =====================================

    key_points = extract_sentences(
        transcript_text,
        [
            "important",
            "discussed",
            "discuss",
            "agreed",
            "decided",
            "issue",
            "problem",
            "goal",
            "plan",
            "next step",
            "priority",
            "concern"
        ]
    )


    # =====================================
    # STEP 5: Extract action items
    # =====================================

    action_items = extract_sentences(
        transcript_text,
        [
            "will",
            "need to",
            "needs to",
            "should",
            "must",
            "action",
            "todo",
            "to-do",
            "follow up",
            "follow-up",
            "responsible",
            "assigned",
            "complete",
            "finish"
        ]
    )


    # =====================================
    # STEP 6: Extract decisions
    # =====================================

    decisions = extract_sentences(
        transcript_text,
        [
            "decided",
            "decision",
            "agreed",
            "approved",
            "chosen",
            "choose",
            "select",
            "selected",
            "confirmed",
            "finalized"
        ]
    )


    # =====================================
    # STEP 7: Return AI analysis
    # =====================================

    return {
        "summary": final_summary,
        "key_points": key_points,
        "action_items": action_items,
        "decisions": decisions
    }