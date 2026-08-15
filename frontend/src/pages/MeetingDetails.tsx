import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

import {
  getMeetings,
  getRecordings,
  deleteRecording,
  uploadRecording,
  transcribeRecording,
  type Meeting,
  type Recording,
  type Transcript,
  type Summary,
} from "../services/api"


interface TranscriptionResult {
  transcript: Transcript
  summary: Summary
}


const MeetingDetails = () => {
  const { meetingId } = useParams<{
    meetingId: string
  }>()

  const [meeting, setMeeting] =
    useState<Meeting | null>(null)

  const [recordings, setRecordings] =
    useState<Recording[]>([])

  const [selectedRecording, setSelectedRecording] =
    useState<Recording | null>(null)

  const [transcript, setTranscript] =
    useState<Transcript | null>(null)

  const [summary, setSummary] =
    useState<Summary | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [uploading, setUploading] =
    useState(false)

  const [processing, setProcessing] =
    useState(false)

  const [deleting, setDeleting] =
    useState(false)

  const [error, setError] =
    useState("")


  // =========================================
  // Load meeting + recordings
  // =========================================

  const loadMeetingData = async () => {
    if (!meetingId) {
      setError("Meeting ID is missing")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError("")

      const meetingIdNumber =
        Number(meetingId)

      const meetings =
        await getMeetings()

      const meetingData =
        meetings.find(
          (item) =>
            item.id === meetingIdNumber
        )

      if (!meetingData) {
        throw new Error(
          "Meeting not found"
        )
      }

      const recordingData =
        await getRecordings()

      const meetingRecordings =
        recordingData.filter(
          (recording) =>
            recording.meeting_id ===
            meetingIdNumber
        )

      setMeeting(meetingData)
      setRecordings(meetingRecordings)

      if (
        meetingRecordings.length > 0
      ) {
        setSelectedRecording(
          (current) =>
            current ||
            meetingRecordings[0]
        )
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load meeting"
      )
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    loadMeetingData()
  }, [meetingId])


  // =========================================
  // Poll recording status
  // =========================================

  useEffect(() => {
    if (!selectedRecording) {
      return
    }

    const activeStatuses = [
      "pending",
      "transcribing",
      "summarizing",
    ]

    if (
      !activeStatuses.includes(
        selectedRecording.status
      )
    ) {
      return
    }

    const interval = setInterval(
      async () => {
        try {
          const recordingData =
            await getRecordings()

          const updatedRecording =
            recordingData.find(
              (recording) =>
                recording.id ===
                selectedRecording.id
            )

          if (!updatedRecording) {
            return
          }

          setRecordings(
            (currentRecordings) =>
              currentRecordings.map(
                (recording) =>
                  recording.id ===
                    updatedRecording.id
                    ? updatedRecording
                    : recording
              )
          )

          setSelectedRecording(
            updatedRecording
          )

          if (
            updatedRecording.status ===
            "completed"
          ) {
            clearInterval(interval)
          }

          if (
            updatedRecording.status ===
            "failed"
          ) {
            setError(
              "Recording processing failed."
            )

            clearInterval(interval)
          }
        } catch {
          // Keep polling silently.
        }
      },
      3000
    )

    return () => {
      clearInterval(interval)
    }
  }, [
    selectedRecording?.id,
    selectedRecording?.status,
  ])


  // =========================================
  // Upload recording
  // =========================================

  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0]

    if (!file || !meetingId) {
      return
    }

    try {
      setUploading(true)
      setError("")

      const newRecording =
        await uploadRecording(
          Number(meetingId),
          file
        )

      setRecordings(
        (currentRecordings) => [
          newRecording,
          ...currentRecordings,
        ]
      )

      setSelectedRecording(
        newRecording
      )

      setTranscript(null)
      setSummary(null)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to upload recording"
      )
    } finally {
      setUploading(false)
      event.target.value = ""
    }
  }


  // =========================================
  // Delete recording
  // =========================================

  const handleDelete = async (
    recordingId: number
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this recording?"
      )

    if (!confirmed) {
      return
    }

    try {
      setDeleting(true)
      setError("")

      await deleteRecording(
        recordingId
      )

      setRecordings(
        (currentRecordings) =>
          currentRecordings.filter(
            (recording) =>
              recording.id !==
              recordingId
          )
      )

      if (
        selectedRecording?.id ===
        recordingId
      ) {
        setSelectedRecording(null)
        setTranscript(null)
        setSummary(null)
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete recording"
      )
    } finally {
      setDeleting(false)
    }
  }


  // =========================================
  // Transcribe + Analyze
  // =========================================

  const handleTranscribe = async () => {
    if (!selectedRecording) {
      return
    }

    try {
      setProcessing(true)
      setError("")

      const result =
        await transcribeRecording(
          selectedRecording.id
        )

      /*
       * Backend returns:
       *
       * {
       *   transcript: {...},
       *   summary: {...}
       * }
       *
       * The current api.ts may still type
       * this function as Transcript.
       */

      const analysis =
        result as unknown as TranscriptionResult

      setTranscript(
        analysis.transcript
      )

      setSummary(
        analysis.summary
      )

      setRecordings(
        (currentRecordings) =>
          currentRecordings.map(
            (recording) =>
              recording.id ===
                selectedRecording.id
                ? {
                  ...recording,
                  status:
                    "completed",
                }
                : recording
          )
      )

      setSelectedRecording(
        (current) =>
          current
            ? {
              ...current,
              status:
                "completed",
            }
            : null
      )
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to process recording"
      )
    } finally {
      setProcessing(false)
    }
  }


  // =========================================
  // Status classes
  // =========================================

  const getStatusClasses = (
    status: string
  ) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700"

      case "transcribing":
        return "bg-blue-100 text-blue-700"

      case "summarizing":
        return "bg-purple-100 text-purple-700"

      case "failed":
        return "bg-red-100 text-red-700"

      case "pending":
      default:
        return "bg-yellow-100 text-yellow-700"
    }
  }


  // =========================================
  // Status label
  // =========================================

  const getStatusLabel = (
    status: string
  ) => {
    switch (status) {
      case "completed":
        return "Completed"

      case "transcribing":
        return "Transcribing"

      case "summarizing":
        return "Summarizing"

      case "failed":
        return "Failed"

      case "pending":
        return "Pending"

      default:
        return status
    }
  }


  // =========================================
  // Loading
  // =========================================

  if (loading) {
    return (
      <main className="flex-1 p-8">
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">
            Loading meeting...
          </p>
        </div>
      </main>
    )
  }


  // =========================================
  // Meeting not found
  // =========================================

  if (!meeting) {
    return (
      <main className="flex-1 p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-700">
            {error || "Meeting not found"}
          </p>

          <Link
            to="/meetings"
            className="mt-4 inline-block text-sm font-semibold text-blue-600"
          >
            ← Back to Meetings
          </Link>
        </div>
      </main>
    )
  }


  return (
    <main className="flex-1 p-8">

      {/* Header */}

      <div className="mb-8">

        <Link
          to="/meetings"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Meetings
        </Link>

        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

          <div>

            <p className="text-sm font-medium text-blue-600">
              Meeting #{meeting.id}
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              {meeting.title}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {meeting.description ||
                "No description provided."}
            </p>

          </div>


          <div className="grid grid-cols-2 gap-3">

            <div className="rounded-lg border border-slate-200 bg-white px-5 py-3">

              <p className="text-xs text-slate-500">
                Duration
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {meeting.duration} min
              </p>

            </div>


            <div className="rounded-lg border border-slate-200 bg-white px-5 py-3">

              <p className="text-xs text-slate-500">
                Date
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {new Date(
                  meeting.date
                ).toLocaleDateString()}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* Error */}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}


      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_1fr]">

        {/* Recordings */}

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="font-semibold text-slate-900">
                Recordings
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {recordings.length} recording
                {recordings.length !== 1
                  ? "s"
                  : ""}
              </p>

            </div>


            <label className="cursor-pointer rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800">

              {uploading
                ? "Uploading..."
                : "+ Upload"}

              <input
                type="file"
                accept="audio/mpeg,audio/wav,audio/x-wav"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />

            </label>

          </div>


          {recordings.length === 0 ? (

            <div className="mt-6 rounded-lg border border-dashed border-slate-300 p-6 text-center">

              <div className="text-3xl">
                🎙️
              </div>

              <p className="mt-3 text-sm font-medium text-slate-700">
                No recordings
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Upload an audio recording to begin.
              </p>

            </div>

          ) : (

            <div className="mt-5 space-y-3">

              {recordings.map(
                (recording) => (

                  <div
                    key={recording.id}
                    className={`rounded-lg border p-4 transition ${selectedRecording?.id ===
                        recording.id
                        ? "border-blue-300 bg-blue-50"
                        : "border-slate-200 bg-white"
                      }`}
                  >

                    <button
                      onClick={() => {
                        setSelectedRecording(
                          recording
                        )

                        setTranscript(null)
                        setSummary(null)
                      }}
                      className="w-full text-left"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold text-slate-900">
                            Recording #{recording.id}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Uploaded{" "}
                            {new Date(
                              recording.created_at
                            ).toLocaleString()}
                          </p>

                        </div>


                        <span
                          className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${getStatusClasses(
                            recording.status
                          )}`}
                        >
                          {getStatusLabel(
                            recording.status
                          )}
                        </span>

                      </div>

                    </button>

                    <audio
                      controls
                      preload="metadata"
                      className="mt-4 w-full"
                      src={`http://127.0.0.1:8000/${recording.audio_url}`}
                      onError={() => {
                        setError(
                          "Unable to play this recording."
                        )
                      }}
                    >
                      Your browser does not support audio playback.
                    </audio>


                    <div className="mt-3 flex items-center justify-between">

                      <p className="text-[11px] text-slate-400">
                        ID: {recording.id}
                      </p>


                      <button
                        onClick={() =>
                          handleDelete(
                            recording.id
                          )
                        }
                        disabled={deleting}
                        className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        {deleting
                          ? "Deleting..."
                          : "Delete"}
                      </button>

                    </div>

                  </div>
                )
              )}

            </div>

          )}

        </section>


        {/* Main Content */}

        <section className="space-y-6">

          {/* Selected recording */}

          {selectedRecording && (

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                    Selected recording
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-slate-900">
                    Recording #{selectedRecording.id}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Uploaded{" "}
                    {new Date(
                      selectedRecording.created_at
                    ).toLocaleString()}
                  </p>

                  <div className="mt-3">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                        selectedRecording.status
                      )}`}
                    >
                      {getStatusLabel(
                        selectedRecording.status
                      )}
                    </span>

                  </div>

                </div>


                <div className="flex gap-3">

                  {selectedRecording.status ===
                    "completed" && (

                      <button
                        onClick={
                          handleTranscribe
                        }
                        disabled={processing}
                        className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {processing
                          ? "Analyzing..."
                          : "View Analysis"}
                      </button>
                    )}


                  {(selectedRecording.status ===
                    "pending" ||
                    selectedRecording.status ===
                    "failed") && (

                      <button
                        onClick={
                          handleTranscribe
                        }
                        disabled={processing}
                        className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {processing
                          ? "Processing..."
                          : "Transcribe & Analyze"}
                      </button>
                    )}

                </div>

              </div>


              {(selectedRecording.status ===
                "transcribing" ||
                selectedRecording.status ===
                "summarizing") && (

                  <div className="mt-5 rounded-lg bg-slate-50 px-4 py-3">

                    <p className="text-sm font-medium text-slate-700">
                      {selectedRecording.status ===
                        "transcribing"
                        ? "🎙️ Transcribing your recording..."
                        : "✨ Generating AI insights..."}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      This page will update automatically when processing finishes.
                    </p>

                  </div>
                )}

            </div>
          )}


          {/* Empty state */}

          {!selectedRecording && (

            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">

              <div className="text-4xl">
                🎙️
              </div>

              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                Upload a recording
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Upload an audio recording to generate your meeting intelligence.
              </p>

            </div>
          )}


          {/* Transcript */}

          {transcript && (

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                    Transcript
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-slate-900">
                    Full transcription
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Transcription generated from the selected recording.
                  </p>

                </div>


                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Completed
                </span>

              </div>


              <div className="mt-6 rounded-lg bg-slate-50 p-5">

                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {transcript.text}
                </p>

              </div>

            </section>
          )}


          {/* AI Intelligence */}

          {summary && (

            <section>

              <div className="mb-5">

                <p className="text-xs font-medium uppercase tracking-wide text-purple-600">
                  AI Intelligence
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  Meeting insights
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  AI-generated insights from your meeting.
                </p>

              </div>


              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                {/* Summary */}

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg">
                      📝
                    </div>

                    <div>

                      <h3 className="font-semibold text-slate-900">
                        Summary
                      </h3>

                      <p className="text-xs text-slate-500">
                        AI-generated overview
                      </p>

                    </div>

                  </div>


                  <p className="mt-5 text-sm leading-7 text-slate-600">
                    {summary.summary ||
                      "No summary available."}
                  </p>

                </div>


                {/* Key Points */}

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50 text-lg">
                      🔑
                    </div>

                    <div>

                      <h3 className="font-semibold text-slate-900">
                        Key Points
                      </h3>

                      <p className="text-xs text-slate-500">
                        Important discussion points
                      </p>

                    </div>

                  </div>


                  <InsightContent
                    value={summary.key_points}
                    empty="No key points identified."
                  />

                </div>


                {/* Action Items */}

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-lg">
                      ✅
                    </div>

                    <div>

                      <h3 className="font-semibold text-slate-900">
                        Action Items
                      </h3>

                      <p className="text-xs text-slate-500">
                        Tasks identified from the meeting
                      </p>

                    </div>

                  </div>


                  <InsightContent
                    value={
                      summary.action_items
                    }
                    empty="No action items identified."
                  />

                </div>


                {/* Decisions */}

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-lg">
                      🎯
                    </div>

                    <div>

                      <h3 className="font-semibold text-slate-900">
                        Decisions
                      </h3>

                      <p className="text-xs text-slate-500">
                        Decisions made during the meeting
                      </p>

                    </div>

                  </div>


                  <InsightContent
                    value={
                      summary.decisions
                    }
                    empty="No decisions identified."
                  />

                </div>

              </div>

            </section>
          )}

        </section>

      </div>

    </main>
  )
}


// =========================================
// Insight Content
// =========================================

interface InsightContentProps {
  value: string
  empty: string
}


const InsightContent = ({
  value,
  empty,
}: InsightContentProps) => {

  if (
    !value ||
    !value.trim()
  ) {
    return (
      <p className="mt-5 text-sm text-slate-400">
        {empty}
      </p>
    )
  }

  const items = value
    .split(/\n|•/)
    .map(
      (item) => item.trim()
    )
    .filter(Boolean)

  return (
    <ul className="mt-5 space-y-3">

      {items.map(
        (item, index) => (

          <li
            key={index}
            className="flex gap-3 text-sm leading-6 text-slate-600"
          >

            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />

            <span>
              {item}
            </span>

          </li>

        )
      )}

    </ul>
  )
}


export default MeetingDetails