import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface StudentForm {
  name: string
  email: string
  phone: string
  course: string
  dob: string
  gender: string
  year: string
  admissionDate: string
}

const COURSES = [
  'BCA',
  'BBA',
  'B.Tech',
  'Engineering',
  'MBA',
  'MCA',
  'B.Sc Computer',
]

export default function AddStudent() {
  const navigate = useNavigate()

  const [studentId, setStudentId] = useState('STU-2024-001')

  const [formData, setFormData] = useState<StudentForm>({
    name: '',
    email: '',
    phone: '',
    course: '',
    dob: '',
    gender: 'Male',
    year: '',
    admissionDate: '',
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Generate a simple Student ID
  useEffect(() => {
    const generateStudentId = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/students')

        if (!response.ok) {
          return
        }

        const students = await response.json()

        const nextNumber = students.length + 1

        const id = `STU-2024-${String(nextNumber).padStart(3, '0')}`

        setStudentId(id)
      } catch (err) {
        console.log('Could not generate student ID')
      }
    }

    generateStudentId()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    setError('')
    setMessage('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setError('')
    setMessage('')

    if (!formData.name.trim()) {
      setError('Full name is required')
      return
    }

    if (!formData.email.trim()) {
      setError('Email address is required')
      return
    }

    if (!formData.phone.trim()) {
      setError('Phone number is required')
      return
    }

    if (!formData.course) {
      setError('Please select a course')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://127.0.0.1:5000/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          course: formData.course,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add student')
      }

      setMessage('Student registered successfully!')

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        course: '',
        dob: '',
        gender: 'Male',
        year: '',
        admissionDate: '',
      })

      // Generate next ID
      try {
        const studentsResponse = await fetch(
          'http://127.0.0.1:5000/api/students'
        )

        if (studentsResponse.ok) {
          const students = await studentsResponse.json()

          const nextNumber = students.length + 1

          setStudentId(
            `STU-2024-${String(nextNumber).padStart(3, '0')}`
          )
        }
      } catch {
        // ignore
      }

      setTimeout(() => {
        navigate('/students')
      }, 1000)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Backend server is not running')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/students')
  }

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: 'var(--background)' }}
    >
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1
            className="text-3xl font-bold"
            style={{
              color: 'var(--foreground)',
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            Add Student
          </h1>

          <p
            className="mt-1"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Register a new student in the management system
          </p>
        </div>

        {/* Form Card */}
        <div
          className="rounded-xl border overflow-hidden"
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >

          {/* Form Header */}
          <div
            className="px-8 py-6 border-b"
            style={{ borderColor: 'var(--border)' }}
          >
            <h2
              className="text-2xl font-bold"
              style={{
                color: 'var(--foreground)',
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              Student Registration Form
            </h2>

            <p
              className="mt-1"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Fill in the student information below
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Personal Information */}
            <div className="px-8 py-6">

              <h3
                className="text-lg font-semibold mb-5"
                style={{ color: 'var(--foreground)' }}
              >
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Student ID */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Student ID
                  </label>

                  <input
                    type="text"
                    value={studentId}
                    readOnly
                    className="w-full px-4 py-3 rounded-lg border text-sm outline-none"
                    style={{
                      background: '#f1f5f9',
                      borderColor: 'var(--border)',
                      color: 'var(--muted-foreground)',
                    }}
                  />
                </div>

                {/* Full Name */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Full Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Arjun Mehta"
                    className="w-full px-4 py-3 rounded-lg border text-sm outline-none focus:ring-2"
                    style={{
                      background: 'var(--card)',
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)',
                    }}
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Date of Birth
                  </label>

                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border text-sm outline-none"
                    style={{
                      background: 'var(--card)',
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)',
                    }}
                  />
                </div>

                {/* Gender */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Gender
                  </label>

                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border text-sm outline-none"
                    style={{
                      background: 'var(--card)',
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)',
                    }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Course */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Course *
                  </label>

                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border text-sm outline-none"
                    style={{
                      background: 'var(--card)',
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)',
                    }}
                  >
                    <option value="">Select course</option>

                    {COURSES.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Phone Number *
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="w-full px-4 py-3 rounded-lg border text-sm outline-none"
                    style={{
                      background: 'var(--card)',
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)',
                    }}
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Email Address *
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@gmail.com"
                    className="w-full px-4 py-3 rounded-lg border text-sm outline-none"
                    style={{
                      background: 'var(--card)',
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)',
                    }}
                  />
                </div>

                {/* Year */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Year
                  </label>

                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border text-sm outline-none"
                    style={{
                      background: 'var(--card)',
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)',
                    }}
                  >
                    <option value="">Select year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>

                {/* Admission Date */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Admission Date
                  </label>

                  <input
                    type="date"
                    name="admissionDate"
                    value={formData.admissionDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border text-sm outline-none"
                    style={{
                      background: 'var(--card)',
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)',
                    }}
                  />
                </div>

              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mx-8 mb-5">
                <div
                  className="px-4 py-3 rounded-lg text-sm"
                  style={{
                    background: '#fee2e2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                  }}
                >
                  {error}
                </div>
              </div>
            )}

            {/* Success */}
            {message && (
              <div className="mx-8 mb-5">
                <div
                  className="px-4 py-3 rounded-lg text-sm"
                  style={{
                    background: '#dcfce7',
                    color: '#16a34a',
                    border: '1px solid #bbf7d0',
                  }}
                >
                  {message}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div
              className="px-8 py-5 border-t flex justify-end gap-3"
              style={{ borderColor: 'var(--border)' }}
            >

              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-6 py-2.5 rounded-lg border text-sm font-medium transition-opacity hover:opacity-80"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                  background: 'var(--card)',
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{
                  background: 'var(--primary)',
                }}
              >
                {loading ? 'Saving...' : 'Register Student'}
              </button>

            </div>

          </form>
        </div>
      </div>
    </div>
  )
}