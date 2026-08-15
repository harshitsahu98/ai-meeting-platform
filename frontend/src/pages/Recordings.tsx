import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import {
  getMeetings,
  getRecordings,
  deleteRecording,
  type Meeting,
  type Recording,
} from "../services/api"


const Recordings = () => {
  const navigate = useNavigate()

  const [recordings, setRecordings] =
    useState<Recording[]>([])

  const [meetings, setMeetings] =
    useState<Meeting[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  const [deletingId, setDeletingId] =
    useState<number | null>(null)


  // =========================================
  // Load recordings + meetings
  // =========================================

  const loadData = async () => {
    try {
      setLoading(true)
      setError("")

      const [
        recordingsData,
        meetingsData,
      ] = await Promise.all([
        getRecordings(),
        getMeetings(),
      ])

      setRecordings(recordingsData)
      setMeetings(meetingsData)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load recordings"
      )
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    loadData()
  }, [])


  // =========================================
  // Find meeting title
  // =========================================

  const getMeetingTitle = (
    meetingId: number
  ) => {
    const meeting = meetings.find(
      (item) =>
        item.id === meetingId
    )

    return (
      meeting?.title ||
      `Meeting #${meetingId}`
    )
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
      setDeletingId(recordingId)
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
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete recording"
      )
    } finally {
      setDeletingId(null)
    }
  }


  // =========================================
  // Status classes
  // =========================================

  const getStatusClasses = (
    status: string
  ) => {
    switch (
      status?.toLowerCase()
    ) {
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
    switch (
      status?.toLowerCase()
    ) {
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

        <div className="mb-8">
          <p className="text-sm font-medium text-blue-600">
            Workspace
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Recordings
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage and listen to your meeting recordings.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-slate-500">
            Loading recordings...
          </p>
        </div>

      </main>
    )
  }


  return (
    <main className="flex-1 p-8">

      {/* =========================================
          Header
      ========================================= */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <p className="text-sm font-medium text-blue-600">
            Workspace
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Recordings
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Listen to, manage, and review your meeting recordings.
          </p>
        </div>


        <button
          onClick={() =>
            navigate("/meetings")
          }
          className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Go to Meetings
        </button>

      </div>


      {/* =========================================
          Error
      ========================================= */}

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}


      {/* =========================================
          Statistics
      ========================================= */}

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Recordings
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {recordings.length}
          </p>
        </div>


        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Completed
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {
              recordings.filter(
                (recording) =>
                  recording.status?.toLowerCase() ===
                  "completed"
              ).length
            }
          </p>
        </div>


        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Processing
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            {
              recordings.filter(
                (recording) =>
                  recording.status?.toLowerCase() !==
                  "completed"
              ).length
            }
          </p>
        </div>

      </div>


      {/* =========================================
          Empty State
      ========================================= */}

      {recordings.length === 0 ? (

        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">

          <div className="text-5xl">
            🎙️
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            No recordings yet
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Upload a recording from a meeting to see it here.
          </p>

          <button
            onClick={() =>
              navigate("/meetings")
            }
            className="mt-5 rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Go to Meetings
          </button>

        </div>

      ) : (

        /* =========================================
           Recordings List
        ========================================= */

        <div className="mt-8 space-y-5">

          {recordings.map(
            (recording) => (

              <div
                key={recording.id}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >

                {/* Recording Header */}

                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                  <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-3">

                      <h2 className="text-lg font-semibold text-slate-900">
                        Recording #{recording.id}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                          recording.status
                        )}`}
                      >
                        {getStatusLabel(
                          recording.status
                        )}
                      </span>

                    </div>


                    <p className="mt-2 text-sm text-slate-600">
                      {getMeetingTitle(
                        recording.meeting_id
                      )}
                    </p>


                    <p className="mt-1 text-xs text-slate-400">
                      Uploaded{" "}
                      {new Date(
                        recording.created_at
                      ).toLocaleString()}
                    </p>

                  </div>


                  <button
                    onClick={() =>
                      navigate(
                        `/meetings/${recording.meeting_id}`
                      )
                    }
                    className="shrink-0 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    View Meeting →
                  </button>

                </div>


                {/* Audio Player */}

                <div className="mt-6 rounded-lg bg-slate-50 p-4">

                  <div className="mb-3 flex items-center gap-2">

                    <span className="text-lg">
                      🎧
                    </span>

                    <p className="text-sm font-medium text-slate-700">
                      Audio Playback
                    </p>

                  </div>


                  <audio
                    controls
                    preload="metadata"
                    className="w-full"
                    src={`http://127.0.0.1:8000/${recording.audio_url}`}
                    onError={() =>
                      setError(
                        "Unable to play this recording."
                      )
                    }
                  >
                    Your browser does not support audio playback.
                  </audio>

                </div>


                {/* Bottom Actions */}

                <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

                  <div className="text-xs text-slate-400">
                    Recording ID: {recording.id}
                  </div>


                  <div className="flex items-center gap-4">

                    <button
                      onClick={() =>
                        navigate(
                          `/meetings/${recording.meeting_id}`
                        )
                      }
                      className="text-sm font-medium text-slate-600 hover:text-slate-900"
                    >
                      Open Meeting
                    </button>


                    <button
                      onClick={() =>
                        handleDelete(
                          recording.id
                        )
                      }
                      disabled={
                        deletingId ===
                        recording.id
                      }
                      className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId ===
                      recording.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>

                  </div>

                </div>

              </div>

            )
          )}

        </div>

      )}

    </main>
  )
}


export default Recordings