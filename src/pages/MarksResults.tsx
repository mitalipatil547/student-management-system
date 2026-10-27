import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

interface Mark {
  id: number
  student_id: number
  student_name?: string
  name?: string
  studentId?: string
  course?: string
  semester?: string
  subject_name: string
  max_marks: number
  obtained_marks: number
  grade?: string
  result?: string
}

interface Student {
  id: number
  name: string
  course?: string
}

function grade(total: number, max: number) {
  if (max <= 0) return 'F'

  const percentage = (total / max) * 100

  if (percentage >= 90) return 'O'
  if (percentage >= 80) return 'A+'
  if (percentage >= 70) return 'A'
  if (percentage >= 60) return 'B+'
  if (percentage >= 50) return 'B'

  return 'F'
}

export default function MarksResults() {
  const navigate = useNavigate()

  const [marks, setMarks] = useState<Mark[]>([])
  const [students, setStudents] = useState<Student[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [course, setCourse] = useState('')
  const [sem, setSem] = useState('Semester 3')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError('')

        const [marksResponse, studentsResponse] =
          await Promise.all([
            fetch('http://127.0.0.1:5000/api/marks'),
            fetch('http://127.0.0.1:5000/api/students'),
          ])

        if (!marksResponse.ok) {
          const data = await marksResponse.json().catch(() => ({}))

          throw new Error(
            data.error ||
              data.message ||
              'Failed to load marks'
          )
        }

        if (!studentsResponse.ok) {
          const data = await studentsResponse.json().catch(() => ({}))

          throw new Error(
            data.error ||
              data.message ||
              'Failed to load students'
          )
        }

        const marksData = await marksResponse.json()
        const studentsData = await studentsResponse.json()

        setMarks(
          Array.isArray(marksData)
            ? marksData
            : marksData.marks || []
        )

        setStudents(
          Array.isArray(studentsData)
            ? studentsData
            : studentsData.students || []
        )
      } catch (err) {
        console.error('Error loading marks:', err)

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load marks'
        )
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const getStudent = (studentId: number) => {
    return students.find(
      student => Number(student.id) === Number(studentId)
    )
  }

  const filteredMarks = marks.filter(mark => {
    const student = getStudent(mark.student_id)

    const studentName =
      mark.student_name ||
      mark.name ||
      student?.name ||
      ''

    const studentCourse =
      mark.course ||
      student?.course ||
      ''

    const studentId =
      mark.studentId ||
      String(mark.student_id)

    const matchesSearch =
      studentName
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      studentId
        .toLowerCase()
        .includes(search.toLowerCase())

    const matchesCourse =
      !course || studentCourse === course

    const matchesSemester =
      !mark.semester ||
      mark.semester === sem

    return (
      matchesSearch &&
      matchesCourse &&
      matchesSemester
    )
  })

  const getStudentName = (mark: Mark) => {
    const student = getStudent(mark.student_id)

    return (
      mark.student_name ||
      mark.name ||
      student?.name ||
      `Student ${mark.student_id}`
    )
  }

  const getStudentCourse = (mark: Mark) => {
    const student = getStudent(mark.student_id)

    return mark.course || student?.course || ''
  }

  const getStudentDisplayId = (mark: Mark) => {
    const student = getStudent(mark.student_id)

    return (
      mark.studentId ||
      student?.id?.toString() ||
      mark.student_id.toString()
    )
  }

  return (
    <Layout title="Marks & Results">
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
          style={{
            borderColor: 'var(--border)',
          }}
        >
          <h2
            className="font-semibold text-lg"
            style={{
              fontFamily: 'Outfit, sans-serif',
              color: 'var(--foreground)',
            }}
          >
            Marks & Results
          </h2>

          <button
            onClick={() => navigate('/marks/add')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{
              background: 'var(--primary)',
            }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <line
                x1="12"
                y1="5"
                x2="12"
                y2="19"
              />

              <line
                x1="5"
                y1="12"
                x2="19"
                y2="12"
              />
            </svg>

            Add Marks
          </button>
        </div>

        {/* Filters */}

        <div
          className="flex flex-wrap gap-3 px-5 py-3 border-b"
          style={{
            borderColor: 'var(--border)',
          }}
        >
          {/* Search */}

          <div className="relative flex-1 min-w-48">
            <svg
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
              style={{
                color: 'var(--muted-foreground)',
              }}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle
                cx="11"
                cy="11"
                r="8"
              />

              <line
                x1="21"
                y1="21"
                x2="16.65"
                y2="16.65"
              />
            </svg>

            <input
              value={search}
              onChange={e =>
                setSearch(e.target.value)
              }
              placeholder="Search students..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border focus:outline-none"
              style={{
                background: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
            />
          </div>

          {/* Course */}

          <select
            value={course}
            onChange={e =>
              setCourse(e.target.value)
            }
            className="px-3 py-2 text-sm rounded-lg border"
            style={{
              background: 'var(--background)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
          >
            <option value="">
              All Courses
            </option>

            {[
              'B.Tech CSE',
              'B.Tech ECE',
              'B.Sc Mathematics',
              'B.Sc Physics',
              'MBA Finance',
              'MBA Marketing',
              'B.Com Accounting',
            ].map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Semester */}

          <select
            value={sem}
            onChange={e =>
              setSem(e.target.value)
            }
            className="px-3 py-2 text-sm rounded-lg border"
            style={{
              background: 'var(--background)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
          >
            {[
              'Semester 1',
              'Semester 2',
              'Semester 3',
              'Semester 4',
              'Semester 5',
              'Semester 6',
            ].map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Loading */}

        {loading && (
          <div className="px-5 py-12 text-center">
            <p
              className="text-sm"
              style={{
                color: 'var(--muted-foreground)',
              }}
            >
              Loading marks...
            </p>
          </div>
        )}

        {/* Error */}

        {!loading && error && (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* No marks */}

        {!loading &&
          !error &&
          filteredMarks.length === 0 && (
            <div className="px-5 py-12 text-center">
              <p
                className="text-sm"
                style={{
                  color: 'var(--muted-foreground)',
                }}
              >
                No marks found.
              </p>
            </div>
          )}

        {/* Table */}

        {!loading &&
          !error &&
          filteredMarks.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    style={{
                      borderBottom:
                        '1px solid var(--border)',
                      background:
                        'var(--background)',
                    }}
                  >
                    {[
                      'Student ID',
                      'Name',
                      'Subject',
                      'Marks',
                      'Max Marks',
                      'Grade',
                      'Result',
                      'Actions',
                    ].map(h => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                        style={{
                          color:
                            'var(--muted-foreground)',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredMarks.map(mark => {
                    const obtained = Number(
                      mark.obtained_marks || 0
                    )

                    const max = Number(
                      mark.max_marks || 0
                    )

                    const g =
                      mark.grade ||
                      grade(obtained, max)

                    const percentage =
                      max > 0
                        ? (obtained / max) * 100
                        : 0

                    const isPass =
                      mark.result
                        ? mark.result.toLowerCase() ===
                          'pass'
                        : percentage >= 40

                    return (
                      <tr
                        key={mark.id}
                        className="border-b hover:bg-slate-50 transition-colors"
                        style={{
                          borderColor:
                            'var(--border)',
                        }}
                      >
                        {/* Student ID */}

                        <td
                          className="px-4 py-3.5 text-xs font-mono"
                          style={{
                            color:
                              'var(--muted-foreground)',
                          }}
                        >
                          {getStudentDisplayId(mark)}
                        </td>

                        {/* Name */}

                        <td
                          className="px-4 py-3.5 text-sm font-medium"
                          style={{
                            color:
                              'var(--foreground)',
                          }}
                        >
                          {getStudentName(mark)}
                        </td>

                        {/* Subject */}

                        <td
                          className="px-4 py-3.5 text-sm"
                          style={{
                            color:
                              'var(--foreground)',
                          }}
                        >
                          {mark.subject_name}
                        </td>

                        {/* Obtained */}

                        <td
                          className="px-4 py-3.5 text-sm font-semibold"
                          style={{
                            color:
                              'var(--foreground)',
                          }}
                        >
                          {obtained}
                        </td>

                        {/* Max */}

                        <td
                          className="px-4 py-3.5 text-sm"
                          style={{
                            color:
                              'var(--foreground)',
                          }}
                        >
                          {max}
                        </td>

                        {/* Grade */}

                        <td className="px-4 py-3.5">
                          <span
                            className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold"
                            style={{
                              background:
                                '#eff6ff',
                              color:
                                'var(--primary)',
                            }}
                          >
                            {g}
                          </span>
                        </td>

                        {/* Result */}

                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              isPass
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-600'
                            }`}
                          >
                            {isPass
                              ? 'Pass'
                              : 'Fail'}
                          </span>
                        </td>

                        {/* Actions */}

                        <td className="px-4 py-3.5">
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                navigate(
                                  `/students/${mark.student_id}/result`
                                )
                              }
                              className="text-xs font-medium"
                              style={{
                                color:
                                  'var(--primary)',
                              }}
                            >
                              View
                            </button>

                            <button
                              className="text-xs font-medium"
                              style={{
                                color: '#7c3aed',
                              }}
                              onClick={() =>
                                alert(
                                  'Edit functionality will be added next.'
                                )
                              }
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </Layout>
  )
}