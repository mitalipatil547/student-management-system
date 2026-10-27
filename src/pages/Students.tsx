import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import DeleteModal from '../components/DeleteModal'

type Student = {
  id: number
  name: string
  email: string
  phone: string
  course: string
}

export default function Students() {
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [studentList, setStudentList] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  // Get students from backend
  const loadStudents = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/students')
      const data = await response.json()

      if (response.ok) {
        setStudentList(data)
      } else {
        console.error(data)
      }
    } catch (error) {
      console.error('Backend connection error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStudents()
  }, [])

  // Delete student
  const handleDelete = async () => {
    if (deleteId === null) return

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/students/${deleteId}`,
        {
          method: 'DELETE',
        }
      )

      if (response.ok) {
        setStudentList(prev =>
          prev.filter(student => student.id !== deleteId)
        )
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete student')
      }
    } catch (error) {
      alert('Backend connection error')
    }

    setDeleteId(null)
  }

  const courses = [...new Set(studentList.map(student => student.course).filter(Boolean))]

  const filtered = studentList.filter(student => {
    const searchText = search.toLowerCase()

    const matchSearch =
      student.name.toLowerCase().includes(searchText) ||
      student.email.toLowerCase().includes(searchText) ||
      String(student.id).includes(searchText)

    const matchCourse =
      !courseFilter || student.course === courseFilter

    return matchSearch && matchCourse
  })

  return (
    <Layout title="Students">

      {deleteId !== null && (
        <DeleteModal
          onCancel={() => setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      <div
        className="rounded-xl border shadow-sm"
        style={{
          background: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >

        {/* Header */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2
            className="font-semibold text-lg"
            style={{
              fontFamily: 'Outfit, sans-serif',
              color: 'var(--foreground)',
            }}
          >
            All Students
          </h2>

          <button
            onClick={() => navigate('/students/add')}
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
            Add New Student
          </button>
        </div>

        {/* Filters */}
        <div
          className="flex flex-wrap gap-3 px-5 py-3 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="relative flex-1 min-w-48">
            <svg
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--muted-foreground)' }}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>

            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search students…"
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border focus:outline-none"
              style={{
                background: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
            />
          </div>

          <select
            value={courseFilter}
            onChange={e => setCourseFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border focus:outline-none"
            style={{
              background: 'var(--background)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
          >
            <option value="">All Courses</option>

            {courses.map(course => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">

            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border)',
                  background: 'var(--background)',
                }}
              >
                {[
                  'Student ID',
                  'Name',
                  'Email',
                  'Phone',
                  'Course',
                  'Actions',
                ].map(header => (
                  <th
                    key={header}
                    className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>

              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    Loading students...
                  </td>
                </tr>
              )}

              {!loading &&
                filtered.map(student => (
                  <tr
                    key={student.id}
                    className="border-b hover:bg-slate-50 transition-colors"
                    style={{ borderColor: 'var(--border)' }}
                  >

                    <td
                      className="px-5 py-3.5 text-xs font-mono"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {student.id}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">

                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                          style={{ background: 'var(--primary)' }}
                        >
                          {student.name.charAt(0)}
                        </div>

                        <span
                          className="text-sm font-medium"
                          style={{ color: 'var(--foreground)' }}
                        >
                          {student.name}
                        </span>

                      </div>
                    </td>

                    <td
                      className="px-5 py-3.5 text-sm"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {student.email}
                    </td>

                    <td
                      className="px-5 py-3.5 text-sm font-mono"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {student.phone || '-'}
                    </td>

                    <td
                      className="px-5 py-3.5 text-sm"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {student.course || '-'}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">

                        <button
                          onClick={() =>
                            navigate(`/students/${student.id}`)
                          }
                          className="text-xs font-medium"
                          style={{ color: 'var(--primary)' }}
                        >
                          View
                        </button>

                        <button
                          onClick={() =>
                            navigate(`/students/${student.id}/edit`)
                          }
                          className="text-xs font-medium"
                          style={{ color: '#7c3aed' }}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => setDeleteId(student.id)}
                          className="text-xs font-medium text-red-500"
                        >
                          Delete
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    No students found.
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 flex items-center justify-between border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <p
            className="text-xs"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Showing {filtered.length} of {studentList.length} students
          </p>
        </div>

      </div>
    </Layout>
  )
}