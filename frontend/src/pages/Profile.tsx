import { useEffect, useState } from "react"
import {
  getCurrentUser,
  type User,
} from "../services/api"


const Profile = () => {
  const [user, setUser] =
    useState<User | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")


  const loadProfile = async () => {
    try {
      setLoading(true)
      setError("")

      const userData =
        await getCurrentUser()

      setUser(userData)

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load profile"
      )
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    loadProfile()
  }, [])


  if (loading) {
    return (
      <main className="flex-1 p-8">

        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          Loading profile...
        </div>

      </main>
    )
  }


  return (
    <main className="flex-1 p-8">

      {/* Header */}

      <div>

        <p className="text-sm font-medium text-blue-600">
          Account
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Profile
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          View your account information.
        </p>

      </div>


      {/* Error */}

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}


      {/* Profile Card */}

      {user && (

        <div className="mt-8 max-w-3xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">

          <div className="flex items-center gap-5">

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
              {user.name
                .charAt(0)
                .toUpperCase()}
            </div>


            <div>

              <h2 className="text-xl font-semibold text-slate-900">
                {user.name}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {user.email}
              </p>

            </div>

          </div>


          {/* Account Information */}

          <div className="mt-8 border-t border-slate-100 pt-6">

            <h3 className="text-lg font-semibold text-slate-900">
              Account Information
            </h3>


            <div className="mt-5 space-y-5">

              <div>

                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  User ID
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  {user.id}
                </p>

              </div>


              <div>

                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Name
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  {user.name}
                </p>

              </div>


              <div>

                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Email
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  {user.email}
                </p>

              </div>

            </div>

          </div>

        </div>

      )}

    </main>
  )
}


export default Profile