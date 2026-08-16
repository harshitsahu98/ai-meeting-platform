import re
from collections import Counter


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


def split_sentences(
    text: str
):
    text = text.replace(
        "\n",
        " "
    )

    sentences = re.split(
        r"(?<=[.!?])\s+",
        text
    )

    return [
        sentence.strip()
        for sentence in sentences
        if sentence.strip()
    ]


def score_sentence(
    sentence: str,
    word_frequency
):
    words = re.findall(
        r"\b[a-zA-Z]{3,}\b",
        sentence.lower()
    )

    if not words:
        return 0

    score = sum(
        word_frequency.get(
            word,
            0
        )
        for word in words
    )

    return score / len(words)


def extractive_summary(
    text: str,
    max_sentences: int = 5
):
    sentences = split_sentences(text)

    if not sentences:
        return ""

    words = re.findall(
        r"\b[a-zA-Z]{3,}\b",
        text.lower()
    )

    stop_words = {
        "the",
        "and",
        "that",
        "this",
        "with",
        "from",
        "have",
        "will",
        "were",
        "been",
        "they",
        "their",
        "there",
        "about",
        "would",
        "could",
        "should",
        "which",
        "what",
        "when",
        "where",
        "into",
        "than",
        "then",
        "also",
        "just",
        "very",
        "some",
        "more",
        "your",
        "you",
        "our",
        "are",
        "for",
        "not",
        "but",
        "was",
        "has",
        "had",
        "its",
        "it's"
    }

    useful_words = [
        word
        for word in words
        if word not in stop_words
    ]

    frequency = Counter(
        useful_words
    )

    scored_sentences = []

    for index, sentence in enumerate(
        sentences
    ):
        score = score_sentence(
            sentence,
            frequency
        )

        scored_sentences.append(
            (
                score,
                index,
                sentence
            )
        )

    scored_sentences.sort(
        reverse=True
    )

    selected = scored_sentences[
        :max_sentences
    ]

    selected.sort(
        key=lambda item: item[1]
    )

    return " ".join(
        item[2]
        for item in selected
    )


def extract_sentences(
    text: str,
    keywords
):
    sentences = []

    for sentence in split_sentences(
        text
    ):
        sentence_lower = (
            sentence.lower()
        )

        for keyword in keywords:

            if keyword.lower() in sentence_lower:

                if sentence not in sentences:
                    sentences.append(
                        sentence
                    )

                break

    return sentences


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

    summary = extractive_summary(
        transcript_text,
        max_sentences=6
    )

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

    return {
        "summary": summary,
        "key_points": key_points,
        "action_items": action_items,
        "decisions": decisions
    }