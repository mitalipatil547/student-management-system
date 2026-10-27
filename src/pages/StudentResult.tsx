import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'

interface Student {
  id: number
  name: string
  email?: string
  phone?: string
  course?: string
}

interface Mark {
  id: number
  student_id: number
  subject_name: string
  max_marks: number
  obtained_marks: number
  grade?: string
  result?: string
}

function grade(pct: number) {
  if (pct >= 90) return { g: 'O', color: '#7c3aed' }
  if (pct >= 80) return { g: 'A+', color: '#059669' }
  if (pct >= 70) return { g: 'A', color: '#059669' }
  if (pct >= 60) return { g: 'B+', color: '#1d4ed8' }
  if (pct >= 50) return { g: 'B', color: '#d97706' }

  return { g: 'F', color: '#ef4444' }
}

export default function StudentResult() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [student, setStudent] = useState<Student | null>(null)
  const [marks, setMarks] = useState<Mark[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadStudentResult = async () => {
      try {
        setLoading(true)
        setError('')

        if (!id) {
          throw new Error('Student ID not found')
        }

        // Get selected student from database
        const studentResponse = await fetch(
          `http://127.0.0.1:5000/api/students/${id}`
        )

        if (!studentResponse.ok) {
          throw new Error('Student not found')
        }

        const studentData = await studentResponse.json()

        setStudent(studentData)

        // Get marks of the selected student
        const marksResponse = await fetch(
          `http://127.0.0.1:5000/api/students/${id}/marks`
        )

        if (marksResponse.ok) {
          const marksData = await marksResponse.json()

          setMarks(
            Array.isArray(marksData)
              ? marksData
              : marksData.marks || []
          )
        } else {
          setMarks([])
        }
      } catch (err) {
        console.error('Error loading student result:', err)

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load student result'
        )
      } finally {
        setLoading(false)
      }
    }

    loadStudentResult()
  }, [id])

  if (loading) {
    return (
      <Layout title="Student Result">
        <div className="px-5 py-12 text-center">
          <p
            className="text-sm"
            style={{
              color: 'var(--muted-foreground)'
            }}
          >
            Loading student result...
          </p>
        </div>
      </Layout>
    )
  }

  if (error || !student) {
    return (
      <Layout title="Student Result">
        <div className="max-w-3xl">
          <div
            className="rounded-xl border p-8 text-center"
            style={{
              background: 'var(--card)',
              borderColor: 'var(--border)'
            }}
          >
            <p
              className="text-lg font-semibold"
              style={{
                color: 'var(--foreground)'
              }}
            >
              Student not found
            </p>

            <p
              className="text-sm mt-2"
              style={{
                color: 'var(--muted-foreground)'
              }}
            >
              Please go back to Marks and select the student again.
            </p>

            <button
              onClick={() => navigate('/marks')}
              className="mt-5 px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{
                background: 'var(--primary)'
              }}
            >
              Back to Marks
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  // If there are no marks in database, show empty table
  const totalObtained = marks.reduce(
    (total, mark) =>
      total + Number(mark.obtained_marks || 0),
    0
  )

  const totalMax = marks.reduce(
    (total, mark) =>
      total + Number(mark.max_marks || 0),
    0
  )

  const pct =
    totalMax > 0
      ? Math.round((totalObtained / totalMax) * 100)
      : 0

  const { g } = grade(pct)

  return (
    <Layout title="Student Result">

      <div className="max-w-3xl">

        {/* Back Button */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/marks')}
            className="flex items-center gap-1.5 text-sm"
            style={{
              color: 'var(--muted-foreground)'
            }}
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

            Back to Marks
          </button>
        </div>

        <div
          className="rounded-xl border shadow-sm"
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border)'
          }}
        >

          {/* College Header */}
          <div
            className="px-8 py-6 text-center border-b"
            style={{
              borderColor: 'var(--border)',
              background: '#0f172a'
            }}
          >

            <p
              className="text-white font-bold text-xl"
              style={{
                fontFamily: 'Outfit, sans-serif'
              }}
            >
              Dadasaheb Digambar Shankar Patil College, Erandol
            </p>

            <p className="text-slate-400 text-sm mt-1">
              Erandol, Maharashtra
            </p>

            <div
              className="mt-3 inline-flex px-4 py-1.5 rounded-full text-sm font-semibold"
              style={{
                background: 'var(--primary)',
                color: 'white'
              }}
            >
              Semester Result Sheet
            </div>

          </div>


          {/* Student Information */}
          <div
            className="px-8 py-5 grid grid-cols-2 gap-y-2 border-b"
            style={{
              borderColor: 'var(--border)'
            }}
          >

            <Row
              label="Student Name"
              value={student.name}
            />

            <Row
              label="Student ID"
              value={String(student.id)}
            />

            <Row
              label="Course"
              value={student.course || '-'}
            />

            <Row
              label="Semester"
              value="Semester 3"
            />

            <Row
              label="Year"
              value="-"
            />

            <Row
              label="Academic Year"
              value="2024-25"
            />

          </div>


          {/* Marks Table */}
          <div className="overflow-x-auto">

            {marks.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p
                  className="text-sm"
                  style={{
                    color: 'var(--muted-foreground)'
                  }}
                >
                  No marks found for this student.
                </p>
              </div>
            ) : (

              <table className="w-full">

                <thead>

                  <tr
                    style={{
                      borderBottom:
                        '1px solid var(--border)',
                      background:
                        'var(--background)'
                    }}
                  >

                    {[
                      'Subject',
                      'Marks',
                      'Max Marks',
                      'Grade',
                      'Status'
                    ].map(h => (

                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                        style={{
                          color:
                            'var(--muted-foreground)'
                        }}
                      >
                        {h}
                      </th>

                    ))}

                  </tr>

                </thead>


                <tbody>

                  {marks.map(mark => {

                    const obtained =
                      Number(mark.obtained_marks || 0)

                    const max =
                      Number(mark.max_marks || 0)

                    const percentage =
                      max > 0
                        ? (obtained / max) * 100
                        : 0

                    const {
                      g: sg,
                      color
                    } = grade(percentage)

                    const isPass =
                      mark.result
                        ? mark.result.toLowerCase() ===
                          'pass'
                        : percentage >= 40

                    return (

                      <tr
                        key={mark.id}
                        className="border-b"
                        style={{
                          borderColor:
                            'var(--border)'
                        }}
                      >

                        <td
                          className="px-5 py-3.5 text-sm font-medium"
                          style={{
                            color:
                              'var(--foreground)'
                          }}
                        >
                          {mark.subject_name}
                        </td>


                        <td
                          className="px-5 py-3.5 text-sm font-semibold"
                          style={{
                            color:
                              'var(--foreground)'
                          }}
                        >
                          {obtained}
                        </td>


                        <td
                          className="px-5 py-3.5 text-sm"
                          style={{
                            color:
                              'var(--foreground)'
                          }}
                        >
                          {max}
                        </td>


                        <td className="px-5 py-3.5">

                          <span
                            className="text-sm font-bold"
                            style={{
                              color
                            }}
                          >
                            {sg}
                          </span>

                        </td>


                        <td className="px-5 py-3.5">

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

                      </tr>

                    )
                  })}

                </tbody>

              </table>

            )}

          </div>


          {/* Result Summary */}
          <div
            className="px-8 py-5 flex items-center justify-between border-t"
            style={{
              borderColor: 'var(--border)'
            }}
          >

            <div className="flex gap-8">

              {/* Total */}
              <div>

                <p
                  className="text-xs"
                  style={{
                    color:
                      'var(--muted-foreground)'
                  }}
                >
                  Total Marks
                </p>

                <p
                  className="text-xl font-bold"
                  style={{
                    fontFamily:
                      'Outfit, sans-serif',
                    color:
                      'var(--foreground)'
                  }}
                >
                  {totalObtained}/{totalMax}
                </p>

              </div>


              {/* Percentage */}
              <div>

                <p
                  className="text-xs"
                  style={{
                    color:
                      'var(--muted-foreground)'
                  }}
                >
                  Percentage
                </p>

                <p
                  className="text-xl font-bold"
                  style={{
                    fontFamily:
                      'Outfit, sans-serif',
                    color:
                      'var(--primary)'
                  }}
                >
                  {pct}%
                </p>

              </div>


              {/* Grade */}
              <div>

                <p
                  className="text-xs"
                  style={{
                    color:
                      'var(--muted-foreground)'
                  }}
                >
                  Overall Grade
                </p>

                <p
                  className="text-xl font-bold"
                  style={{
                    fontFamily:
                      'Outfit, sans-serif',
                    color: '#059669'
                  }}
                >
                  {g}
                </p>

              </div>


              {/* Result */}
              <div>

                <p
                  className="text-xs"
                  style={{
                    color:
                      'var(--muted-foreground)'
                  }}
                >
                  Result
                </p>

                <p className="text-xl font-bold text-green-600">
                  {totalMax > 0 && pct >= 40
                    ? 'PASS'
                    : 'FAIL'}
                </p>

              </div>

            </div>


            {/* Buttons */}
            <div className="flex gap-2">

              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-sm rounded-lg font-medium border"
                style={{
                  borderColor:
                    'var(--border)',
                  color:
                    'var(--foreground)'
                }}
              >
                Print
              </button>


              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-sm rounded-lg font-medium text-white"
                style={{
                  background:
                    'var(--primary)'
                }}
              >
                Download
              </button>

            </div>

          </div>

        </div>

      </div>

    </Layout>
  )
}


function Row({
  label,
  value
}: {
  label: string
  value: string
}) {

  return (

    <div className="flex gap-2">

      <span
        className="text-sm font-medium w-36 flex-shrink-0"
        style={{
          color:
            'var(--muted-foreground)'
        }}
      >
        {label}:
      </span>

      <span
        className="text-sm"
        style={{
          color:
            'var(--foreground)'
        }}
      >
        {value}
      </span>

    </div>

  )
}