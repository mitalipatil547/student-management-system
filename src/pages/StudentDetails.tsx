import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import DeleteModal from '../components/DeleteModal'

type Student = {
  id: number
  name: string
  email: string
  phone: string
  course: string
  created_at?: string
}

export default function StudentDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `http://127.0.0.1:5000/api/students/${id}`
        )

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Unable to load student.')
          return
        }

        setStudent(data)
      } catch (err) {
        setError(
          'Backend connection failed. Please make sure the backend is running.'
        )
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchStudent()
    }
  }, [id])

  const handleDelete = async () => {
    if (!student) return

    try {
      setDeleteLoading(true)

      const response = await fetch(
        `http://127.0.0.1:5000/api/students/${student.id}`,
        {
          method: 'DELETE',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Unable to delete student.')
        setDeleting(false)
        return
      }

      navigate('/students')
    } catch (err) {
      setError(
        'Backend connection failed. Please make sure the backend is running.'
      )
      setDeleting(false)
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout title="Student Details">
        <div
          className="p-6 rounded-xl border"
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border)',
            color: 'var(--muted-foreground)',
          }}
        >
          Loading student details...
        </div>
      </Layout>
    )
  }

  if (error || !student) {
    return (
      <Layout title="Student Details">
        <div
          className="p-6 rounded-xl border"
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <p className="text-sm text-red-600 mb-4">
            {error || 'Student not found.'}
          </p>

          <button
            onClick={() => navigate('/students')}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: 'var(--primary)' }}
          >
            Back to Students
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Student Details">
      {deleting && (
        <DeleteModal
          onCancel={() => !deleteLoading && setDeleting(false)}
          onConfirm={handleDelete}
        />
      )}

      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/students')}
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
            Back to Students
          </button>
        </div>

        {/* Profile header */}
        <div
          className="rounded-xl border shadow-sm p-6 mb-4 flex flex-wrap items-start gap-5"
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold flex-shrink-0"
            style={{ background: 'var(--primary)' }}
          >
            {student.name.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h2
                className="text-2xl font-bold"
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  color: 'var(--foreground)',
                }}
              >
                {student.name}
              </h2>

              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                Active
              </span>
            </div>

            <p
              className="text-sm font-mono mb-3"
              style={{ color: 'var(--muted-foreground)' }}
            >
              ID: {student.id}
            </p>

            <div className="flex flex-wrap gap-4">
              <Chip icon="📚" label={student.course || 'Not specified'} />
              <Chip icon="📧" label={student.email || 'Not specified'} />
              <Chip icon="📞" label={student.phone || 'Not specified'} />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => navigate(`/students/${student.id}/edit`)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: 'var(--primary)' }}
            >
              Edit Student
            </button>

            <button
              onClick={() => setDeleting(true)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Personal */}
          <InfoCard title="Personal Information">
            <Row label="Name" value={student.name} />
            <Row label="Email" value={student.email || 'Not specified'} />
            <Row label="Phone" value={student.phone || 'Not specified'} />
            <Row label="Course" value={student.course || 'Not specified'} />
          </InfoCard>

          {/* Student Information */}
          <InfoCard title="Student Information">
            <Row label="Student ID" value={String(student.id)} />
            <Row label="Course" value={student.course || 'Not specified'} />
            <Row
              label="Created Date"
              value={
                student.created_at
                  ? new Date(student.created_at).toLocaleDateString()
                  : 'Not available'
              }
            />
            <Row label="Status" value="Active" />
          </InfoCard>

          {/* Contact */}
          <InfoCard title="Contact Information">
            <Row label="Email" value={student.email || 'Not specified'} />
            <Row label="Phone" value={student.phone || 'Not specified'} />
          </InfoCard>

          {/* Academic */}
          <InfoCard title="Academic Information">
            <Row label="Course" value={student.course || 'Not specified'} />
            <Row label="Status" value="Active" />
          </InfoCard>
        </div>

        {/* Quick actions */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() =>
              navigate(`/students/${student.id}/attendance`)
            }
            className="px-5 py-2.5 rounded-lg text-sm font-medium border"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
          >
            View Attendance
          </button>

          <button
            onClick={() => navigate(`/students/${student.id}/result`)}
            className="px-5 py-2.5 rounded-lg text-sm font-medium border"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
          >
            View Marks
          </button>
        </div>
      </div>
    </Layout>
  )
}

function Chip({
  icon,
  label,
}: {
  icon: string
  label: string
}) {
  return (
    <span
      className="flex items-center gap-1.5 text-sm"
      style={{ color: 'var(--muted-foreground)' }}
    >
      {icon} {label}
    </span>
  )
}

function InfoCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-xl border shadow-sm p-5"
      style={{
        background: 'var(--card)',
        borderColor: 'var(--border)',
      }}
    >
      <h3
        className="font-semibold mb-4 pb-2 border-b text-sm"
        style={{
          fontFamily: 'Outfit, sans-serif',
          color: 'var(--foreground)',
          borderColor: 'var(--border)',
        }}
      >
        {title}
      </h3>

      <div className="space-y-2.5">{children}</div>
    </div>
  )
}

function Row({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span
        className="text-xs"
        style={{ color: 'var(--muted-foreground)' }}
      >
        {label}
      </span>

      <span
        className="text-sm text-right"
        style={{ color: 'var(--foreground)' }}
      >
        {value}
      </span>
    </div>
  )
}