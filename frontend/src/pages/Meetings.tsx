import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import {
  createMeeting,
  getMeetings,
  updateMeeting,
  deleteMeeting,
  type Meeting,
} from "../services/api"


type DateFilter =
  | "all"
  | "today"
  | "last7"
  | "last30"

type DurationFilter =
  | "all"
  | "under30"
  | "30to60"
  | "over60"

type SortOption =
  | "newest"
  | "oldest"
  | "titleAsc"
  | "titleDesc"


const Meetings = () => {
  const navigate = useNavigate()


  // =========================================
  // Meetings
  // =========================================

  const [meetings, setMeetings] =
    useState<Meeting[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")


  // =========================================
  // Search & Filters
  // =========================================

  const [search, setSearch] =
    useState("")

  const [dateFilter, setDateFilter] =
    useState<DateFilter>("all")

  const [durationFilter, setDurationFilter] =
    useState<DurationFilter>("all")

  const [sortOption, setSortOption] =
    useState<SortOption>("newest")


  // =========================================
  // Form
  // =========================================

  const [showForm, setShowForm] =
    useState(false)

  const [title, setTitle] =
    useState("")

  const [duration, setDuration] =
    useState("")

  const [date, setDate] =
    useState("")

  const [description, setDescription] =
    useState("")

  const [creating, setCreating] =
    useState(false)


  // =========================================
  // Edit
  // =========================================

  const [editingMeetingId, setEditingMeetingId] =
    useState<number | null>(null)

  const [updating, setUpdating] =
    useState(false)


  // =========================================
  // Delete
  // =========================================

  const [deletingMeetingId, setDeletingMeetingId] =
    useState<number | null>(null)


  // =========================================
  // Load Meetings
  // =========================================

  const loadMeetings = async () => {
    try {
      setLoading(true)
      setError("")

      const data = await getMeetings()

      setMeetings(data)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load meetings"
      )
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    loadMeetings()
  }, [])


  // =========================================
  // Create Meeting
  // =========================================

  const handleCreateMeeting = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    try {
      setCreating(true)
      setError("")

      const newMeeting =
        await createMeeting({
          title,
          duration: Number(duration),
          date,
          description:
            description || undefined,
        })

      setMeetings(
        (currentMeetings) => [
          newMeeting,
          ...currentMeetings,
        ]
      )

      setTitle("")
      setDuration("")
      setDate("")
      setDescription("")

      setShowForm(false)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create meeting"
      )
    } finally {
      setCreating(false)
    }
  }


  // =========================================
  // Edit Meeting
  // =========================================

  const handleEditMeeting = (
    meeting: Meeting
  ) => {
    setEditingMeetingId(meeting.id)

    setTitle(meeting.title)

    setDuration(
      String(meeting.duration)
    )

    const localDate =
      new Date(meeting.date)

    const formattedDate =
      new Date(
        localDate.getTime() -
          localDate.getTimezoneOffset() *
            60000
      )
        .toISOString()
        .slice(0, 16)

    setDate(formattedDate)

    setDescription(
      meeting.description || ""
    )

    setError("")
    setShowForm(true)
  }


  // =========================================
  // Update Meeting
  // =========================================

  const handleUpdateMeeting = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (editingMeetingId === null) {
      return
    }

    try {
      setUpdating(true)
      setError("")

      const updatedMeeting =
        await updateMeeting(
          editingMeetingId,
          {
            title,
            duration: Number(duration),
            date,
            description:
              description || undefined,
          }
        )

      setMeetings(
        (currentMeetings) =>
          currentMeetings.map(
            (meeting) =>
              meeting.id ===
              editingMeetingId
                ? updatedMeeting
                : meeting
          )
      )

      setTitle("")
      setDuration("")
      setDate("")
      setDescription("")

      setEditingMeetingId(null)
      setShowForm(false)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update meeting"
      )
    } finally {
      setUpdating(false)
    }
  }


  // =========================================
  // Delete Meeting
  // =========================================

  const handleDeleteMeeting = async (
    meetingId: number
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this meeting? All recordings, transcripts, and AI summaries associated with this meeting will also be deleted."
      )

    if (!confirmed) {
      return
    }

    try {
      setDeletingMeetingId(meetingId)
      setError("")

      await deleteMeeting(meetingId)

      setMeetings(
        (currentMeetings) =>
          currentMeetings.filter(
            (meeting) =>
              meeting.id !== meetingId
          )
      )
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete meeting"
      )
    } finally {
      setDeletingMeetingId(null)
    }
  }


  // =========================================
  // Cancel Form
  // =========================================

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingMeetingId(null)

    setTitle("")
    setDuration("")
    setDate("")
    setDescription("")
    setError("")
  }


  // =========================================
  // Filter + Search + Sort
  // =========================================

  const filteredMeetings = useMemo(() => {
    let result = [...meetings]


    // -----------------------------------------
    // Search
    // Title + Description
    // -----------------------------------------

    const searchText =
      search.trim().toLowerCase()

    if (searchText) {
      result = result.filter(
        (meeting) => {
          const title =
            meeting.title?.toLowerCase() || ""

          const description =
            meeting.description?.toLowerCase() || ""

          return (
            title.includes(searchText) ||
            description.includes(searchText)
          )
        }
      )
    }


    // -----------------------------------------
    // Date Filter
    // -----------------------------------------

    if (dateFilter !== "all") {
      const now = new Date()

      if (dateFilter === "today") {
        result = result.filter(
          (meeting) => {
            const meetingDate =
              new Date(meeting.date)

            return (
              meetingDate.getFullYear() ===
                now.getFullYear() &&
              meetingDate.getMonth() ===
                now.getMonth() &&
              meetingDate.getDate() ===
                now.getDate()
            )
          }
        )
      }

      if (dateFilter === "last7") {
        const sevenDaysAgo =
          new Date()

        sevenDaysAgo.setDate(
          sevenDaysAgo.getDate() - 7
        )

        result = result.filter(
          (meeting) => {
            const meetingDate =
              new Date(meeting.date)

            return (
              meetingDate >= sevenDaysAgo &&
              meetingDate <= now
            )
          }
        )
      }

      if (dateFilter === "last30") {
        const thirtyDaysAgo =
          new Date()

        thirtyDaysAgo.setDate(
          thirtyDaysAgo.getDate() - 30
        )

        result = result.filter(
          (meeting) => {
            const meetingDate =
              new Date(meeting.date)

            return (
              meetingDate >= thirtyDaysAgo &&
              meetingDate <= now
            )
          }
        )
      }
    }


    // -----------------------------------------
    // Duration Filter
    // -----------------------------------------

    if (
      durationFilter !== "all"
    ) {
      result = result.filter(
        (meeting) => {
          const meetingDuration =
            meeting.duration

          if (
            durationFilter ===
            "under30"
          ) {
            return meetingDuration < 30
          }

          if (
            durationFilter ===
            "30to60"
          ) {
            return (
              meetingDuration >= 30 &&
              meetingDuration <= 60
            )
          }

          if (
            durationFilter ===
            "over60"
          ) {
            return meetingDuration > 60
          }

          return true
        }
      )
    }


    // -----------------------------------------
    // Sorting
    // -----------------------------------------

    result.sort(
      (a, b) => {
        if (
          sortOption ===
          "newest"
        ) {
          return (
            new Date(b.date).getTime() -
            new Date(a.date).getTime()
          )
        }

        if (
          sortOption ===
          "oldest"
        ) {
          return (
            new Date(a.date).getTime() -
            new Date(b.date).getTime()
          )
        }

        if (
          sortOption ===
          "titleAsc"
        ) {
          return a.title
            .toLowerCase()
            .localeCompare(
              b.title.toLowerCase()
            )
        }

        if (
          sortOption ===
          "titleDesc"
        ) {
          return b.title
            .toLowerCase()
            .localeCompare(
              a.title.toLowerCase()
            )
        }

        return 0
      }
    )


    return result
  }, [
    meetings,
    search,
    dateFilter,
    durationFilter,
    sortOption,
  ])


  // =========================================
  // Reset Filters
  // =========================================

  const clearFilters = () => {
    setSearch("")
    setDateFilter("all")
    setDurationFilter("all")
    setSortOption("newest")
  }


  const hasActiveFilters =
    search.trim() !== "" ||
    dateFilter !== "all" ||
    durationFilter !== "all"


  return (
    <main className="flex-1 p-8">

      {/* =====================================
          Header
      ====================================== */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <p className="text-sm font-medium text-blue-600">
            Workspace
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Meetings
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your meetings and meeting intelligence.
          </p>

        </div>


        <button
          onClick={() => {
            setEditingMeetingId(null)
            setTitle("")
            setDuration("")
            setDate("")
            setDescription("")
            setError("")
            setShowForm(true)
          }}
          className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          + New Meeting
        </button>

      </div>


      {/* =====================================
          Error
      ====================================== */}

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}


      {/* =====================================
          Search & Filters
      ====================================== */}

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="flex flex-col gap-4">

          {/* Search */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Search meetings
            </label>

            <div className="relative">

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search by title or description..."
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              {search && (
                <button
                  onClick={() =>
                    setSearch("")
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              )}

            </div>

          </div>


          {/* Filters */}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {/* Date */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Date
              </label>

              <select
                value={dateFilter}
                onChange={(event) =>
                  setDateFilter(
                    event.target.value as DateFilter
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">
                  All
                </option>

                <option value="today">
                  Today
                </option>

                <option value="last7">
                  Last 7 Days
                </option>

                <option value="last30">
                  Last 30 Days
                </option>
              </select>

            </div>


            {/* Duration */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Duration
              </label>

              <select
                value={durationFilter}
                onChange={(event) =>
                  setDurationFilter(
                    event.target.value as DurationFilter
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >

                <option value="all">
                  All
                </option>

                <option value="under30">
                  Under 30 min
                </option>

                <option value="30to60">
                  30–60 min
                </option>

                <option value="over60">
                  Over 60 min
                </option>

              </select>

            </div>


            {/* Sort */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Sort
              </label>

              <select
                value={sortOption}
                onChange={(event) =>
                  setSortOption(
                    event.target.value as SortOption
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >

                <option value="newest">
                  Newest
                </option>

                <option value="oldest">
                  Oldest
                </option>

                <option value="titleAsc">
                  Title A–Z
                </option>

                <option value="titleDesc">
                  Title Z–A
                </option>

              </select>

            </div>

          </div>


          {/* Filter Footer */}

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-sm text-slate-500">

              Showing{" "}

              <span className="font-semibold text-slate-900">
                {filteredMeetings.length}
              </span>

              {" "}of{" "}

              <span className="font-semibold text-slate-900">
                {meetings.length}
              </span>

              {" "}meetings

            </p>


            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </button>
            )}

          </div>

        </div>

      </div>


      {/* =====================================
          Create / Edit Form
      ====================================== */}

      {showForm && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6">

            <h2 className="text-lg font-semibold text-slate-900">
              {editingMeetingId !== null
                ? "Edit Meeting"
                : "Create Meeting"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {editingMeetingId !== null
                ? "Update your meeting details."
                : "Add a new meeting to your workspace."}
            </p>

          </div>


          <form
            onSubmit={
              editingMeetingId !== null
                ? handleUpdateMeeting
                : handleCreateMeeting
            }
            className="space-y-5"
          >

            {/* Title */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Meeting title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
                placeholder="Weekly team meeting"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>


            {/* Duration + Date */}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Duration (minutes)
                </label>

                <input
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(event) =>
                    setDuration(
                      event.target.value
                    )
                  }
                  placeholder="60"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>


              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Date & time
                </label>

                <input
                  type="datetime-local"
                  value={date}
                  onChange={(event) =>
                    setDate(
                      event.target.value
                    )
                  }
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

            </div>


            {/* Description */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="What is this meeting about?"
                rows={4}
                className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>


            {/* Buttons */}

            <div className="flex justify-end gap-3">

              <button
                type="button"
                onClick={handleCancelForm}
                disabled={
                  creating || updating
                }
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>


              <button
                type="submit"
                disabled={
                  creating || updating
                }
                className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {editingMeetingId !== null
                  ? updating
                    ? "Updating..."
                    : "Update Meeting"
                  : creating
                    ? "Creating..."
                    : "Create Meeting"}
              </button>

            </div>

          </form>

        </div>
      )}


      {/* =====================================
          Meetings List
      ====================================== */}

      <div className="mt-8">

        {loading ? (

          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Loading meetings...
          </div>

        ) : filteredMeetings.length === 0 ? (

          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">

            <h2 className="text-lg font-semibold text-slate-900">
              {meetings.length === 0
                ? "No meetings yet"
                : "No meetings found"}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {meetings.length === 0
                ? "Create your first meeting to get started."
                : "Try changing your search or filters."}
            </p>


            {meetings.length === 0 ? (

              <button
                onClick={() => {
                  setEditingMeetingId(null)
                  setTitle("")
                  setDuration("")
                  setDate("")
                  setDescription("")
                  setError("")
                  setShowForm(true)
                }}
                className="mt-5 rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Create Meeting
              </button>

            ) : (

              <button
                onClick={clearFilters}
                className="mt-5 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Clear Filters
              </button>

            )}

          </div>

        ) : (

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

            {filteredMeetings.map(
              (meeting) => (

                <div
                  key={meeting.id}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >

                  <div className="flex items-start justify-between gap-4">

                    <button
                      onClick={() =>
                        navigate(
                          `/meetings/${meeting.id}`
                        )
                      }
                      className="min-w-0 flex-1 text-left"
                    >

                      <h2 className="text-lg font-semibold text-slate-900">
                        {meeting.title}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        {meeting.description ||
                          "No description"}
                      </p>

                    </button>


                    <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      Meeting #{meeting.id}
                    </span>

                  </div>


                  <div className="mt-6 grid grid-cols-2 gap-4">

                    <div className="rounded-lg bg-slate-50 p-3">

                      <p className="text-xs text-slate-500">
                        Duration
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {meeting.duration} min
                      </p>

                    </div>


                    <div className="rounded-lg bg-slate-50 p-3">

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


                  <div className="mt-5 flex items-center justify-between">

                    <button
                      onClick={() =>
                        navigate(
                          `/meetings/${meeting.id}`
                        )
                      }
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Open meeting →
                    </button>


                    <div className="flex items-center gap-2">

                      <button
                        onClick={() =>
                          handleEditMeeting(
                            meeting
                          )
                        }
                        disabled={
                          deletingMeetingId ===
                          meeting.id
                        }
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Edit
                      </button>


                      <button
                        onClick={() =>
                          handleDeleteMeeting(
                            meeting.id
                          )
                        }
                        disabled={
                          deletingMeetingId ===
                          meeting.id
                        }
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingMeetingId ===
                        meeting.id
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

      </div>

    </main>
  )
}


export default Meetings