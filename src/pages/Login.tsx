import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('mp3856197@gmail.com')
  const [password, setPassword] = useState('admin123')

  const [showPwd, setShowPwd] = useState(false)
  const [remember, setRemember] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    if (!password) {
      setError('Please enter your password.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        'http://127.0.0.1:5000/api/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            'Invalid email or password'
        )
      }

      /*
       * Login successful
       *
       * Remember me checked असेल तर localStorage
       * नाहीतर sessionStorage वापरतो.
       */

      if (remember) {
        localStorage.setItem(
          'adminUser',
          JSON.stringify(data.user)
        )

        localStorage.setItem(
          'isLoggedIn',
          'true'
        )

        sessionStorage.removeItem('adminUser')
        sessionStorage.removeItem('isLoggedIn')
      } else {
        sessionStorage.setItem(
          'adminUser',
          JSON.stringify(data.user)
        )

        sessionStorage.setItem(
          'isLoggedIn',
          'true'
        )

        localStorage.removeItem('adminUser')
        localStorage.removeItem('isLoggedIn')
      }

      navigate('/dashboard')
    } catch (err) {
      console.error('Login error:', err)

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to login. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin()
    }
  }

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: 'var(--background)',
      }}
    >

      {/* =====================================================
          LEFT PANEL
      ====================================================== */}

      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 text-white"
        style={{
          background: '#0f172a',
        }}
      >

        {/* Logo */}

        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-3"
        >

          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'var(--primary)',
            }}
          >

            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >

              <path d="M12 14l9-5-9-5-9 5 9 5z" />

              <path
                d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
              />

            </svg>

          </div>

          <span
            className="font-bold text-xl"
            style={{
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            Student Management System
          </span>

        </button>

        {/* Main text */}

        <div>

          <h2
            className="text-4xl font-bold leading-tight mb-4"
            style={{
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            Manage your institution
            <br />
            with confidence.
          </h2>

          <p className="text-slate-400 text-lg leading-relaxed">
            Streamline student enrollment, attendance tracking,
            marks management, and more — all in one place.
          </p>

        </div>

        {/* Stats */}

        <div className="flex gap-6">

          {[
            '500+ Students',
            '20+ Courses',
            '99.9% Uptime',
          ].map((s) => (

            <div
              key={s}
              className="text-sm text-slate-400"
            >
              {s}
            </div>

          ))}

        </div>

      </div>


      {/* =====================================================
          RIGHT PANEL
      ====================================================== */}

      <div className="flex-1 flex items-center justify-center p-8">

        <div className="w-full max-w-md">

          {/* Mobile Logo */}

          <div className="lg:hidden flex items-center gap-3 mb-8">

            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'var(--primary)',
              }}
            >

              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >

                <path d="M12 14l9-5-9-5-9 5 9 5z" />

              </svg>

            </div>

            <span
              className="font-bold text-lg"
              style={{
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              Student MS
            </span>

          </div>


          {/* Heading */}

          <h1
            className="text-3xl font-bold mb-2"
            style={{
              fontFamily: 'Outfit, sans-serif',
              color: 'var(--foreground)',
            }}
          >
            Admin Login
          </h1>

          <p
            className="mb-8 text-sm"
            style={{
              color: 'var(--muted-foreground)',
            }}
          >
            Sign in to access the management panel
          </p>


          {/* =================================================
              LOGIN FORM
          ================================================== */}

          <div className="space-y-5">

            {/* Email */}

            <div>

              <label
                className="block text-sm font-medium mb-1.5"
                style={{
                  color: 'var(--foreground)',
                }}
              >
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                onKeyDown={handleKeyDown}
                placeholder="mp3856197@gmail.com"
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-shadow disabled:opacity-60"
                style={{
                  background: 'var(--card)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                }}
              />

            </div>


            {/* Password */}

            <div>

              <label
                className="block text-sm font-medium mb-1.5"
                style={{
                  color: 'var(--foreground)',
                }}
              >
                Password
              </label>

              <div className="relative">

                <input
                  type={
                    showPwd
                      ? 'text'
                      : 'password'
                  }
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full px-4 py-2.5 pr-10 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-shadow disabled:opacity-60"
                  style={{
                    background: 'var(--card)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                  }}
                />

                {/* Show / Hide Password */}

                <button
                  type="button"
                  onClick={() =>
                    setShowPwd(!showPwd)
                  }
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{
                    color:
                      'var(--muted-foreground)',
                  }}
                >

                  {showPwd ? (

                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >

                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />

                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />

                      <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />

                      <line
                        x1="1"
                        y1="1"
                        x2="23"
                        y2="23"
                      />

                    </svg>

                  ) : (

                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >

                      <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" />

                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                      />

                    </svg>

                  )}

                </button>

              </div>

            </div>


            {/* Error Message */}

            {error && (

              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">

                <p className="text-sm text-red-600">
                  {error}
                </p>

              </div>

            )}


            {/* Remember + Forgot */}

            <div className="flex items-center justify-between">

              <label className="flex items-center gap-2 cursor-pointer">

                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) =>
                    setRemember(
                      e.target.checked
                    )
                  }
                  disabled={loading}
                  className="rounded"
                  style={{
                    accentColor:
                      'var(--primary)',
                  }}
                />

                <span
                  className="text-sm"
                  style={{
                    color:
                      'var(--muted-foreground)',
                  }}
                >
                  Remember me
                </span>

              </label>


              <Link
                to="/forgot-password"
                className="text-sm font-medium"
                style={{
                  color: 'var(--primary)',
                }}
              >
                Forgot password?
              </Link>

            </div>


            {/* Login Button */}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{
                background: 'var(--primary)',
              }}
            >

              {loading
                ? 'Signing in...'
                : 'Sign In'}

            </button>

          </div>

        </div>

      </div>

    </div>
  )
}