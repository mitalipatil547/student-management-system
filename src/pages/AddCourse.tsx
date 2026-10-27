import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

const API = 'http://127.0.0.1:5000/api'

export default function AddCourse() {
  const navigate = useNavigate()

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    name: '',
    code: '',
    duration: '',
    description: '',
  })

  const update = (field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    setError('')
    setSaved(false)

    if (!form.name.trim()) {
      setError('Please enter course name.')
      return
    }

    if (!form.code.trim()) {
      setError('Please enter course code.')
      return
    }

    if (!form.duration) {
      setError('Please select duration.')
      return
    }

    setSaving(true)

    try {
      const response = await fetch(`${API}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name.trim(),
          code: form.code.trim().toUpperCase(),
          duration: form.duration,
          description: form.description.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          'Failed to save course.'
        )
      }

      setSaved(true)

      setTimeout(() => {
        navigate('/courses')
      }, 800)

    } catch (err) {
      console.error('Save course error:', err)

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save course.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout title="Add Course">

      {saved && (
        <div
          className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-white"
          style={{ background: '#059669' }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>

          Course saved successfully!
        </div>
      )}

      <div className="max-w-lg">

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center gap-1.5 text-sm"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>

            Back to Courses
          </button>
        </div>

        <div
          className="rounded-xl border shadow-sm"
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >

          <div
            className="px-6 py-4 border-b"
            style={{ borderColor: 'var(--border)' }}
          >
            <h2
              className="font-semibold text-lg"
              style={{
                fontFamily: 'Outfit, sans-serif',
                color: 'var(--foreground)',
              }}
            >
              Add New Course
            </h2>

            <p
              className="text-sm mt-1"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Add a new course to your college.
            </p>
          </div>

          <div className="p-6 space-y-4">

            {error && (
              <div
                className="px-4 py-3 rounded-lg border text-sm"
                style={{
                  background: '#fef2f2',
                  borderColor: '#fecaca',
                  color: '#dc2626',
                }}
              >
                {error}
              </div>
            )}

            <Field
              label="Course Name"
              value={form.name}
              onChange={value => update('name', value)}
              placeholder="e.g. Bachelor of Computer Applications"
            />

            <Field
              label="Course Code"
              value={form.code}
              onChange={value => update('code', value)}
              placeholder="e.g. BCA"
            />

            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--foreground)' }}
              >
                Duration
              </label>

              <select
                value={form.duration}
                onChange={e =>
                  update('duration', e.target.value)
                }
                className="w-full px-3 py-2.5 rounded-lg border text-sm"
                style={{
                  background: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                }}
              >
                <option value="">Select duration</option>
                <option value="1 year">1 year</option>
                <option value="2 years">2 years</option>
                <option value="3 years">3 years</option>
                <option value="4 years">4 years</option>
                <option value="5 years">5 years</option>
              </select>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--foreground)' }}
              >
                Description
              </label>

              <textarea
                value={form.description}
                onChange={e =>
                  update('description', e.target.value)
                }
                rows={4}
                placeholder="Brief description of the course..."
                className="w-full px-3 py-2.5 rounded-lg border text-sm resize-none"
                style={{
                  background: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                }}
              />
            </div>

          </div>

          <div
            className="flex gap-3 px-6 py-4 border-t"
            style={{ borderColor: 'var(--border)' }}
          >

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: 'var(--primary)' }}
            >
              {saving ? 'Saving...' : 'Save Course'}
            </button>

            <button
              onClick={() => navigate('/courses')}
              disabled={saving}
              className="px-5 py-2.5 rounded-lg text-sm font-medium border"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
            >
              Cancel
            </button>

          </div>

        </div>
      </div>
    </Layout>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <label
        className="block text-sm font-medium mb-1.5"
        style={{ color: 'var(--foreground)' }}
      >
        {label}
      </label>

      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-lg border text-sm"
        style={{
          background: 'var(--background)',
          borderColor: 'var(--border)',
          color: 'var(--foreground)',
        }}
      />
    </div>
  )
}