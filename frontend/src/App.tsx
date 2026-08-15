import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom"

import Sidebar from "./components/Sidebar"

import Dashboard from "./pages/Dashboard"
import Meetings from "./pages/Meetings"
import MeetingDetails from "./pages/MeetingDetails"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Analytics from "./pages/Analytics"
import AIInsights from "./pages/AIInsights"
import Recordings from "./pages/Recordings"
import Transcripts from "./pages/Transcripts"
import Profile from "./pages/Profile"
import Settings from "./pages/Settings"


function ProtectedLayout() {
  const token = localStorage.getItem("token")

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route path="/ai-insights" element={<AIInsights />} />

          <Route
            path="/analytics"
            element={<Analytics />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

          <Route
            path="/transcripts"
            element={<Transcripts />}
          />

          <Route
            path="/recordings"
            element={<Recordings />}
          />

          <Route
            path="/meetings"
            element={<Meetings />}
          />

          <Route
            path="/meetings/:meetingId"
            element={<MeetingDetails />}
          />
        </Routes>
      </main>
    </div>
  )
}


function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/*"
          element={<ProtectedLayout />}
        />

      </Routes>
    </BrowserRouter>
  )
}


export default App