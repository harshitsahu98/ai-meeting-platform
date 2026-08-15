import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { registerUser } from "../services/api"

const Register = () => {
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    try {
      setLoading(true)
      setError("")

      await registerUser({
        name,
        email,
        password,
      })

      navigate("/login")
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Registration failed"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-950">

      <div className="hidden flex-1 flex-col justify-center px-16 text-white lg:flex">

        <div className="max-w-lg">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
            AI Meeting Intelligence
          </p>

          <h1 className="mt-5 text-5xl font-bold leading-tight">
            Build smarter meetings with AI.
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-400">
            One workspace for recordings, transcripts,
            summaries, decisions, and action items.
          </p>
        </div>

      </div>

      <div className="flex w-full items-center justify-center bg-slate-50 px-6 lg:w-[480px]">

        <div className="w-full max-w-md">

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">
              Create account
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Start your AI meeting workspace
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Harshit"
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="••••••••"
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creating account..."
                : "Create account"}
            </button>

          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Sign in
            </Link>
          </p>

        </div>

      </div>

    </div>
  )
}

export default Register