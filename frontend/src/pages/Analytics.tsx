import { useEffect, useMemo, useState } from "react"

import {
  getMeetings,
  getRecordings,
  type Meeting,
  type Recording,
} from "../services/api"


const Analytics = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [recordings, setRecordings] = useState<Recording[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")


  useEffect(() => {
    const loadAnalytics = async () => {
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
            : "Failed to load analytics"
        )
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [])


  const totalDuration = useMemo(() => {
    return meetings.reduce(
      (total, meeting) =>
        total + meeting.duration,
      0
    )
  }, [meetings])


  const transcribedRecordings = useMemo(() => {
    return recordings.filter(
      (recording) =>
        recording.status.toLowerCase() ===
        "completed"
    ).length
  }, [recordings])


  const recordingsByMeeting = useMemo(() => {
    return meetings.map((meeting) => ({
      ...meeting,
      recordingCount:
        recordings.filter(
          (recording) =>
            recording.meeting_id === meeting.id
        ).length,
    }))
  }, [meetings, recordings])


  const monthlyMeetings = useMemo(() => {
    const months: Record<string, number> = {}

    meetings.forEach((meeting) => {
      const date = new Date(meeting.date)

      const key = date.toLocaleDateString(
        "en-US",
        {
          month: "short",
          year: "numeric",
        }
      )

      months[key] = (months[key] || 0) + 1
    })

    return Object.entries(months)
  }, [meetings])


  if (loading) {
    return (
      <main className="flex-1 p-8">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Loading analytics...
        </div>
      </main>
    )
  }


  return (
    <main className="flex-1 p-8">

      {/* Header */}

      <div>
        <p className="text-sm font-medium text-blue-600">
          Workspace
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Analytics
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Overview of your meetings and recording activity.
        </p>
      </div>


      {/* Error */}

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}


      {/* Stats */}

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Meetings
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {meetings.length}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Meetings in your workspace
          </p>
        </div>


        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Recordings
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {recordings.length}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Audio recordings uploaded
          </p>
        </div>


        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Meeting Duration
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {totalDuration}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Total scheduled minutes
          </p>
        </div>


        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Transcribed
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {transcribedRecordings}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Completed recordings
          </p>
        </div>

      </div>


      {/* Activity */}

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* Meetings by month */}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Meetings by Month
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Number of meetings scheduled over time.
            </p>
          </div>


          {monthlyMeetings.length === 0 ? (
            <div className="rounded-lg bg-slate-50 p-8 text-center text-sm text-slate-500">
              No meeting data available.
            </div>
          ) : (
            <div className="space-y-4">

              {monthlyMeetings.map(
                ([month, count]) => (
                  <div key={month}>

                    <div className="mb-2 flex items-center justify-between">

                      <span className="text-sm font-medium text-slate-700">
                        {month}
                      </span>

                      <span className="text-sm font-semibold text-slate-900">
                        {count}
                      </span>

                    </div>


                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{
                          width: `${Math.min(
                            count * 20,
                            100
                          )}%`,
                        }}
                      />

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </div>


        {/* Recordings by meeting */}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Recordings by Meeting
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Recording activity across your meetings.
            </p>
          </div>


          {recordingsByMeeting.length === 0 ? (
            <div className="rounded-lg bg-slate-50 p-8 text-center text-sm text-slate-500">
              No recording data available.
            </div>
          ) : (
            <div className="space-y-4">

              {recordingsByMeeting
                .slice(0, 6)
                .map((meeting) => (

                  <div
                    key={meeting.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"
                  >

                    <div className="min-w-0">

                      <p className="truncate text-sm font-medium text-slate-900">
                        {meeting.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Meeting #{meeting.id}
                      </p>

                    </div>


                    <div className="ml-4 shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {meeting.recordingCount}{" "}
                      {meeting.recordingCount === 1
                        ? "recording"
                        : "recordings"}
                    </div>

                  </div>

                ))}

            </div>
          )}

        </div>

      </div>


      {/* Summary */}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <h2 className="text-lg font-semibold text-slate-900">
          Workspace Summary
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Average Meeting Duration
            </p>

            <p className="mt-1 text-xl font-semibold text-slate-900">
              {meetings.length > 0
                ? Math.round(
                    totalDuration /
                      meetings.length
                  )
                : 0}{" "}
              min
            </p>
          </div>


          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Recordings per Meeting
            </p>

            <p className="mt-1 text-xl font-semibold text-slate-900">
              {meetings.length > 0
                ? (
                    recordings.length /
                    meetings.length
                  ).toFixed(1)
                : "0.0"}
            </p>
          </div>


          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Transcription Rate
            </p>

            <p className="mt-1 text-xl font-semibold text-slate-900">
              {recordings.length > 0
                ? Math.round(
                    (transcribedRecordings /
                      recordings.length) *
                      100
                  )
                : 0}
              %
            </p>
          </div>

        </div>

      </div>

    </main>
  )
}


export default Analytics