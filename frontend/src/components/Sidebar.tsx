import { useState } from "react"
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom"

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const [profileOpen, setProfileOpen] =
    useState(false)


  const isActive = (path: string) => {
    return location.pathname === path
  }


  const handleLogout = () => {
    localStorage.removeItem("token")
    setProfileOpen(false)
    navigate("/login")
  }


  return (
    <aside className="flex min-h-screen w-64 flex-col bg-slate-950 text-white">

      {/* Logo */}

      <div className="border-b border-slate-800 px-6 py-6">

        <h1 className="text-xl font-bold">
          AI Meeting
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Intelligence
        </p>

      </div>


      {/* Navigation */}

      <nav className="flex-1 px-4 py-6">

        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Workspace
        </p>


        <div className="mt-3 space-y-1">

          {/* Dashboard */}

          <Link
            to="/"
            className={`block w-full rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive("/")
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            Dashboard
          </Link>


          {/* Meetings */}

          <Link
            to="/meetings"
            className={`block w-full rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive("/meetings")
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            Meetings
          </Link>


          {/* Recordings */}

          <Link
            to="/recordings"
            className={`block w-full rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive("/recordings")
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            Recordings
          </Link>


          {/* Transcripts */}

          <Link
            to="/transcripts"
            className={`block w-full rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive("/transcripts")
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            Transcripts
          </Link>


          {/* AI Insights */}

          <Link
            to="/ai-insights"
            className={`block w-full rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive("/ai-insights")
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            AI Insights
          </Link>

        </div>


        {/* System */}

        <p className="mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          System
        </p>


        <div className="mt-3 space-y-1">

          {/* Analytics */}

          <Link
            to="/analytics"
            className={`block w-full rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive("/analytics")
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            Analytics
          </Link>


          {/* Settings */}

          <Link
            to="/settings"
            className={`block w-full rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive("/settings")
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            Settings
          </Link>

        </div>

      </nav>


      {/* User Profile */}

      <div className="relative border-t border-slate-800 p-4">

        {/* Profile Button */}

        <button
          onClick={() =>
            setProfileOpen(
              (current) => !current
            )
          }
          className="flex w-full items-center gap-3 rounded-lg bg-slate-900 p-3 text-left transition hover:bg-slate-800"
        >

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold">
            H
          </div>


          <div className="min-w-0 flex-1">

            <p className="truncate text-sm font-medium">
              Harshit
            </p>

            <p className="truncate text-xs text-slate-500">
              AI Engineer
            </p>

          </div>


          <span
            className={`text-xs text-slate-400 transition-transform ${
              profileOpen
                ? "rotate-180"
                : ""
            }`}
          >
            ▲
          </span>

        </button>


        {/* Profile Menu */}

        {profileOpen && (

          <div className="absolute bottom-20 left-4 right-4 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-xl">

            {/* Profile */}

            <Link
              to="/profile"
              onClick={() =>
                setProfileOpen(false)
              }
              className="block px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <p className="font-medium">
                Profile
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                View your account
              </p>
            </Link>


            {/* Settings */}

            <Link
              to="/settings"
              onClick={() =>
                setProfileOpen(false)
              }
              className="block border-t border-slate-800 px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <p className="font-medium">
                Account Settings
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                Manage your preferences
              </p>
            </Link>


            {/* Logout */}

            <button
              onClick={handleLogout}
              className="block w-full border-t border-slate-800 px-4 py-3 text-left text-sm font-medium text-red-400 transition hover:bg-red-950/30 hover:text-red-300"
            >
              Logout
            </button>

          </div>

        )}

      </div>

    </aside>
  )
}

export default Sidebar