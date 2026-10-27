import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { students } from '../data/students'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const monthlyData = [
  { month: 'Apr', attendance: 90 },
  { month: 'May', attendance: 85 },
  { month: 'Jun', attendance: 78 },
  { month: 'Jul', attendance: 92 },
  { month: 'Aug', attendance: 88 },
  { month: 'Sep', attendance: 95 },
]

export default function StudentAttendance() {
  const { id } = useParams()
  const navigate = useNavigate()
  const s = students.find(st => st.id === id) || students[0]
  const presentDays = Math.round(180 * s.attendance / 100)
  const absentDays = 180 - presentDays

  return (
    <Layout title="Student Attendance">
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(`/students/${s.id}`)} className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            Back to Student Details
          </button>
        </div>

        {/* Profile summary */}
        <div className="rounded-xl border shadow-sm p-5 mb-4 flex items-center gap-4" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0" style={{ background: 'var(--primary)' }}>{s.name.charAt(0)}</div>
          <div>
            <h2 className="font-bold text-lg" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--foreground)' }}>{s.name}</h2>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{s.id} · {s.course} · {s.year}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="rounded-xl border p-5 text-center" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <p className="text-3xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: s.attendance >= 75 ? '#059669' : '#ef4444' }}>{s.attendance}%</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Attendance Rate</p>
          </div>
          <div className="rounded-xl border p-5 text-center" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <p className="text-3xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#059669' }}>{presentDays}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Present Days</p>
          </div>
          <div className="rounded-xl border p-5 text-center" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <p className="text-3xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#ef4444' }}>{absentDays}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Absent Days</p>
          </div>
        </div>

        {/* Chart */}
        <div className="rounded-xl border shadow-sm p-5 mb-4" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <h3 className="font-semibold mb-4" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--foreground)' }}>Monthly Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="atten" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[60, 100]} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Area type="monotone" dataKey="attendance" stroke="#1d4ed8" strokeWidth={2} fill="url(#atten)" name="Attendance %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex gap-3">
          <button onClick={() => navigate(`/students/${s.id}`)} className="px-5 py-2.5 rounded-lg text-sm font-medium border" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>Back to Student Details</button>
          <button onClick={() => navigate('/attendance')} className="px-5 py-2.5 rounded-lg text-sm font-medium border" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>Back to Attendance</button>
        </div>
      </div>
    </Layout>
  )
}
