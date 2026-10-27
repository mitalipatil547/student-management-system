import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/resetpassword'

import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import AddStudent from './pages/AddStudent'
import StudentDetails from './pages/StudentDetails'
import EditStudent from './pages/EditStudent'

import Attendance from './pages/Attendance'
import AttendanceReport from './pages/AttendanceReport'
import StudentAttendance from './pages/StudentAttendance'

import MarksResults from './pages/MarksResults'
import AddMarks from './pages/AddMarks'
import StudentResult from './pages/StudentResult'

import Courses from './pages/Courses'
import AddCourse from './pages/AddCourse'

import Settings from './pages/Settings'
import AdminProfile from './pages/AdminProfile'
import Notifications from './pages/Notifications'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/students/add" element={<AddStudent />} />
        <Route path="/students/:id" element={<StudentDetails />} />
        <Route path="/students/:id/edit" element={<EditStudent />} />

        <Route path="/attendance" element={<Attendance />} />
        <Route path="/attendance/report" element={<AttendanceReport />} />
        <Route path="/students/:id/attendance" element={<StudentAttendance />} />

        <Route path="/marks" element={<MarksResults />} />
        <Route path="/marks/add" element={<AddMarks />} />
        <Route path="/students/:id/result" element={<StudentResult />} />

        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/add" element={<AddCourse />} />

        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<AdminProfile />} />
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
    </BrowserRouter>
  )
}