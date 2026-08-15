import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import {
  getMeetings,
  getRecordings,
  getSummaries,
  type Meeting,
  type Recording,
  type Summary,
} from "../services/api"


interface TranscriptItem {
  recording: Recording
  meeting: Meeting | undefined
  summary: Summary | undefined
}


const Transcripts = () => {
  const navigate = useNavigate()

  const [items, setItems] =
    useState<TranscriptItem[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  const [search, setSearch] =
    useState("")


  // =========================================
  // Load transcript-related data
  // =========================================

  const loadTranscripts = async () => {
    try {
      setLoading(true)
      setError("")

      const [
        meetingsData,
        recordingsData,
        summariesData,
      ] = await Promise.all([
        getMeetings(),
        getRecordings(),
        getSummaries(),
      ])

      const transcriptItems =
        recordingsData
          .filter(
            (recording) =>
              recording.status?.toLowerCase() ===
              "completed"
          )
          .map((recording) => ({
            recording,
            meeting: meetingsData.find(
              (meeting) =>
                meeting.id ===
                recording.meeting_id
            ),
            summary: summariesData.find(
              (summary) =>
                summary.transcript_id ===
                recording.id
            ),
          }))

      setItems(transcriptItems)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load transcripts"
      )
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    loadTranscripts()
  }, [])


  // =========================================
  // Search
  // =========================================

  const filteredItems =
    items.filter((item) => {
      const searchText =
        search.toLowerCase().trim()

      if (!searchText) {
        return true
      }

      const meetingTitle =
        item.meeting?.title || ""

      const summaryText =
        item.summary?.summary || ""

      return (
        meetingTitle
          .toLowerCase()
          .includes(searchText) ||
        summaryText
          .toLowerCase()
          .includes(searchText) ||
        `recording ${item.recording.id}`
          .toLowerCase()
          .includes(searchText)
      )
    })


  // =========================================
  // Loading
  // =========================================

  if (loading) {
    return (
      <main className="flex-1 p-8">
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-slate-500">
            Loading transcripts...
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

      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

        <div>
          <p className="text-sm font-medium text-blue-600">
            Workspace
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Transcripts
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review transcripts generated from your
            meeting recordings.
          </p>
        </div>


        <button
          onClick={() => navigate("/meetings")}
          className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Open Meetings
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

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Transcripts
          </p>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {items.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Completed recordings
          </p>
        </div>


        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            With AI Analysis
          </p>

          <p className="mt-3 text-3xl font-bold text-purple-600">
            {
              items.filter(
                (item) => item.summary
              ).length
            }
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Transcripts with generated insights
          </p>
        </div>


        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Meetings
          </p>

          <p className="mt-3 text-3xl font-bold text-blue-600">
            {
              new Set(
                items.map(
                  (item) =>
                    item.recording.meeting_id
                )
              ).size
            }
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Meetings containing transcripts
          </p>
        </div>

      </div>


      {/* =========================================
          Search
      ========================================= */}

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <h2 className="font-semibold text-slate-900">
              Transcript Library
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Search your completed meeting recordings.
            </p>
          </div>


          <div className="w-full md:w-80">

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search transcripts..."
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>

        </div>

      </div>


      {/* =========================================
          Transcript List
      ========================================= */}

      <div className="mt-6">

        {filteredItems.length === 0 ? (

          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">

            <div className="text-4xl">
              📝
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              {items.length === 0
                ? "No transcripts yet"
                : "No transcripts found"}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {items.length === 0
                ? "Complete a recording transcription from the Meeting Details page to see it here."
                : "Try changing your search term."}
            </p>


            {items.length === 0 && (
              <button
                onClick={() =>
                  navigate("/meetings")
                }
                className="mt-5 rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Go to Meetings
              </button>
            )}

          </div>

        ) : (

          <div className="space-y-4">

            {filteredItems.map((item) => (

              <div
                key={item.recording.id}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300"
              >

                {/* Card Header */}

                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                  <div className="min-w-0">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-lg">
                        📝
                      </div>

                      <div className="min-w-0">

                        <h2 className="truncate text-lg font-semibold text-slate-900">
                          {item.meeting?.title ||
                            `Meeting #${item.recording.meeting_id}`}
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                          Recording #
                          {item.recording.id}
                        </p>

                      </div>

                    </div>

                  </div>


                  <div className="flex items-center gap-3">

                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      Completed
                    </span>

                    <button
                      onClick={() =>
                        navigate(
                          `/meetings/${item.recording.meeting_id}`
                        )
                      }
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Open Meeting
                    </button>

                  </div>

                </div>


                {/* Metadata */}

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">

                  <div className="rounded-lg bg-slate-50 px-4 py-3">

                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Meeting Date
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {item.meeting
                        ? new Date(
                            item.meeting.date
                          ).toLocaleDateString()
                        : "Unknown"}
                    </p>

                  </div>


                  <div className="rounded-lg bg-slate-50 px-4 py-3">

                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Uploaded
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {new Date(
                        item.recording.created_at
                      ).toLocaleDateString()}
                    </p>

                  </div>


                  <div className="rounded-lg bg-slate-50 px-4 py-3">

                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Analysis
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {item.summary
                        ? "Available"
                        : "Transcript only"}
                    </p>

                  </div>

                </div>


                {/* Summary Preview */}

                {item.summary && (
                  <div className="mt-5 rounded-lg border border-purple-100 bg-purple-50 p-5">

                    <div className="flex items-center gap-2">

                      <span className="text-lg">
                        ✨
                      </span>

                      <h3 className="text-sm font-semibold text-purple-900">
                        AI Summary
                      </h3>

                    </div>

                    <p className="mt-3 text-sm leading-6 text-purple-800">
                      {item.summary.summary}
                    </p>

                  </div>
                )}


                {/* Action */}

                <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

                  <p className="text-xs text-slate-400">
                    Transcript generated from Recording #
                    {item.recording.id}
                  </p>

                  <button
                    onClick={() =>
                      navigate(
                        `/meetings/${item.recording.meeting_id}`
                      )
                    }
                    className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    View Full Transcript →
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </main>
  )
}


export default Transcripts