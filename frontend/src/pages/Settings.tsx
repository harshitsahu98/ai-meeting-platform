import { useEffect, useState } from "react"

import {
  getCurrentUser,
  updatePassword,
  updateProfile,
} from "../services/api"


const Settings = () => {

  const [name, setName] =
    useState("")

  const [email, setEmail] =
    useState("")


  const [currentPassword, setCurrentPassword] =
    useState("")

  const [newPassword, setNewPassword] =
    useState("")

  const [confirmPassword, setConfirmPassword] =
    useState("")


  const [loading, setLoading] =
    useState(true)

  const [savingProfile, setSavingProfile] =
    useState(false)

  const [savingPassword, setSavingPassword] =
    useState(false)


  const [message, setMessage] =
    useState("")

  const [error, setError] =
    useState("")


  const loadProfile = async () => {
    try {

      setLoading(true)
      setError("")

      const userData =
        await getCurrentUser()

      setName(userData.name)
      setEmail(userData.email)

    } catch (error) {

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load account"
      )

    } finally {

      setLoading(false)

    }
  }


  useEffect(() => {
    loadProfile()
  }, [])


  const handleProfileUpdate = async (
    event: React.FormEvent
  ) => {

    event.preventDefault()

    try {

      setSavingProfile(true)
      setMessage("")
      setError("")


      const updatedUser =
        await updateProfile({
          name,
          email,
        })


      setName(updatedUser.name)
      setEmail(updatedUser.email)

      setMessage(
        "Profile updated successfully."
      )

    } catch (error) {

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update profile"
      )

    } finally {

      setSavingProfile(false)

    }
  }


  const handlePasswordUpdate = async (
    event: React.FormEvent
  ) => {

    event.preventDefault()

    setMessage("")
    setError("")


    if (
      newPassword !== confirmPassword
    ) {

      setError(
        "New passwords do not match."
      )

      return
    }


    if (!newPassword) {

      setError(
        "Please enter a new password."
      )

      return
    }


    try {

      setSavingPassword(true)


      await updatePassword({
        current_password:
          currentPassword,

        new_password:
          newPassword,
      })


      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")


      setMessage(
        "Password updated successfully."
      )

    } catch (error) {

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update password"
      )

    } finally {

      setSavingPassword(false)

    }
  }


  if (loading) {

    return (

      <main className="flex-1 p-8">

        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          Loading settings...
        </div>

      </main>

    )
  }


  return (

    <main className="flex-1 p-8">

      {/* Header */}

      <div>

        <p className="text-sm font-medium text-blue-600">
          System
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Account Settings
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage your profile and security.
        </p>

      </div>


      {/* Messages */}

      {message && (

        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>

      )}


      {error && (

        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>

      )}


      <div className="mt-8 max-w-3xl space-y-6">


        {/* Profile Settings */}

        <form
          onSubmit={handleProfileUpdate}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >

          <h2 className="text-lg font-semibold text-slate-900">
            Profile Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Update your name and email address.
          </p>


          <div className="mt-6 space-y-5">

            {/* Name */}

            <div>

              <label className="text-sm font-medium text-slate-700">
                Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                required
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>


            {/* Email */}

            <div>

              <label className="text-sm font-medium text-slate-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>


            <button
              type="submit"
              disabled={savingProfile}
              className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingProfile
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </form>


        {/* Password Settings */}

        <form
          onSubmit={handlePasswordUpdate}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >

          <h2 className="text-lg font-semibold text-slate-900">
            Password
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Change your account password.
          </p>


          <div className="mt-6 space-y-5">

            {/* Current Password */}

            <div>

              <label className="text-sm font-medium text-slate-700">
                Current Password
              </label>

              <input
                type="password"
                value={currentPassword}
                onChange={(event) =>
                  setCurrentPassword(
                    event.target.value
                  )
                }
                required
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>


            {/* New Password */}

            <div>

              <label className="text-sm font-medium text-slate-700">
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(
                    event.target.value
                  )
                }
                required
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>


            {/* Confirm Password */}

            <div>

              <label className="text-sm font-medium text-slate-700">
                Confirm New Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                required
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>


            <button
              type="submit"
              disabled={savingPassword}
              className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingPassword
                ? "Updating..."
                : "Update Password"}
            </button>

          </div>

        </form>

      </div>

    </main>
  )
}


export default Settings