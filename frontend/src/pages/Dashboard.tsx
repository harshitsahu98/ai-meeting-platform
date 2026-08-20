import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import {
  getMeetings,
  getRecordings,
  type Meeting,
  type Recording,
} from "../services/api"

const Dashboard = () => {
  const navigate = useNavigate()

  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [recordings, setRecordings] = useState<Recording[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError("")

      const [meetingsData, recordingsData] =
        await Promise.all([
          getMeetings(),
          getRecordings(),
        ])

      setMeetings(meetingsData)
      setRecordings(recordingsData)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load dashboard"
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const completedRecordings = recordings.filter(
    (recording) =>
      recording.status?.toLowerCase() === "completed"
  ).length

  const processingRecordings = recordings.filter(
    (recording) =>
      recording.status?.toLowerCase() !== "completed"
  ).length

  const recentMeetings = [...meetings]
    .sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    )
    .slice(0, 5)

  const recentRecordings = [...recordings]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )
    .slice(0, 4)

  return (
    <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">

      {/* Header */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div className="min-w-0">

          <p className="text-sm font-medium text-blue-600">
            Workspace
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Your meeting intelligence at a glance.
          </p>

        </div>


        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">

          <button
            onClick={() => navigate("/meetings")}
            className="w-full rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
          >
            View Meetings
          </button>

          <button
            onClick={() => navigate("/meetings")}
            className="w-full rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
          >
            + New Meeting
          </button>

        </div>

      </div>


      {/* Error */}

      {error && (
        <div className="mt-6 break-words rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}


      {/* Loading */}

      {loading ? (

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm sm:p-10">
          Loading dashboard...
        </div>

      ) : (

        <>

          {/* Statistics */}

          <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

              <p className="text-sm font-medium text-slate-500">
                Total Meetings
              </p>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {meetings.length}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Meetings in your workspace
              </p>

            </div>


            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

              <p className="text-sm font-medium text-slate-500">
                Recordings
              </p>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {recordings.length}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Audio recordings uploaded
              </p>

            </div>


            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

              <p className="text-sm font-medium text-slate-500">
                Completed
              </p>

              <p className="mt-3 text-3xl font-bold text-green-600">
                {completedRecordings}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Recordings ready for analysis
              </p>

            </div>


            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

              <p className="text-sm font-medium text-slate-500">
                Processing
              </p>

              <p className="mt-3 text-3xl font-bold text-blue-600">
                {processingRecordings}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Recordings being processed
              </p>

            </div>

          </div>


          {/* Main Content */}

          <div className="mt-6 grid min-w-0 grid-cols-1 gap-5 sm:mt-8 sm:gap-6 xl:grid-cols-3">

            {/* Recent Meetings */}

            <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-2">

              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-5 sm:px-6">

                <div className="min-w-0">

                  <h2 className="text-lg font-semibold text-slate-900">
                    Recent Meetings
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Your latest meetings
                  </p>

                </div>

                <button
                  onClick={() => navigate("/meetings")}
                  className="shrink-0 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View all →
                </button>

              </div>


              {recentMeetings.length === 0 ? (

                <div className="px-4 py-12 text-center sm:px-6">

                  <p className="text-sm text-slate-500">
                    No meetings yet.
                  </p>

                  <button
                    onClick={() => navigate("/meetings")}
                    className="mt-4 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Create your first meeting
                  </button>

                </div>

              ) : (

                <div className="divide-y divide-slate-100">

                  {recentMeetings.map((meeting) => (

                    <button
                      key={meeting.id}
                      onClick={() =>
                        navigate(
                          `/meetings/${meeting.id}`
                        )
                      }
                      className="flex w-full min-w-0 items-center justify-between gap-4 px-4 py-5 text-left transition hover:bg-slate-50 sm:px-6"
                    >

                      <div className="min-w-0 flex-1">

                        <h3 className="truncate text-sm font-semibold text-slate-900">
                          {meeting.title}
                        </h3>

                        <p className="mt-1 truncate text-sm text-slate-500">
                          {meeting.description ||
                            "No description"}
                        </p>

                      </div>


                      <div className="shrink-0 text-right">

                        <p className="text-xs font-medium text-slate-500">
                          {new Date(
                            meeting.date
                          ).toLocaleDateString()}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {meeting.duration} min
                        </p>

                      </div>

                    </button>

                  ))}

                </div>

              )}

            </div>


            {/* AI Intelligence */}

            <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-4 py-5 sm:px-6">

                <h2 className="text-lg font-semibold text-slate-900">
                  AI Intelligence
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Meeting analysis overview
                </p>

              </div>


              <div className="p-4 sm:p-6">

                <div className="rounded-xl bg-blue-50 p-4 sm:p-5">

                  <p className="text-sm font-semibold text-blue-900">
                    Ready for analysis
                  </p>

                  <p className="mt-2 text-sm leading-6 text-blue-700">
                    Completed recordings can be
                    transcribed and analyzed to
                    generate summaries, key points,
                    decisions, and action items.
                  </p>

                </div>


                <div className="mt-6 space-y-4">

                  <div className="flex items-center justify-between gap-4">

                    <span className="text-sm text-slate-500">
                      Completed recordings
                    </span>

                    <span className="shrink-0 text-sm font-semibold text-slate-900">
                      {completedRecordings}
                    </span>

                  </div>


                  <div className="flex items-center justify-between gap-4">

                    <span className="text-sm text-slate-500">
                      Total recordings
                    </span>

                    <span className="shrink-0 text-sm font-semibold text-slate-900">
                      {recordings.length}
                    </span>

                  </div>


                  <div className="flex items-center justify-between gap-4">

                    <span className="text-sm text-slate-500">
                      Meetings
                    </span>

                    <span className="shrink-0 text-sm font-semibold text-slate-900">
                      {meetings.length}
                    </span>

                  </div>

                </div>


                <button
                  onClick={() => navigate("/meetings")}
                  className="mt-6 w-full rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Open Meeting Intelligence
                </button>

              </div>

            </div>

          </div>


          {/* Recent Recordings */}

          <div className="mt-5 min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:mt-6">

            <div className="border-b border-slate-100 px-4 py-5 sm:px-6">

              <div>

                <h2 className="text-lg font-semibold text-slate-900">
                  Recent Recordings
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Latest uploaded meeting audio
                </p>

              </div>

            </div>


            {recentRecordings.length === 0 ? (

              <div className="px-4 py-10 text-center text-sm text-slate-500 sm:px-6">
                No recordings uploaded yet.
              </div>

            ) : (

              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-4">

                {recentRecordings.map((recording) => (

                  <div
                    key={recording.id}
                    className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >

                    <div className="flex min-w-0 items-center justify-between gap-3">

                      <span className="min-w-0 truncate text-sm font-semibold text-slate-900">
                        Recording #{recording.id}
                      </span>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                          recording.status?.toLowerCase() ===
                          "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {recording.status}
                      </span>

                    </div>


                    <p className="mt-3 text-xs text-slate-500">
                      Uploaded{" "}
                      {new Date(
                        recording.created_at
                      ).toLocaleDateString()}
                    </p>


                    <button
                      onClick={() =>
                        navigate(
                          `/meetings/${recording.meeting_id}`
                        )
                      }
                      className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      View recording →
                    </button>

                  </div>

                ))}

              </div>

            )}

          </div>


          {/* Quick Actions */}

          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-6 sm:p-6">

            <h2 className="text-lg font-semibold text-slate-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Jump directly into your workspace.
            </p>


            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

              <button
                onClick={() => navigate("/meetings")}
                className="rounded-lg border border-slate-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
              >

                <p className="text-sm font-semibold text-slate-900">
                  Meetings
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Create and manage meetings
                </p>

              </button>


              <button
                onClick={() => navigate("/recordings")}
                className="rounded-lg border border-slate-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
              >

                <p className="text-sm font-semibold text-slate-900">
                  Recordings
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Upload and manage audio
                </p>

              </button>


              <button
                onClick={() => navigate("/transcripts")}
                className="rounded-lg border border-slate-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
              >

                <p className="text-sm font-semibold text-slate-900">
                  Transcripts
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Review meeting transcripts
                </p>

              </button>


              <button
                onClick={() => navigate("/ai-insights")}
                className="rounded-lg border border-slate-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
              >

                <p className="text-sm font-semibold text-slate-900">
                  AI Insights
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Review AI-generated insights
                </p>

              </button>

            </div>

          </div>

        </>

      )}

    </main>
  )
}

export default Dashboard