import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import DeleteModal from '../components/DeleteModal'

type Course = {
  id: number
  code: string
  name: string
  duration: string
  students: number
}

export default function Courses() {
  const navigate = useNavigate()

  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteCode, setDeleteCode] = useState<string | null>(null)
  const [error, setError] = useState('')

  const loadCourses = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        'http://127.0.0.1:5000/api/courses',
        {
          cache: 'no-store',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load courses')
      }

      setCourses(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Courses load error:', error)
      setError('Courses load झाले नाहीत.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  const handleDelete = async () => {
    if (!deleteCode) return

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/courses/${encodeURIComponent(deleteCode)}`,
        {
          method: 'DELETE',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Delete failed')
      }

      setDeleteCode(null)

      await loadCourses()
    } catch (error) {
      console.error('Delete course error:', error)
      setDeleteCode(null)
      setError('Course delete झाला नाही.')
    }
  }

  return (
    <Layout title="Courses">

      {deleteCode && (
        <DeleteModal
          title="Delete Course"
          message="Are you sure you want to delete this course? All associated student records may be affected."
          onCancel={() => setDeleteCode(null)}
          onConfirm={handleDelete}
        />
      )}

      <div className="flex items-center justify-between mb-5">
        <p
          className="text-sm"
          style={{ color: 'var(--muted-foreground)' }}
        >
          {courses.length} courses available
        </p>

        <button
          onClick={() => navigate('/courses/add')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: 'var(--primary)' }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>

          Add Course
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div
          className="rounded-xl border shadow-sm p-8 text-center"
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border)',
            color: 'var(--muted-foreground)',
          }}
        >
          Loading courses...
        </div>
      ) : courses.length === 0 ? (
        <div
          className="rounded-xl border shadow-sm p-8 text-center"
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <p
            className="font-semibold mb-2"
            style={{ color: 'var(--foreground)' }}
          >
            No courses available
          </p>

          <p
            className="text-sm mb-4"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Add your first course to get started.
          </p>

          <button
            onClick={() => navigate('/courses/add')}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: 'var(--primary)' }}
          >
            Add Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {courses.map((course) => (
            <div
              key={course.id}
              className="rounded-xl border shadow-sm p-5"
              style={{
                background: 'var(--card)',
                borderColor: 'var(--border)',
              }}
            >

              <div className="flex items-start justify-between mb-3">

                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: 'var(--primary)' }}
                >
                  {course.code.slice(0, 2).toUpperCase()}
                </div>

                <span
                  className="text-xs font-mono px-2 py-0.5 rounded-full"
                  style={{
                    background: 'var(--secondary)',
                    color: 'var(--secondary-foreground)',
                  }}
                >
                  {course.code}
                </span>

              </div>

              <h3
                className="font-semibold mb-1"
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  color: 'var(--foreground)',
                }}
              >
                {course.name}
              </h3>

              <p
                className="text-xs mb-4"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Duration: {course.duration} · {course.students}{' '}
                student{course.students !== 1 ? 's' : ''}
              </p>

              <div className="flex gap-2 flex-wrap">

                <button
                  onClick={() =>
                    navigate(
                      `/students?course=${encodeURIComponent(course.name)}`
                    )
                  }
                  className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                  style={{ background: 'var(--primary)' }}
                >
                  View Students
                </button>

                <button
                  onClick={() =>
                    navigate(
                      `/courses/add?code=${encodeURIComponent(course.code)}`
                    )
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                  }}
                >
                  Edit
                </button>

                <button
                  onClick={() => setDeleteCode(course.code)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-500"
                >
                  Delete
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

    </Layout>
  )
}