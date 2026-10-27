import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const API_URL = 'http://127.0.0.1:5000'

type Student = {
  id: number
  name: string
  email: string
  phone: string
  course: string
}

type AttendanceRecord = {
  id: number
  student_id: number
  attendance_date: string
  course: string
  year: string
  status: 'Present' | 'Absent'
}

export default function AttendanceReport() {
  const navigate = useNavigate()

  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  useEffect(() => {
    loadReport()
  }, [selectedDate])

  const loadReport = async () => {
    try {
      setLoading(true)
      setError('')

      const [studentsRes, attendanceRes] = await Promise.all([
        fetch(`${API_URL}/api/students`),
        fetch(`${API_URL}/api/attendance?date=${selectedDate}`),
      ])

      if (!studentsRes.ok) {
        throw new Error('Students data load failed')
      }

      if (!attendanceRes.ok) {
        throw new Error('Attendance data load failed')
      }

      const studentsData = await studentsRes.json()
      const attendanceData = await attendanceRes.json()

      setStudents(studentsData)
      setAttendance(attendanceData)
    } catch (err: any) {
      setError(err.message || 'Failed to load attendance report')
    } finally {
      setLoading(false)
    }
  }

  const getStudentAttendance = (studentId: number) => {
    return attendance.filter(record => record.student_id === studentId)
  }

  const total = students.length

  const present = students.filter(student =>
    getStudentAttendance(student.id).some(
      record => record.status === 'Present'
    )
  ).length

  const absent = students.filter(student =>
    getStudentAttendance(student.id).some(
      record => record.status === 'Absent'
    )
  ).length

  const notMarked = total - present - absent

  const attendanceRate =
    total > 0 ? Math.round((present / total) * 100) : 0

  const monthData = [
    {
      month: 'Selected Day',
      present: attendanceRate,
      absent: total > 0 ? 100 - attendanceRate : 0,
    },
  ]

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    const rows = students
      .map(student => {
        const records = getStudentAttendance(student.id)
        const presentDays = records.filter(
          record => record.status === 'Present'
        ).length
        const absentDays = records.filter(
          record => record.status === 'Absent'
        ).length

        return `
          <tr>
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.course}</td>
            <td>${presentDays}</td>
            <td>${absentDays}</td>
            <td>${records.length > 0 ? Math.round((presentDays / records.length) * 100) : 0}%</td>
          </tr>
        `
      })
      .join('')

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Attendance Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 30px;
          }

          h1 {
            margin-bottom: 5px;
          }

          p {
            color: #555;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 25px;
          }

          th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
          }

          th {
            background: #f5f5f5;
          }
        </style>
      </head>

      <body>
        <h1>Student Attendance Report</h1>
        <p>Date: ${selectedDate}</p>

        <table>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Course</th>
              <th>Present Days</th>
              <th>Absent Days</th>
              <th>Attendance %</th>
            </tr>
          </thead>

          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
      </html>
    `

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `Attendance_Report_${selectedDate}.html`
    a.click()

    URL.revokeObjectURL(url)
  }

  return (
    <Layout title="Attendance Report">
      <div className="max-w-5xl">

        {/* Back */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/attendance')}
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
            Back to Attendance
          </button>
        </div>

        {/* Date Filter */}
        <div
          className="rounded-xl border p-4 mb-6 flex items-center justify-between"
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <div>
            <p
              className="font-semibold"
              style={{
                fontFamily: 'Outfit, sans-serif',
                color: 'var(--foreground)',
              }}
            >
              Attendance Date
            </p>

            <p
              className="text-xs mt-1"
              style={{ color: 'var(--muted-foreground)' }}
            >
              View attendance for a selected date
            </p>
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm outline-none"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--background)',
              color: 'var(--foreground)',
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-6 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">

          {[
            {
              label: 'Total Students',
              value: total,
              color: '#1d4ed8',
            },
            {
              label: 'Present Today',
              value: present,
              color: '#059669',
            },
            {
              label: 'Absent Today',
              value: absent,
              color: '#ef4444',
            },
            {
              label: 'Attendance Rate',
              value: `${attendanceRate}%`,
              color: '#7c3aed',
            },
          ].map(s => (
            <div
              key={s.label}
              className="rounded-xl border p-5 shadow-sm"
              style={{
                background: 'var(--card)',
                borderColor: 'var(--border)',
              }}
            >
              <p
                className="text-2xl font-bold"
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  color: s.color,
                }}
              >
                {s.value}
              </p>

              <p
                className="text-xs mt-1"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Not Marked */}
        {notMarked > 0 && (
          <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
            {notMarked} student{notMarked > 1 ? 's are' : ' is'} not marked
            for this date.
          </div>
        )}

        {/* Chart */}
        <div
          className="rounded-xl border shadow-sm p-5 mb-4"
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <h3
            className="font-semibold mb-4"
            style={{
              fontFamily: 'Outfit, sans-serif',
              color: 'var(--foreground)',
            }}
          >
            Attendance Overview
          </h3>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
              />

              <XAxis
                dataKey="month"
                tick={{
                  fontSize: 11,
                  fill: '#64748b',
                }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                domain={[0, 100]}
                tick={{
                  fontSize: 11,
                  fill: '#64748b',
                }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: 12,
                }}
              />

              <Bar
                dataKey="present"
                fill="#1d4ed8"
                radius={[4, 4, 0, 0]}
                name="Present %"
              />

              <Bar
                dataKey="absent"
                fill="#fca5a5"
                radius={[4, 4, 0, 0]}
                name="Absent %"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Table */}
        <div
          className="rounded-xl border shadow-sm"
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <div
            className="px-5 py-4 border-b flex items-center justify-between"
            style={{ borderColor: 'var(--border)' }}
          >
            <h3
              className="font-semibold"
              style={{
                fontFamily: 'Outfit, sans-serif',
                color: 'var(--foreground)',
              }}
            >
              Student Attendance Summary
            </h3>

            <div className="flex gap-2">

              <button
                onClick={handleDownload}
                className="px-4 py-2 text-sm rounded-lg font-medium border"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                }}
              >
                Download Report
              </button>

              <button
                onClick={handlePrint}
                className="px-4 py-2 text-sm rounded-lg font-medium border"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                }}
              >
                Print Report
              </button>

            </div>
          </div>

          <div className="overflow-x-auto">

            {loading ? (
              <div className="p-8 text-center text-sm">
                Loading attendance report...
              </div>
            ) : (
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
                      'Course',
                      'Present Days',
                      'Absent Days',
                      'Attendance %',
                    ].map(h => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                        style={{
                          color: 'var(--muted-foreground)',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>

                  {students.map(student => {

                    const records = getStudentAttendance(student.id)

                    const presentDays = records.filter(
                      record => record.status === 'Present'
                    ).length

                    const absentDays = records.filter(
                      record => record.status === 'Absent'
                    ).length

                    const totalMarked =
                      presentDays + absentDays

                    const percentage =
                      totalMarked > 0
                        ? Math.round(
                            (presentDays / totalMarked) * 100
                          )
                        : 0

                    return (
                      <tr
                        key={student.id}
                        className="border-b hover:bg-slate-50 transition-colors"
                        style={{
                          borderColor: 'var(--border)',
                        }}
                      >
                        <td
                          className="px-5 py-3.5 text-xs font-mono"
                          style={{
                            color: 'var(--muted-foreground)',
                          }}
                        >
                          {student.id}
                        </td>

                        <td
                          className="px-5 py-3.5 text-sm font-medium"
                          style={{
                            color: 'var(--foreground)',
                          }}
                        >
                          {student.name}
                        </td>

                        <td
                          className="px-5 py-3.5 text-sm"
                          style={{
                            color: 'var(--foreground)',
                          }}
                        >
                          {student.course}
                        </td>

                        <td
                          className="px-5 py-3.5 text-sm"
                          style={{ color: '#059669' }}
                        >
                          {presentDays}
                        </td>

                        <td
                          className="px-5 py-3.5 text-sm"
                          style={{ color: '#ef4444' }}
                        >
                          {absentDays}
                        </td>

                        <td className="px-5 py-3.5">

                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              percentage >= 75
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-600'
                            }`}
                          >
                            {percentage}%
                          </span>

                        </td>
                      </tr>
                    )
                  })}

                </tbody>
              </table>
            )}

          </div>
        </div>

      </div>
    </Layout>
  )
}