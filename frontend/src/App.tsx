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
    <div className="flex min-h-screen w-full bg-slate-50">

      {/* Responsive Sidebar */}

      <Sidebar />


      {/* Main Application Content */}

      <main className="min-w-0 flex-1 pt-16 md:pt-0">

        <Routes>

          {/* Dashboard */}

          <Route
            path="/"
            element={<Dashboard />}
          />


          {/* AI Insights */}

          <Route
            path="/ai-insights"
            element={<AIInsights />}
          />


          {/* Analytics */}

          <Route
            path="/analytics"
            element={<Analytics />}
          />


          {/* Profile */}

          <Route
            path="/profile"
            element={<Profile />}
          />


          {/* Settings */}

          <Route
            path="/settings"
            element={<Settings />}
          />


          {/* Transcripts */}

          <Route
            path="/transcripts"
            element={<Transcripts />}
          />


          {/* Recordings */}

          <Route
            path="/recordings"
            element={<Recordings />}
          />


          {/* Meetings */}

          <Route
            path="/meetings"
            element={<Meetings />}
          />


          {/* Meeting Details */}

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

        {/* Authentication */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* Protected Application */}

        <Route
          path="/*"
          element={<ProtectedLayout />}
        />

      </Routes>

    </BrowserRouter>
  )
}


export default App