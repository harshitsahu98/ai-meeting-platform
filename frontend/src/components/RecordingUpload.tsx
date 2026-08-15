import { useState } from "react"

import { uploadRecording } from "../services/api"

interface RecordingUploadProps {
  meetingId: number
  onUploaded?: () => void
}

const RecordingUpload = ({
  meetingId,
  onUploaded,
}: RecordingUploadProps) => {
  const [file, setFile] = useState<File | null>(null)

  const [uploading, setUploading] = useState(false)

  const [error, setError] = useState("")

  const [success, setSuccess] = useState("")

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0]

    setError("")
    setSuccess("")

    if (!selectedFile) {
      setFile(null)
      return
    }

    const allowedTypes = [
      "audio/mpeg",
      "audio/wav",
      "audio/x-wav",
      "audio/mp3",
    ]

    if (!allowedTypes.includes(selectedFile.type)) {
      setError(
        "Please select an MP3 or WAV audio file."
      )

      setFile(null)
      return
    }

    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an audio file first.")
      return
    }

    try {
      setUploading(true)
      setError("")
      setSuccess("")

      await uploadRecording(
        meetingId,
        file
      )

      setSuccess(
        "Recording uploaded successfully."
      )

      setFile(null)

      onUploaded?.()
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to upload recording."
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Upload Recording
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Upload an MP3 or WAV recording for this meeting.
        </p>
      </div>

      <div className="mt-5">

        <label
          htmlFor="recording-file"
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 px-6 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50/30"
        >

          <div className="text-3xl">
            🎙️
          </div>

          <p className="mt-3 text-sm font-medium text-slate-700">
            Choose an audio recording
          </p>

          <p className="mt-1 text-xs text-slate-500">
            MP3 or WAV
          </p>

          <input
            id="recording-file"
            type="file"
            accept=".mp3,.wav,audio/mpeg,audio/wav"
            onChange={handleFileChange}
            className="hidden"
          />

        </label>

      </div>

      {file && (
        <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">

          <div className="min-w-0">

            <p className="truncate text-sm font-medium text-slate-800">
              {file.name}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>

          </div>

          <button
            type="button"
            onClick={() => setFile(null)}
            className="ml-4 text-sm font-medium text-red-600 hover:text-red-700"
          >
            Remove
          </button>

        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={!file || uploading}
        className="mt-5 w-full rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploading
          ? "Uploading..."
          : "Upload Recording"}
      </button>

    </div>
  )
}

export default RecordingUpload