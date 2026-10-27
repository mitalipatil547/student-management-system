export interface Student {
  id: string
  name: string
  dob: string
  gender: string
  email: string
  phone: string
  course: string
  year: string
  address: string
  city: string
  state: string
  pin: string
  guardian: string
  guardianPhone: string
  admissionDate: string
  status: 'Active' | 'Inactive'
  attendance: number
  percentage: number
}

export const students: Student[] = [
  { id: 'STU-2024-001', name: 'Arjun Mehta', dob: '2003-04-12', gender: 'Male', email: 'arjun.mehta@college.edu', phone: '9876543210', course: 'B.Tech CSE', year: '2nd Year', address: '12 Park Street', city: 'Mumbai', state: 'Maharashtra', pin: '400001', guardian: 'Ramesh Mehta', guardianPhone: '9876543200', admissionDate: '2023-07-15', status: 'Active', attendance: 88, percentage: 79 },
  { id: 'STU-2024-002', name: 'Priya Sharma', dob: '2004-08-22', gender: 'Female', email: 'priya.sharma@college.edu', phone: '9123456789', course: 'B.Sc Mathematics', year: '1st Year', address: '45 Lake View', city: 'Pune', state: 'Maharashtra', pin: '411001', guardian: 'Sunita Sharma', guardianPhone: '9123456780', admissionDate: '2024-07-10', status: 'Active', attendance: 92, percentage: 85 },
  { id: 'STU-2024-003', name: 'Rohit Verma', dob: '2002-11-05', gender: 'Male', email: 'rohit.verma@college.edu', phone: '9988776655', course: 'MBA Finance', year: '2nd Year', address: '78 Gandhi Nagar', city: 'Delhi', state: 'Delhi', pin: '110001', guardian: 'Vikram Verma', guardianPhone: '9988776600', admissionDate: '2023-07-20', status: 'Active', attendance: 75, percentage: 71 },
  { id: 'STU-2024-004', name: 'Sneha Patel', dob: '2003-02-18', gender: 'Female', email: 'sneha.patel@college.edu', phone: '9765432109', course: 'B.Com Accounting', year: '2nd Year', address: '9 Shastri Colony', city: 'Ahmedabad', state: 'Gujarat', pin: '380001', guardian: 'Kiran Patel', guardianPhone: '9765432100', admissionDate: '2023-08-01', status: 'Inactive', attendance: 60, percentage: 55 },
  { id: 'STU-2024-005', name: 'Karan Singh', dob: '2003-06-30', gender: 'Male', email: 'karan.singh@college.edu', phone: '9654321098', course: 'B.Tech ECE', year: '3rd Year', address: '33 Rose Garden', city: 'Chandigarh', state: 'Punjab', pin: '160001', guardian: 'Gurpreet Singh', guardianPhone: '9654321000', admissionDate: '2022-07-18', status: 'Active', attendance: 95, percentage: 91 },
  { id: 'STU-2024-006', name: 'Anjali Rao', dob: '2004-01-14', gender: 'Female', email: 'anjali.rao@college.edu', phone: '9543210987', course: 'B.Sc Physics', year: '1st Year', address: '56 Lotus Road', city: 'Bangalore', state: 'Karnataka', pin: '560001', guardian: 'Meena Rao', guardianPhone: '9543210980', admissionDate: '2024-07-22', status: 'Active', attendance: 82, percentage: 78 },
  { id: 'STU-2024-007', name: 'Dev Kumar', dob: '2002-09-08', gender: 'Male', email: 'dev.kumar@college.edu', phone: '9432109876', course: 'MBA Marketing', year: '1st Year', address: '101 Nehru Place', city: 'Chennai', state: 'Tamil Nadu', pin: '600001', guardian: 'Suresh Kumar', guardianPhone: '9432109870', admissionDate: '2024-07-05', status: 'Active', attendance: 70, percentage: 68 },
  { id: 'STU-2024-008', name: 'Riya Joshi', dob: '2003-12-25', gender: 'Female', email: 'riya.joshi@college.edu', phone: '9321098765', course: 'B.Tech CSE', year: '2nd Year', address: '22 Mahatma Path', city: 'Jaipur', state: 'Rajasthan', pin: '302001', guardian: 'Deepa Joshi', guardianPhone: '9321098760', admissionDate: '2023-07-12', status: 'Active', attendance: 89, percentage: 83 },
]

export const courses = [
  { code: 'CSE', name: 'B.Tech CSE', duration: '4 years', students: 2 },
  { code: 'ECE', name: 'B.Tech ECE', duration: '4 years', students: 1 },
  { code: 'BSM', name: 'B.Sc Mathematics', duration: '3 years', students: 1 },
  { code: 'BSP', name: 'B.Sc Physics', duration: '3 years', students: 1 },
  { code: 'MBAF', name: 'MBA Finance', duration: '2 years', students: 1 },
  { code: 'MBAM', name: 'MBA Marketing', duration: '2 years', students: 1 },
  { code: 'BCOM', name: 'B.Com Accounting', duration: '3 years', students: 1 },
]
