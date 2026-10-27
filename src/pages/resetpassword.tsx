import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()

  const token = new URLSearchParams(location.search).get('token') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleReset = async () => {
    setError('')

    if (!token) {
      setError('Invalid or missing reset token.')
      return
    }

    if (!newPassword || !confirmPassword) {
      setError('Please enter both password fields.')
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

    setLoading(true)

    try {
      const response = await fetch(
        'http://127.0.0.1:5000/api/reset-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            new_password: newPassword,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(
          data.error ||
          data.message ||
          'Unable to reset password.'
        )
        return
      }

      setSuccess(true)
    } catch (err) {
      setError(
        'Backend connection failed. Please make sure the backend is running.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--background)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-sm border p-8"
        style={{
          background: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        {!success ? (
          <>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
              style={{ background: 'var(--secondary)' }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: 'var(--primary)' }}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <rect
                  x="3"
                  y="11"
                  width="18"
                  height="11"
                  rx="2"
                  ry="2"
                />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>

            <h1
              className="text-2xl font-bold mb-2"
              style={{
                fontFamily: 'Outfit, sans-serif',
                color: 'var(--foreground)',
              }}
            >
              Reset Password
            </h1>

            <p
              className="text-sm mb-6"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Enter your new password below.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: 'var(--foreground)' }}
                >
                  New Password
                </label>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none"
                  style={{
                    background: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: 'var(--foreground)' }}
                >
                  Confirm Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none"
                  style={{
                    background: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                  }}
                />
              </div>

              <button
                onClick={handleReset}
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: 'var(--primary)' }}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 rounded-lg text-sm font-medium border"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                }}
              >
                Back to Login
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h1
              className="text-2xl font-bold mb-2"
              style={{
                fontFamily: 'Outfit, sans-serif',
                color: 'var(--foreground)',
              }}
            >
              Password Reset Successful
            </h1>

            <p
              className="text-sm mb-6"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Your password has been changed successfully. You can now login
              with your new password.
            </p>

            <button
              onClick={() => navigate('/login')}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white"
              style={{ background: 'var(--primary)' }}
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  )
}