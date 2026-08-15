const API_URL = "http://127.0.0.1:8000"


// ==============================
// Authentication
// ==============================

export interface RegisterData {
  name: string
  email: string
  password: string
}


export interface LoginData {
  email: string
  password: string
}


export interface TokenResponse {
  access_token: string
  token_type: string
}


export const registerUser = async (
  data: RegisterData
) => {
  const response = await fetch(
    `${API_URL}/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  )


  const result = await response.json()


  if (!response.ok) {
    throw new Error(
      result.detail || "Registration failed"
    )
  }


  return result
}


export const loginUser = async (
  data: LoginData
): Promise<TokenResponse> => {
  const body = new URLSearchParams()


  body.append("username", data.email)
  body.append("password", data.password)


  const response = await fetch(
    `${API_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body,
    }
  )


  const result = await response.json()


  if (!response.ok) {
    throw new Error(
      result.detail || "Login failed"
    )
  }


  return result
}


export const getToken = () => {
  return localStorage.getItem("token")
}


export const logoutUser = () => {
  localStorage.removeItem("token")
}


// ==============================
// User Profile
// ==============================

export interface User {
  id: number
  name: string
  email: string
}


export interface UpdateProfileData {
  name: string
  email: string
}


export interface UpdatePasswordData {
  current_password: string
  new_password: string
}


export const getCurrentUser = async (): Promise<User> => {
  const token = getToken()


  const response = await fetch(
    `${API_URL}/auth/me`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )


  const result = await response.json()


  if (!response.ok) {
    throw new Error(
      result.detail ||
        "Failed to fetch profile"
    )
  }


  return result
}


export const updateProfile = async (
  data: UpdateProfileData
): Promise<User> => {
  const token = getToken()


  const response = await fetch(
    `${API_URL}/auth/profile`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  )


  const result = await response.json()


  if (!response.ok) {
    throw new Error(
      result.detail ||
        "Failed to update profile"
    )
  }


  return result
}


export const updatePassword = async (
  data: UpdatePasswordData
) => {
  const token = getToken()


  const response = await fetch(
    `${API_URL}/auth/password`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  )


  const result = await response.json()


  if (!response.ok) {
    throw new Error(
      result.detail ||
        "Failed to update password"
    )
  }


  return result
}


// ==============================
// Meetings
// ==============================

export interface Meeting {
  id: number
  title: string
  duration: number
  date: string
  description: string | null
  user_id: number
}


export interface CreateMeetingData {
  title: string
  duration: number
  date: string
  description?: string
}


export interface UpdateMeetingData {
  title?: string
  duration?: number
  date?: string
  description?: string
}


export const updateMeeting = async (
  meetingId: number,
  data: UpdateMeetingData
): Promise<Meeting> => {
  const token = getToken()


  const response = await fetch(
    `${API_URL}/meetings/${meetingId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  )


  const result = await response.json()


  if (!response.ok) {
    throw new Error(
      result.detail ||
        "Failed to update meeting"
    )
  }


  return result
}


export const getMeetings = async (): Promise<Meeting[]> => {
  const token = getToken()


  const response = await fetch(
    `${API_URL}/meetings/`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )


  const result = await response.json()


  if (!response.ok) {
    throw new Error(
      result.detail ||
        "Failed to fetch meetings"
    )
  }


  return result
}


export const getMeeting = async (
  meetingId: number
): Promise<Meeting> => {
  const token = getToken()


  const response = await fetch(
    `${API_URL}/meetings/${meetingId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )


  const result = await response.json()


  if (!response.ok) {
    throw new Error(
      result.detail ||
        "Failed to fetch meeting"
    )
  }


  return result
}


export const createMeeting = async (
  data: CreateMeetingData
): Promise<Meeting> => {
  const token = getToken()


  const response = await fetch(
    `${API_URL}/meetings/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  )


  const result = await response.json()


  if (!response.ok) {
    throw new Error(
      result.detail ||
        "Failed to create meeting"
    )
  }


  return result
}


export const deleteMeeting = async (
  meetingId: number
) => {
  const token = getToken()


  const response = await fetch(
    `${API_URL}/meetings/${meetingId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )


  const result = await response.json()


  if (!response.ok) {
    throw new Error(
      result.detail ||
        "Failed to delete meeting"
    )
  }


  return result
}


// ==============================
// Recordings
// ==============================

export interface Recording {
  id: number
  meeting_id: number
  audio_url: string
  status: string
  created_at: string
}


export const getRecordings = async (): Promise<Recording[]> => {
  const token = getToken()


  const response = await fetch(
    `${API_URL}/recordings/`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )


  const result = await response.json()


  if (!response.ok) {
    throw new Error(
      result.detail ||
        "Failed to fetch recordings"
    )
  }


  return result
}


// ==============================
// Upload Recording
// ==============================

export const uploadRecording = async (
  meetingId: number,
  file: File
): Promise<Recording> => {
  const token = getToken()


  const formData = new FormData()


  formData.append(
    "audio_file",
    file
  )


  const response = await fetch(
    `${API_URL}/recordings/upload?meeting_id=${meetingId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  )


  const result = await response.json()


  if (!response.ok) {
    let message =
      "Failed to upload recording"


    if (typeof result.detail === "string") {
      message = result.detail
    } else if (Array.isArray(result.detail)) {
      message = result.detail
        .map(
          (item: { msg?: string }) =>
            item.msg ||
            "Validation error"
        )
        .join(", ")
    } else if (result.detail) {
      message = JSON.stringify(
        result.detail
      )
    }


    throw new Error(message)
  }


  return result
}


export const deleteRecording = async (
  recordingId: number
) => {
  const token = getToken()


  const response = await fetch(
    `${API_URL}/recordings/${recordingId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )


  const result = await response.json()


  if (!response.ok) {
    throw new Error(
      result.detail ||
        "Failed to delete recording"
    )
  }


  return result
}


// ==============================
// Transcript
// ==============================

export interface Transcript {
  id: number
  recording_id: number
  text: string
}


// ==============================
// Summary
// ==============================

export interface Summary {
  id: number
  transcript_id: number
  summary: string
  key_points: string
  action_items: string
  decisions: string
}


export const getSummaries = async (): Promise<Summary[]> => {
  const token = getToken()


  const response = await fetch(
    `${API_URL}/summaries/`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )


  const result = await response.json()


  if (!response.ok) {
    throw new Error(
      result.detail ||
        "Failed to fetch summaries"
    )
  }


  return result
}


// ==============================
// Transcription Result
// ==============================

export interface TranscriptionResult {
  transcript: Transcript
  summary: Summary
}


// ==============================
// Transcribe Recording
// ==============================

export const transcribeRecording = async (
  recordingId: number
): Promise<TranscriptionResult> => {
  const token = getToken()


  const response = await fetch(
    `${API_URL}/recordings/${recordingId}/transcribe`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )


  const result = await response.json()


  if (!response.ok) {
    throw new Error(
      result.detail ||
        "Failed to transcribe recording"
    )
  }


  return result
}


// ==============================
// Create Summary
// ==============================

export const createSummary = async (
  transcriptId: number
): Promise<Summary> => {
  const token = getToken()


  const response = await fetch(
    `${API_URL}/summaries/transcript/${transcriptId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )


  const result = await response.json()


  if (!response.ok) {
    throw new Error(
      result.detail ||
        "Failed to generate summary"
    )
  }


  return result
}