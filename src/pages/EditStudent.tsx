import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { students } from '../data/students'

export default function EditStudent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const s = students.find(st => st.id === id) || students[0]
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ ...s })

  const update = (field: string, val: string) => setForm(f => ({ ...f, [field]: val }))

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => navigate(`/students/${s.id}`), 1500)
  }

  return (
    <Layout title="Edit Student">
      {saved && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-white" style={{ background: '#059669' }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          Student updated successfully!
        </div>
      )}
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(`/students/${s.id}`)} className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            Back to Student Details
          </button>
        </div>
        <div className="rounded-xl border shadow-sm" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="font-semibold text-lg" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--foreground)' }}>Edit Student — {s.name}</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Student ID" value={form.id} onChange={v => update('id', v)} disabled />
              <Field label="Full Name" value={form.name} onChange={v => update('name', v)} />
              <Field label="Date of Birth" type="date" value={form.dob} onChange={v => update('dob', v)} />
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Gender</label>
                <select value={form.gender} onChange={e => update('gender', e.target.value)} className="w-full px-3 py-2.5 rounded-lg border text-sm" style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <Field label="Email" type="email" value={form.email} onChange={v => update('email', v)} />
              <Field label="Phone" value={form.phone} onChange={v => update('phone', v)} />
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Course</label>
                <select value={form.course} onChange={e => update('course', e.target.value)} className="w-full px-3 py-2.5 rounded-lg border text-sm" style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                  {['B.Tech CSE', 'B.Tech ECE', 'B.Sc Mathematics', 'B.Sc Physics', 'MBA Finance', 'MBA Marketing', 'B.Com Accounting'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Year</label>
                <select value={form.year} onChange={e => update('year', e.target.value)} className="w-full px-3 py-2.5 rounded-lg border text-sm" style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                  {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
              <Field label="Address" value={form.address} onChange={v => update('address', v)} />
              <Field label="City" value={form.city} onChange={v => update('city', v)} />
              <Field label="State" value={form.state} onChange={v => update('state', v)} />
              <Field label="Pin Code" value={form.pin} onChange={v => update('pin', v)} />
              <Field label="Guardian Name" value={form.guardian} onChange={v => update('guardian', v)} />
              <Field label="Guardian Phone" value={form.guardianPhone} onChange={v => update('guardianPhone', v)} />
            </div>
          </div>
          <div className="flex gap-3 px-6 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <button onClick={handleSave} className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: 'var(--primary)' }}>Update Student</button>
            <button onClick={() => navigate(`/students/${s.id}`)} className="px-5 py-2.5 rounded-lg text-sm font-medium border" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>Cancel</button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text', disabled }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none disabled:opacity-60" style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
    </div>
  )
}
