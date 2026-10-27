import { useEffect, useState } from 'react'
import Layout from '../components/Layout'

type AdminProfile = {
  id: number
  name: string
  email: string
  phone: string
  role: string
}

export default function Settings() {
  const [profile, setProfile] = useState<AdminProfile>({
    id: 0,
    name: '',
    email: '',
    phone: '',
    role: 'Administrator',
  })

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // =====================================================
  // LOAD ADMIN PROFILE
  // =====================================================

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        'http://127.0.0.1:5000/api/admin/profile',
        {
          cache: 'no-store',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to load admin profile')
      }

      const data = await response.json()

      setProfile({
        id: data.id || 0,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        role: data.role || 'Administrator',
      })
    } catch (err) {
      console.error(err)

      setError(
        'Backend server is not running. Please start the Flask server.'
      )
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  const handleSaveProfile = async () => {
    if (!profile.name.trim()) {
      alert('Please enter name')
      return
    }

    if (!profile.email.trim()) {
      alert('Please enter email')
      return
    }

    try {
      setSavingProfile(true)
      setMessage('')
      setError('')

      const response = await fetch(
        'http://127.0.0.1:5000/api/admin/profile',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: profile.name.trim(),
            email: profile.email.trim(),
            phone: profile.phone.trim(),
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to update profile'
        )
      }

      if (data.user) {
        setProfile(data.user)
      }

      setMessage('Profile updated successfully.')

      setTimeout(() => {
        setMessage('')
      }, 3000)
    } catch (err) {
      console.error(err)

      alert(
        err instanceof Error
          ? err.message
          : 'Failed to update profile'
      )
    } finally {
      setSavingProfile(false)
    }
  }

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  const handleChangePassword = async () => {
    setMessage('')
    setError('')

    if (!newPassword) {
      alert('Please enter new password')
      return
    }

    if (!confirmPassword) {
      alert('Please confirm your password')
      return
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match')
      return
    }

    try {
      setChangingPassword(true)

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
          data.message || 'Failed to change password'
        )
      }

      alert('Password changed successfully!')

      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      console.error(err)

      alert(
        err instanceof Error
          ? err.message
          : 'Failed to change password'
      )
    } finally {
      setChangingPassword(false)
    }
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <Layout title="Settings">
      <div className="space-y-6">

        {/* SUCCESS MESSAGE */}

        {message && (
          <div className="rounded-xl bg-green-50 border border-green-200 px-5 py-4 text-green-700">
            {message}
          </div>
        )}

        {/* ERROR MESSAGE */}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-red-700">
            {error}
          </div>
        )}

        {/* =================================================
            PROFILE
        ================================================= */}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">

          <div className="px-8 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              Profile Settings
            </h2>

            <p className="text-gray-500 mt-1">
              Update your administrator profile information.
            </p>
          </div>

          <div className="p-8">

            {loading ? (
              <p className="text-gray-500">
                Loading profile...
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* NAME */}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name
                  </label>

                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        name: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter name"
                  />
                </div>

                {/* EMAIL */}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>

                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        email: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email"
                  />
                </div>

                {/* PHONE */}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone
                  </label>

                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        phone: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone"
                  />
                </div>

                {/* ROLE */}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role
                  </label>

                  <input
                    type="text"
                    value={profile.role}
                    disabled
                    className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-gray-600"
                  />
                </div>

              </div>
            )}

            <button
              onClick={handleSaveProfile}
              disabled={savingProfile || loading}
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>

          </div>
        </div>

        {/* =================================================
            CHANGE PASSWORD
        ================================================= */}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">

          <div className="px-8 py-6 border-b border-gray-200">

            <h2 className="text-2xl font-bold text-gray-900">
              Change Password
            </h2>

            <p className="text-gray-500 mt-1">
              Set a new administrator password.
            </p>

          </div>

          <div className="p-8 max-w-3xl">

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
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter new password"
              />

              <p className="text-sm text-gray-500 mt-2">
                Minimum 6 characters.
              </p>

            </div>

            {/* CONFIRM PASSWORD */}

            <div className="mb-6">

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm New Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm new password"
              />

            </div>

            {/* BUTTON */}

            <button
              onClick={handleChangePassword}
              disabled={changingPassword}
              className="rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {changingPassword
                ? 'Changing...'
                : 'Change Password'}
            </button>

          </div>
        </div>

      </div>
    </Layout>
  )
}