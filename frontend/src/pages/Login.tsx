import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { loginUser } from "../services/api"


const Login = () => {
  const navigate = useNavigate()

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

      const result = await loginUser({
        email,
        password,
      })

      localStorage.setItem(
        "token",
        result.access_token
      )

      navigate("/")
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Login failed"
      )
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-slate-950">

      {/* =========================================
          Main Layout
      ========================================= */}

      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:flex-row">


        {/* =========================================
            Branding Section
        ========================================= */}

        <section className="flex flex-1 items-center px-6 py-10 sm:px-10 lg:px-12 xl:px-20 lg:py-0">

          <div className="w-full max-w-2xl">

            {/* Brand */}

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-xl font-bold text-white shadow-lg shadow-blue-500/20">
                ✦
              </div>

              <span className="text-lg font-bold tracking-tight text-white">
                AI Meeting
              </span>

            </div>


            {/* Branding Content */}

            <div className="mt-8 sm:mt-10 lg:mt-12">

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400 sm:text-sm">
                Meeting Intelligence
              </p>


              <h1 className="mt-4 max-w-xl text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl">
                Turn meetings into actionable insights.
              </h1>


              <p className="mt-5 max-w-lg text-sm leading-7 text-slate-400 sm:text-base sm:leading-8">
                Transcribe conversations, generate summaries,
                identify decisions, and extract action items
                automatically.
              </p>

            </div>


            {/* Desktop Feature Indicators */}

            <div className="mt-8 hidden items-center gap-6 text-sm text-slate-500 lg:flex">

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                AI Transcription
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                Smart Summaries
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                Action Items
              </div>

            </div>

          </div>

        </section>


        {/* =========================================
            Login Section
        ========================================= */}

        <section className="flex w-full items-center justify-center px-5 pb-10 sm:px-8 sm:pb-12 lg:w-[44%] lg:px-10 lg:py-12 xl:w-[42%] xl:px-16">

          <div className="w-full max-w-md">

            {/* Login Card */}

            <div className="rounded-2xl bg-white p-6 shadow-2xl shadow-black/20 sm:p-8 lg:p-10">

              {/* Header */}

              <div className="mb-7">

                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sign in to your workspace
                </p>

              </div>


              {/* Error */}

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                  {error}
                </div>
              )}


              {/* Form */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* Email */}

                <div>

                  <label
                    htmlFor="login-email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Email
                  </label>

                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />

                </div>


                {/* Password */}

                <div>

                  <label
                    htmlFor="login-password"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>

                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />

                </div>


                {/* Submit */}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Signing in..."
                    : "Sign in"}
                </button>

              </form>


              {/* Register */}

              <div className="mt-7 border-t border-slate-100 pt-6">

                <p className="text-center text-sm text-slate-500">

                  Don't have an account?{" "}

                  <Link
                    to="/register"
                    className="font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    Create one
                  </Link>

                </p>

              </div>

            </div>


            {/* Footer */}

            <p className="mt-5 text-center text-xs text-slate-600">
              AI-powered meeting intelligence
            </p>

          </div>

        </section>

      </div>

    </div>
  )
}


export default Login