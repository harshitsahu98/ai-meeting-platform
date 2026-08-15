import { useEffect, useState } from "react"
import {
  getSummaries,
  type Summary,
} from "../services/api"


const AIInsights = () => {
  const [summaries, setSummaries] =
    useState<Summary[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")


  // =========================================
  // Load AI summaries
  // =========================================

  const loadSummaries = async () => {
    try {
      setLoading(true)
      setError("")

      const data =
        await getSummaries()

      setSummaries(data)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load AI insights"
      )
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    loadSummaries()
  }, [])


  // =========================================
  // Convert insight text into list items
  // =========================================

  const parseItems = (
    value: string | null | undefined
  ) => {
    if (!value || !value.trim()) {
      return []
    }

    return value
      .split(/\n|•/)
      .map((item) => item.trim())
      .filter(Boolean)
  }


  // =========================================
  // Insight Card
  // =========================================

  const InsightCard = ({
    title,
    description,
    value,
    icon,
    iconBackground,
  }: {
    title: string
    description: string
    value: string
    icon: string
    iconBackground: string
  }) => {
    const items = parseItems(value)

    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3">

          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg ${iconBackground}`}
          >
            {icon}
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">
              {title}
            </h3>

            <p className="text-xs text-slate-500">
              {description}
            </p>
          </div>

        </div>


        {items.length === 0 ? (

          <p className="mt-5 text-sm text-slate-400">
            No {title.toLowerCase()} identified.
          </p>

        ) : (

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

        )}

      </div>
    )
  }


  // =========================================
  // Loading
  // =========================================

  if (loading) {
    return (
      <main className="flex-1 p-8">

        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">

          <p className="text-sm text-slate-500">
            Loading AI insights...
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

      <div className="mb-8">

        <p className="text-sm font-medium text-purple-600">
          AI Intelligence
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          AI Insights
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Review key points, decisions, action items,
          and summaries generated from your meetings.
        </p>

      </div>


      {/* =========================================
          Error
          ========================================= */}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

          {error}

        </div>
      )}


      {/* =========================================
          Empty State
          ========================================= */}

      {summaries.length === 0 ? (

        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">

          <div className="text-4xl">
            ✨
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            No AI insights yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Upload a meeting recording and use
            Transcribe & Analyze to generate your
            first set of AI meeting insights.
          </p>

        </div>

      ) : (

        <div className="space-y-8">

          {/* =========================================
              Overview
              ========================================= */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Analyzed Meetings
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {summaries.length}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                AI-generated meeting analyses
              </p>

            </div>


            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Action Items
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {
                  summaries.reduce(
                    (total, summary) =>
                      total +
                      parseItems(
                        summary.action_items
                      ).length,
                    0
                  )
                }
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Tasks identified by AI
              </p>

            </div>


            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Decisions
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {
                  summaries.reduce(
                    (total, summary) =>
                      total +
                      parseItems(
                        summary.decisions
                      ).length,
                    0
                  )
                }
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Decisions identified by AI
              </p>

            </div>

          </div>


          {/* =========================================
              Latest AI Insights
              ========================================= */}

          <section>

            <div className="mb-5">

              <p className="text-xs font-medium uppercase tracking-wide text-purple-600">
                Meeting Intelligence
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Latest AI Insights
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                AI-generated intelligence from your analyzed meetings.
              </p>

            </div>


            <div className="space-y-8">

              {summaries.map(
                (summary, index) => (

                  <div
                    key={summary.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-6"
                  >

                    {/* Meeting Analysis Header */}

                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                      <div>

                        <p className="text-xs font-medium uppercase tracking-wide text-purple-600">
                          Meeting Analysis #{index + 1}
                        </p>

                        <h3 className="mt-1 text-lg font-semibold text-slate-900">
                          AI-generated meeting intelligence
                        </h3>

                      </div>

                      <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        Analyzed
                      </span>

                    </div>


                    {/* Summary */}

                    <div className="mb-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

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

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

                      <InsightCard
                        title="Key Points"
                        description="Important discussion points"
                        value={
                          summary.key_points
                        }
                        icon="🔑"
                        iconBackground="bg-yellow-50"
                      />


                      <InsightCard
                        title="Action Items"
                        description="Tasks identified from the meeting"
                        value={
                          summary.action_items
                        }
                        icon="✅"
                        iconBackground="bg-green-50"
                      />


                      <InsightCard
                        title="Decisions"
                        description="Decisions made during the meeting"
                        value={
                          summary.decisions
                        }
                        icon="🎯"
                        iconBackground="bg-purple-50"
                      />

                    </div>

                  </div>

                )
              )}

            </div>

          </section>

        </div>

      )}

    </main>
  )
}


export default AIInsights