import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

type Profile = {
  id?: number
  name: string
  email: string
  phone: string
  role: string
}

export default function AdminProfile() {
  const navigate = useNavigate()

  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState<Profile>({
    name: '',
    email: '',
    phone: '',
    role: 'Administrator',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await fetch(
        'http://127.0.0.1:5000/api/admin/profile'
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || 'Profile load failed')
        return
      }

      setForm({
        id: data.id,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        role: data.role || 'Administrator',
      })

      localStorage.setItem(
        'user',
        JSON.stringify({
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role,
        })
      )
    } catch (error) {
      console.error(error)
      alert('Backend connection failed')
    } finally {
      setLoading(false)
    }
  }

  const update = (field: string, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  const saveProfile = async () => {
    if (!form.name.trim()) {
      alert('Please enter your name')
      return
    }

    if (!form.email.trim()) {
      alert('Please enter your email')
      return
    }

    setSaving(true)

    try {
      const response = await fetch(
        'http://127.0.0.1:5000/api/admin/profile',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || 'Profile update failed')
        return
      }

      const updatedUser = data.user

      setForm({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || '',
        role: updatedUser.role || 'Administrator',
      })

      localStorage.setItem(
        'user',
        JSON.stringify(updatedUser)
      )

      setEditing(false)
      setSaved(true)

      setTimeout(() => {
        setSaved(false)
      }, 3000)
    } catch (error) {
      console.error(error)
      alert('Backend connection failed')
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    setEditing(false)
    loadProfile()
  }

  if (loading) {
    return (
      <Layout title="Admin Profile">
        <div className="p-6">
          Loading profile...
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Admin Profile">

      {saved && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Profile updated successfully!
        </div>
      )}

      <div className="max-w-xl">

        <button
          onClick={() => navigate('/dashboard')}
          className="mb-5 text-sm text-slate-600 hover:text-slate-900"
        >
          ← Back to Dashboard
        </button>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          {/* Header */}
          <div className="bg-[#0f172a] px-6 py-7 text-white">

            <div className="flex items-center gap-4">

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl font-bold text-[#0f172a]">
                {form.name
                  ? form.name.charAt(0).toUpperCase()
                  : 'A'}
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  {form.name || 'Admin User'}
                </h2>

                <span className="mt-1 inline-block rounded-full bg-white/10 px-3 py-1 text-xs">
                  {form.role || 'Administrator'}
                </span>
              </div>

            </div>

          </div>

          {/* Content */}
          <div className="p-6">

            {editing ? (
              <div className="space-y-5">

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Name
                  </label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      update('name', e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                    placeholder="Enter name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      update('email', e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                    placeholder="Enter email"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Phone
                  </label>

                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) =>
                      update('phone', e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                    placeholder="Enter phone"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Role
                  </label>

                  <input
                    type="text"
                    value={form.role}
                    disabled
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">

                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="rounded-lg bg-[#0f172a] px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>

                  <button
                    onClick={cancelEdit}
                    disabled={saving}
                    className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                </div>

              </div>
            ) : (
              <div>

                <div className="space-y-5">

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Name
                    </p>

                    <p className="mt-1 text-sm text-slate-800">
                      {form.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Email
                    </p>

                    <p className="mt-1 text-sm text-slate-800">
                      {form.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Phone
                    </p>

                    <p className="mt-1 text-sm text-slate-800">
                      {form.phone || 'Not added'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Role
                    </p>

                    <p className="mt-1 text-sm text-slate-800">
                      {form.role}
                    </p>
                  </div>

                </div>

                <div className="mt-7 flex gap-3">

                  <button
                    onClick={() => setEditing(true)}
                    className="rounded-lg bg-[#0f172a] px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    Edit Profile
                  </button>

                  <button
                    onClick={() => navigate('/settings')}
                    className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Change Password
                  </button>

                </div>

              </div>
            )}

          </div>

        </div>

      </div>

    </Layout>
  )
}