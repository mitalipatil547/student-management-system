import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ForgotPassword() {
  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChangePassword = async () => {
    setError('')
    setSuccess('')

    if (!newPassword) {
      setError('Please enter new password.')
      return
    }

    if (!confirmPassword) {
      setError('Please confirm your password.')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        'http://127.0.0.1:5000/api/admin/password-reset-local',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            new_password: newPassword,
            confirm_password: confirmPassword,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Password change failed'
        )
      }

      setSuccess('Password changed successfully!')

      setNewPassword('')
      setConfirmPassword('')

      setTimeout(() => {
        navigate('/login')
      }, 1500)

    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Backend server is not running.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-10">

        {/* TITLE */}

        <div className="text-center mb-8">

          <h1 className="text-4xl font-bold text-gray-900">
            Forgot Password
          </h1>

          <p className="text-gray-500 mt-3">
            Create your new password
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-300 bg-red-50 px-4 py-4 text-red-700">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mb-6 rounded-xl border border-green-300 bg-green-50 px-4 py-4 text-green-700">
            {success}
          </div>
        )}

        {/* NEW PASSWORD */}

        <div className="mb-5">

          <label className="block text-sm font-semibold text-gray-700 mb-2">
            New Password
          </label>

          <input
            type="password"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(e.target.value)
            }
            placeholder="Enter new password"
            className="w-full rounded-xl border border-gray-300 px-4 py-4 outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

        {/* CONFIRM PASSWORD */}

        <div className="mb-7">

          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Confirm Password
          </label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            placeholder="Confirm password"
            className="w-full rounded-xl border border-gray-300 px-4 py-4 outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

        {/* BUTTON */}

        <button
          onClick={handleChangePassword}
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 px-6 py-4 text-lg font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Changing Password...' : 'Change Password'}
        </button>

        {/* BACK */}

        <button
          onClick={() => navigate('/login')}
          className="w-full mt-6 text-blue-600 font-semibold hover:underline"
        >
          ← Back to Login
        </button>

      </div>

    </div>
  )
}