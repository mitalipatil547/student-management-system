import { useNavigate } from 'react-router-dom'

const notifications = [
  { id: 1, type: 'student', message: 'New student Priya Sharma registered', time: '2 min ago', read: false },
  { id: 2, type: 'attendance', message: 'Attendance updated for CS-2024 batch', time: '1 hour ago', read: false },
  { id: 3, type: 'marks', message: 'Marks added for Semester 3 — MBA', time: '3 hours ago', read: true },
  { id: 4, type: 'system', message: 'System backup completed successfully', time: '1 day ago', read: true },
]

export default function NotificationsDropdown({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()

  return (
    <div className="absolute right-0 top-12 w-80 rounded-xl shadow-xl border z-50 overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <p className="font-semibold text-sm" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--foreground)' }}>Notifications</p>
        <button
          onClick={() => { navigate('/notifications'); onClose() }}
          className="text-xs font-medium" style={{ color: 'var(--primary)' }}
        >
          View all
        </button>
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        {notifications.map(n => (
          <button
            key={n.id}
            onClick={() => { navigate('/notifications'); onClose() }}
            className="w-full text-left px-4 py-3 flex gap-3 hover:bg-slate-50 transition-colors"
          >
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.read ? 'bg-slate-200' : 'bg-blue-500'}`} />
            <div>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{n.message}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{n.time}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
