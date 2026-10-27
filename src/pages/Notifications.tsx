import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

const initialNotifications = [
  { id: 1, type: 'student', title: 'New Student Registered', message: 'Priya Sharma (STU-2024-002) has been registered for B.Sc Mathematics.', time: '2 min ago', read: false },
  { id: 2, type: 'attendance', title: 'Attendance Updated', message: 'Attendance for B.Tech CSE — 2nd Year has been saved for September 20, 2026.', time: '1 hour ago', read: false },
  { id: 3, type: 'marks', title: 'Marks Added', message: 'Semester 3 marks have been added for MBA Finance batch.', time: '3 hours ago', read: true },
  { id: 4, type: 'system', title: 'System Backup Completed', message: 'Automated daily backup completed successfully at 02:00 AM.', time: '1 day ago', read: true },
  { id: 5, type: 'student', title: 'Student Status Updated', message: 'Sneha Patel (STU-2024-004) has been marked as Inactive.', time: '2 days ago', read: true },
]

const typeIcon: Record<string, string> = { student: '👥', attendance: '📋', marks: '📊', system: '⚙️' }
const typeColor: Record<string, string> = { student: '#1d4ed8', attendance: '#059669', marks: '#7c3aed', system: '#d97706' }

export default function Notifications() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState(initialNotifications)
  const unread = notifications.filter(n => !n.read).length

  const markAll = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  const mark = (id: number) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))

  return (
    <Layout title="Notifications">
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-lg" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--foreground)' }}>All Notifications</h2>
            {unread > 0 && <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ background: 'var(--primary)' }}>{unread} new</span>}
          </div>
          {unread > 0 && <button onClick={markAll} className="text-sm font-medium" style={{ color: 'var(--primary)' }}>Mark all as read</button>}
        </div>
        <div className="space-y-2">
          {notifications.map(n => (
            <button
              key={n.id}
              onClick={() => mark(n.id)}
              className="w-full text-left rounded-xl border p-4 flex gap-4 transition-all hover:shadow-sm"
              style={{ background: n.read ? 'var(--card)' : 'var(--secondary)', borderColor: n.read ? 'var(--border)' : 'var(--accent)' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg" style={{ background: n.read ? 'var(--background)' : 'white' }}>
                {typeIcon[n.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold" style={{ color: n.read ? 'var(--foreground)' : typeColor[n.type] }}>{n.title}</p>
                  {!n.read && <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: 'var(--primary)' }} />}
                </div>
                <p className="text-sm mt-0.5" style={{ color: 'var(--foreground)' }}>{n.message}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{n.time}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  )
}
