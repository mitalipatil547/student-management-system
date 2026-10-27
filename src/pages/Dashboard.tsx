import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type Student = {
  id: number
  name: string
  email: string
  phone: string
  course: string
}

type DashboardData = {
  total_students: number
  total_courses: number
}

const enrollmentData = [
  { month: 'Jan', students: 120 },
  { month: 'Feb', students: 145 },
  { month: 'Mar', students: 132 },
  { month: 'Apr', students: 160 },
  { month: 'May', students: 175 },
  { month: 'Jun', students: 190 },
  { month: 'Jul', students: 210 },
  { month: 'Aug', students: 230 },
  { month: 'Sep', students: 245 },
]

const attendanceData = [
  { day: 'Mon', present: 85, absent: 15 },
  { day: 'Tue', present: 90, absent: 10 },
  { day: 'Wed', present: 78, absent: 22 },
  { day: 'Thu', present: 92, absent: 8 },
  { day: 'Fri', present: 70, absent: 30 },
]

export default function Dashboard() {
  const navigate = useNavigate()

  const [dashboard, setDashboard] = useState<DashboardData>({
    total_students: 0,
    total_courses: 0,
  })

  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  // Load dashboard data from backend
  const loadDashboard = async () => {
    try {
      const response = await fetch(
        'http://127.0.0.1:5000/api/dashboard'
      )

      const data = await response.json()

      if (response.ok) {
        setDashboard(data)
      } else {
        console.error(data)
      }
    } catch (error) {
      console.error('Dashboard backend error:', error)
    }
  }

  // Load recent students from backend
  const loadStudents = async () => {
    try {
      const response = await fetch(
        'http://127.0.0.1:5000/api/students'
      )

      const data = await response.json()

      if (response.ok) {
        setStudents(data)
      } else {
        console.error(data)
      }
    } catch (error) {
      console.error('Students backend error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
    loadStudents()
  }, [])

  const recentStudents = students.slice(0, 5)

  const statCards = [
    {
      label: 'Total Students',
      value: dashboard.total_students,
      change: 'From MySQL database',
      icon: '👥',
      color: '#1d4ed8',
      bg: '#eff6ff',
      path: '/students',
    },
    {
      label: 'Active Students',
      value: dashboard.total_students,
      change: 'Registered students',
      icon: '✅',
      color: '#059669',
      bg: '#ecfdf5',
      path: '/students',
    },
    {
      label: 'Total Courses',
      value: dashboard.total_courses,
      change: 'From MySQL database',
      icon: '📚',
      color: '#7c3aed',
      bg: '#f5f3ff',
      path: '/courses',
    },
    {
      label: "Today's Attendance",
      value: '87%',
      change: 'Attendance module',
      icon: '📋',
      color: '#d97706',
      bg: '#fffbeb',
      path: '/attendance',
    },
  ]

  return (
    <Layout title="Dashboard">

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        {statCards.map(card => (
          <button
            key={card.label}
            onClick={() => navigate(card.path)}
            className="rounded-xl p-5 border shadow-sm text-left hover:shadow-md transition-shadow"
            style={{
              background: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-start justify-between mb-3">

              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                style={{ background: card.bg }}
              >
                {card.icon}
              </div>

            </div>

            <p
              className="text-2xl font-bold"
              style={{
                fontFamily: 'Outfit, sans-serif',
                color: card.color,
              }}
            >
              {card.value}
            </p>

            <p
              className="text-sm font-medium mt-0.5"
              style={{ color: 'var(--foreground)' }}
            >
              {card.label}
            </p>

            <p
              className="text-xs mt-1"
              style={{ color: 'var(--muted-foreground)' }}
            >
              {card.change}
            </p>

          </button>
        ))}

      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

        {/* Enrollment */}
        <div
          className="rounded-xl border shadow-sm p-5"
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
            Student Enrollment Trend
          </h3>

          <ResponsiveContainer width="100%" height={180}>

            <AreaChart data={enrollmentData}>

              <defs>
                <linearGradient
                  id="colorStudents"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#1d4ed8"
                    stopOpacity={0.15}
                  />

                  <stop
                    offset="95%"
                    stopColor="#1d4ed8"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

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

              <Area
                type="monotone"
                dataKey="students"
                stroke="#1d4ed8"
                strokeWidth={2}
                fill="url(#colorStudents)"
              />

            </AreaChart>

          </ResponsiveContainer>

        </div>

        {/* Attendance */}
        <div
          className="rounded-xl border shadow-sm p-5"
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
            Weekly Attendance Overview
          </h3>

          <ResponsiveContainer width="100%" height={180}>

            <BarChart data={attendanceData}>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
              />

              <XAxis
                dataKey="day"
                tick={{
                  fontSize: 11,
                  fill: '#64748b',
                }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
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
              />

              <Bar
                dataKey="absent"
                fill="#fca5a5"
                radius={[4, 4, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* Recent Students */}
      <div
        className="rounded-xl border shadow-sm"
        style={{
          background: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >

        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >

          <h3
            className="font-semibold"
            style={{
              fontFamily: 'Outfit, sans-serif',
              color: 'var(--foreground)',
            }}
          >
            Recent Students
          </h3>

          <button
            onClick={() => navigate('/students')}
            className="text-sm font-medium"
            style={{ color: 'var(--primary)' }}
          >
            View all
          </button>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr
                style={{
                  borderBottom: '1px solid var(--border)',
                }}
              >

                {[
                  'Student ID',
                  'Name',
                  'Course',
                  'Email',
                  'Action',
                ].map(header => (

                  <th
                    key={header}
                    className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{
                      color: 'var(--muted-foreground)',
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
                      color: 'var(--muted-foreground)',
                    }}
                  >
                    Loading students...
                  </td>

                </tr>
              )}

              {!loading &&
                recentStudents.map(student => (

                  <tr
                    key={student.id}
                    className="border-b hover:bg-slate-50 cursor-pointer transition-colors"
                    style={{
                      borderColor: 'var(--border)',
                    }}
                    onClick={() =>
                      navigate(`/students/${student.id}`)
                    }
                  >

                    <td
                      className="px-5 py-3.5 text-sm font-mono"
                      style={{
                        color: 'var(--muted-foreground)',
                      }}
                    >
                      {student.id}
                    </td>

                    <td className="px-5 py-3.5">

                      <div className="flex items-center gap-2.5">

                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                          style={{
                            background: 'var(--primary)',
                          }}
                        >
                          {student.name.charAt(0)}
                        </div>

                        <span
                          className="text-sm font-medium"
                          style={{
                            color: 'var(--foreground)',
                          }}
                        >
                          {student.name}
                        </span>

                      </div>

                    </td>

                    <td
                      className="px-5 py-3.5 text-sm"
                      style={{
                        color: 'var(--foreground)',
                      }}
                    >
                      {student.course || '-'}
                    </td>

                    <td
                      className="px-5 py-3.5 text-sm"
                      style={{
                        color: 'var(--muted-foreground)',
                      }}
                    >
                      {student.email}
                    </td>

                    <td className="px-5 py-3.5">

                      <button
                        onClick={e => {
                          e.stopPropagation()
                          navigate(`/students/${student.id}`)
                        }}
                        className="text-sm font-medium"
                        style={{
                          color: 'var(--primary)',
                        }}
                      >
                        View
                      </button>

                    </td>

                  </tr>

                ))}

              {!loading && recentStudents.length === 0 && (

                <tr>

                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-sm"
                    style={{
                      color: 'var(--muted-foreground)',
                    }}
                  >
                    No students found.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </Layout>
  )
}