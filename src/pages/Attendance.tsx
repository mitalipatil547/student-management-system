import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

type Student = {
  id: number
  name: string
  email: string
  phone: string
  course: string
}

type AttendanceState = {
  [key: number]: boolean
}

const API_URL = 'http://127.0.0.1:5000'

export default function Attendance() {
  const navigate = useNavigate()

  const [course, setCourse] = useState('')
  const [year, setYear] = useState('2nd Year')
  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<AttendanceState>({})
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // =====================================================
  // LOAD STUDENTS
  // =====================================================

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      setLoading(true)

      const response = await fetch(`${API_URL}/api/students`)

      if (!response.ok) {
        throw new Error(`Student API error: ${response.status}`)
      }

      const data: Student[] = await response.json()

      setStudents(data)

      if (data.length > 0 && !course) {
        setCourse(data[0].course || '')
      }

      const initialAttendance: AttendanceState = {}

      data.forEach(student => {
        initialAttendance[student.id] = false
      })

      setAttendance(initialAttendance)

    } catch (error) {
      console.error('Student loading error:', error)

      alert(
        'Students load झाले नाहीत. Backend चालू आहे का ते check करा.'
      )
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // LOAD SAVED ATTENDANCE
  // =====================================================

  useEffect(() => {
    if (students.length > 0 && date) {
      loadAttendance()
    }
  }, [date, students])

  const loadAttendance = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/attendance?date=${date}`
      )

      if (!response.ok) {
        return
      }

      const records = await response.json()

      if (!Array.isArray(records)) {
        return
      }

      setAttendance(prev => {
        const next = { ...prev }

        records.forEach(record => {
          next[record.student_id] =
            record.status === 'Present'
        })

        return next
      })

    } catch (error) {
      console.error('Attendance loading error:', error)
    }
  }

  // =====================================================
  // FILTER
  // =====================================================

  const filtered = students.filter(student => {
    if (!course) {
      return true
    }

    return student.course === course
  })

  // =====================================================
  // COUNTS
  // =====================================================

  const presentCount = filtered.filter(
    student => attendance[student.id]
  ).length

  const totalCount = filtered.length

  const absentCount = totalCount - presentCount

  const attendanceRate =
    totalCount > 0
      ? Math.round((presentCount / totalCount) * 100)
      : 0

  // =====================================================
  // MARK ALL PRESENT
  // =====================================================

  const markAllPresent = () => {
    setAttendance(prev => {
      const next = { ...prev }

      filtered.forEach(student => {
        next[student.id] = true
      })

      return next
    })
  }

  // =====================================================
  // MARK ALL ABSENT
  // =====================================================

  const markAllAbsent = () => {
    setAttendance(prev => {
      const next = { ...prev }

      filtered.forEach(student => {
        next[student.id] = false
      })

      return next
    })
  }

  // =====================================================
  // SAVE ATTENDANCE
  // =====================================================

  const handleSave = async () => {
    if (filtered.length === 0) {
      alert('No students found.')
      return
    }

    try {
      setSaving(true)

      const records = filtered.map(student => ({
        student_id: student.id,
        status: attendance[student.id]
          ? 'Present'
          : 'Absent'
      }))

      const response = await fetch(
        `${API_URL}/api/attendance`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            date,
            course,
            year,
            attendance: records
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || `Server error: ${response.status}`
        )
      }

      setSaved(true)

      setTimeout(() => {
        setSaved(false)
      }, 2500)

    } catch (error) {
      console.error('Attendance save error:', error)

      const message =
        error instanceof Error
          ? error.message
          : 'Unknown error'

      alert(
        `Attendance save failed.\n\nReason: ${message}`
      )

    } finally {
      setSaving(false)
    }
  }

  // =====================================================
  // COURSES
  // =====================================================

  const courses = [
    ...new Set(
      students
        .map(student => student.course)
        .filter(Boolean)
    )
  ]

  // =====================================================
  // UI
  // =====================================================

  return (
    <Layout title="Attendance">

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

          Attendance saved successfully!
        </div>
      )}

      {/* FILTERS */}

      <div
        className="rounded-xl border shadow-sm p-5 mb-4 flex flex-wrap gap-3 items-end"
        style={{
          background: 'var(--card)',
          borderColor: 'var(--border)'
        }}
      >

        {/* COURSE */}

        <div className="flex flex-col gap-1.5">

          <label
            className="text-xs font-medium"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Course
          </label>

          <select
            value={course}
            onChange={e => setCourse(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border"
            style={{
              background: 'var(--background)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)'
            }}
          >
            <option value="">
              All Courses
            </option>

            {courses.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

        </div>

        {/* YEAR */}

        <div className="flex flex-col gap-1.5">

          <label
            className="text-xs font-medium"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Year
          </label>

          <select
            value={year}
            onChange={e => setYear(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border"
            style={{
              background: 'var(--background)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)'
            }}
          >
            <option>1st Year</option>
            <option>2nd Year</option>
            <option>3rd Year</option>
            <option>4th Year</option>
          </select>

        </div>

        {/* DATE */}

        <div className="flex flex-col gap-1.5">

          <label
            className="text-xs font-medium"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Date
          </label>

          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border"
            style={{
              background: 'var(--background)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)'
            }}
          />

        </div>

        {/* BUTTONS */}

        <div className="flex gap-2 ml-auto">

          <button
            onClick={markAllPresent}
            className="px-4 py-2 text-sm rounded-lg font-medium text-white bg-green-600 hover:bg-green-700"
          >
            Mark All Present
          </button>

          <button
            onClick={markAllAbsent}
            className="px-4 py-2 text-sm rounded-lg font-medium text-white bg-red-500 hover:bg-red-600"
          >
            Mark All Absent
          </button>

        </div>

      </div>

      {/* SUMMARY */}

      <div className="flex gap-4 mb-4">

        <div
          className="flex-1 rounded-xl border p-4 text-center"
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border)'
          }}
        >
          <p
            className="text-2xl font-bold"
            style={{ color: '#059669' }}
          >
            {presentCount}
          </p>

          <p
            className="text-xs"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Present
          </p>
        </div>

        <div
          className="flex-1 rounded-xl border p-4 text-center"
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border)'
          }}
        >
          <p
            className="text-2xl font-bold"
            style={{ color: '#ef4444' }}
          >
            {absentCount}
          </p>

          <p
            className="text-xs"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Absent
          </p>
        </div>

        <div
          className="flex-1 rounded-xl border p-4 text-center"
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border)'
          }}
        >
          <p
            className="text-2xl font-bold"
            style={{ color: 'var(--primary)' }}
          >
            {attendanceRate}%
          </p>

          <p
            className="text-xs"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Attendance Rate
          </p>
        </div>

      </div>

      {/* TABLE */}

      <div
        className="rounded-xl border shadow-sm"
        style={{
          background: 'var(--card)',
          borderColor: 'var(--border)'
        }}
      >

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border)',
                  background: 'var(--background)'
                }}
              >

                {[
                  'Student ID',
                  'Name',
                  'Course',
                  'Attendance %',
                  'Status'
                ].map(header => (
                  <th
                    key={header}
                    className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{
                      color: 'var(--muted-foreground)'
                    }}
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
                    colSpan={5}
                    className="px-5 py-10 text-center text-sm"
                    style={{
                      color: 'var(--muted-foreground)'
                    }}
                  >
                    Loading students...
                  </td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-sm"
                    style={{
                      color: 'var(--muted-foreground)'
                    }}
                  >
                    No students found.
                  </td>
                </tr>
              )}

              {!loading &&
                filtered.map(student => (
                  <tr
                    key={student.id}
                    className="border-b hover:bg-slate-50 transition-colors"
                    style={{
                      borderColor: 'var(--border)'
                    }}
                  >

                    <td
                      className="px-5 py-3.5 text-xs font-mono"
                      style={{
                        color: 'var(--muted-foreground)'
                      }}
                    >
                      {student.id}
                    </td>

                    <td className="px-5 py-3.5">

                      <button
                        onClick={() =>
                          navigate(
                            `/students/${student.id}/attendance`
                          )
                        }
                        className="flex items-center gap-2.5 text-left"
                      >

                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                          style={{
                            background: 'var(--primary)'
                          }}
                        >
                          {student.name.charAt(0)}
                        </div>

                        <span
                          className="text-sm font-medium"
                          style={{
                            color: 'var(--primary)'
                          }}
                        >
                          {student.name}
                        </span>

                      </button>

                    </td>

                    <td
                      className="px-5 py-3.5 text-sm"
                      style={{
                        color: 'var(--foreground)'
                      }}
                    >
                      {student.course}
                    </td>

                    <td
                      className="px-5 py-3.5 text-sm font-medium"
                      style={{
                        color: attendance[student.id]
                          ? '#059669'
                          : '#ef4444'
                      }}
                    >
                      {attendance[student.id]
                        ? '100%'
                        : '0%'}
                    </td>

                    <td className="px-5 py-3.5">

                      <div className="flex items-center gap-3">

                        <button
                          onClick={() =>
                            setAttendance(prev => ({
                              ...prev,
                              [student.id]: true
                            }))
                          }
                          className="px-3 py-1 rounded-lg text-xs font-medium"
                          style={
                            attendance[student.id]
                              ? {
                                  background: '#059669',
                                  color: 'white'
                                }
                              : {
                                  border: '1px solid #059669',
                                  color: '#059669'
                                }
                          }
                        >
                          Present
                        </button>

                        <button
                          onClick={() =>
                            setAttendance(prev => ({
                              ...prev,
                              [student.id]: false
                            }))
                          }
                          className="px-3 py-1 rounded-lg text-xs font-medium"
                          style={
                            !attendance[student.id]
                              ? {
                                  background: '#ef4444',
                                  color: 'white'
                                }
                              : {
                                  border: '1px solid #ef4444',
                                  color: '#ef4444'
                                }
                          }
                        >
                          Absent
                        </button>

                      </div>

                    </td>

                  </tr>
                ))}

            </tbody>

          </table>

        </div>

        {/* BOTTOM BUTTONS */}

        <div
          className="flex gap-3 px-5 py-4 border-t"
          style={{
            borderColor: 'var(--border)'
          }}
        >

          <button
            onClick={handleSave}
            disabled={loading || saving || filtered.length === 0}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
            style={{
              background: 'var(--primary)'
            }}
          >
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>

          <button
            onClick={() => navigate('/attendance/report')}
            className="px-5 py-2.5 rounded-lg text-sm font-medium border"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--foreground)'
            }}
          >
            View Report
          </button>

        </div>

      </div>

    </Layout>
  )
}