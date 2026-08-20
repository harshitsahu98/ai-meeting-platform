import { useEffect, useState } from "react"
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom"

import {
  getCurrentUser,
  type User,
} from "../services/api"


const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const [profileOpen, setProfileOpen] =
    useState(false)

  const [mobileOpen, setMobileOpen] =
    useState(false)

  const [user, setUser] =
    useState<User | null>(null)

  const [userLoading, setUserLoading] =
    useState(true)


  const isActive = (path: string) => {
    return location.pathname === path
  }


  const closeMobileMenu = () => {
    setMobileOpen(false)
  }


  const handleLogout = () => {
    localStorage.removeItem("token")

    setProfileOpen(false)
    setMobileOpen(false)

    navigate("/login")
  }


  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser =
          await getCurrentUser()

        setUser(currentUser)
      } catch {
        setUser(null)
      } finally {
        setUserLoading(false)
      }
    }

    loadUser()
  }, [])


  const getInitial = () => {
    if (user?.name) {
      return user.name
        .trim()
        .charAt(0)
        .toUpperCase()
    }

    if (user?.email) {
      return user.email
        .trim()
        .charAt(0)
        .toUpperCase()
    }

    return "U"
  }


  const navigation = (
    <>
      <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Workspace
      </p>


      <div className="mt-3 space-y-1">

        <Link
          to="/"
          onClick={closeMobileMenu}
          className={`block w-full rounded-lg px-3 py-2.5 text-sm font-medium transition ${
            isActive("/")
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:bg-slate-900 hover:text-white"
          }`}
        >
          Dashboard
        </Link>


        <Link
          to="/meetings"
          onClick={closeMobileMenu}
          className={`block w-full rounded-lg px-3 py-2.5 text-sm font-medium transition ${
            isActive("/meetings")
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:bg-slate-900 hover:text-white"
          }`}
        >
          Meetings
        </Link>


        <Link
          to="/recordings"
          onClick={closeMobileMenu}
          className={`block w-full rounded-lg px-3 py-2.5 text-sm font-medium transition ${
            isActive("/recordings")
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:bg-slate-900 hover:text-white"
          }`}
        >
          Recordings
        </Link>


        <Link
          to="/transcripts"
          onClick={closeMobileMenu}
          className={`block w-full rounded-lg px-3 py-2.5 text-sm font-medium transition ${
            isActive("/transcripts")
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:bg-slate-900 hover:text-white"
          }`}
        >
          Transcripts
        </Link>


        <Link
          to="/ai-insights"
          onClick={closeMobileMenu}
          className={`block w-full rounded-lg px-3 py-2.5 text-sm font-medium transition ${
            isActive("/ai-insights")
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:bg-slate-900 hover:text-white"
          }`}
        >
          AI Insights
        </Link>

      </div>


      <p className="mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
        System
      </p>


      <div className="mt-3 space-y-1">

        <Link
          to="/analytics"
          onClick={closeMobileMenu}
          className={`block w-full rounded-lg px-3 py-2.5 text-sm font-medium transition ${
            isActive("/analytics")
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:bg-slate-900 hover:text-white"
          }`}
        >
          Analytics
        </Link>


        <Link
          to="/settings"
          onClick={closeMobileMenu}
          className={`block w-full rounded-lg px-3 py-2.5 text-sm font-medium transition ${
            isActive("/settings")
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:bg-slate-900 hover:text-white"
          }`}
        >
          Settings
        </Link>

      </div>
    </>
  )


  const profile = (
    <div className="relative border-t border-slate-800 p-4">

      <button
        onClick={() =>
          setProfileOpen(
            (current) => !current
          )
        }
        className="flex w-full items-center gap-3 rounded-lg bg-slate-900 p-3 text-left transition hover:bg-slate-800"
      >

        {/* User Avatar */}

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold">
          {getInitial()}
        </div>


        {/* User Information */}

        <div className="min-w-0 flex-1">

          {userLoading ? (

            <>
              <p className="truncate text-sm font-medium text-slate-400">
                Loading...
              </p>

              <p className="mt-0.5 truncate text-xs text-slate-600">
                Loading profile
              </p>
            </>

          ) : user ? (

            <>
              <p className="truncate text-sm font-medium text-white">
                {user.name}
              </p>

              <p className="mt-0.5 truncate text-xs text-slate-500">
                {user.email}
              </p>
            </>

          ) : (

            <>
              <p className="truncate text-sm font-medium text-white">
                User
              </p>

              <p className="mt-0.5 truncate text-xs text-slate-500">
                Account
              </p>
            </>

          )}

        </div>


        {/* Profile Arrow */}

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

        <div className="absolute bottom-20 left-4 right-4 z-50 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-xl">

          {/* Profile */}

          <Link
            to="/profile"
            onClick={() => {
              setProfileOpen(false)
              closeMobileMenu()
            }}
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
            onClick={() => {
              setProfileOpen(false)
              closeMobileMenu()
            }}
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
  )


  return (
    <>

      {/* ============================== */}
      {/* Mobile Header */}
      {/* ============================== */}

      <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-4 text-white md:hidden">

        <div>

          <h1 className="text-lg font-bold">
            AI Meeting
          </h1>

          <p className="text-xs text-slate-500">
            Intelligence
          </p>

        </div>


        <button
          onClick={() =>
            setMobileOpen(
              (current) => !current
            )
          }
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-xl text-white transition hover:bg-slate-800"
          aria-label="Toggle navigation"
        >
          {mobileOpen
            ? "✕"
            : "☰"}
        </button>

      </header>


      {/* ============================== */}
      {/* Mobile Overlay */}
      {/* ============================== */}

      {mobileOpen && (

        <button
          aria-label="Close navigation"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />

      )}


      {/* ============================== */}
      {/* Mobile Sidebar */}
      {/* ============================== */}

      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 flex w-72 max-w-[85vw] flex-col bg-slate-950 text-white transition-transform duration-300 md:hidden ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-6">

          <div>

            <h1 className="text-xl font-bold">
              AI Meeting
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Intelligence
            </p>

          </div>


          <button
            onClick={closeMobileMenu}
            className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-900 hover:text-white"
            aria-label="Close navigation"
          >
            ✕
          </button>

        </div>


        <nav className="flex-1 overflow-y-auto px-4 py-6">
          {navigation}
        </nav>


        {profile}

      </aside>


      {/* ============================== */}
      {/* Desktop Sidebar */}
      {/* ============================== */}

      <aside className="hidden min-h-screen w-64 shrink-0 flex-col bg-slate-950 text-white md:flex">

        <div className="border-b border-slate-800 px-6 py-6">

          <h1 className="text-xl font-bold">
            AI Meeting
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Intelligence
          </p>

        </div>


        <nav className="flex-1 overflow-y-auto px-4 py-6">
          {navigation}
        </nav>


        {profile}

      </aside>

    </>
  )
}


export default Sidebar