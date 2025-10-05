import React from 'react'
import { Routes, Route } from 'react-router-dom'

// Import Employee components
import EmployeeDashboard from './EmployeeDashboard'
import EmployeeProfile from './EmployeeProfile'
import EmployeeSalary from './EmployeeSalary'
import EmployeeJobCards from './EmployeeJobCards'
import EmployeeGpsDashboard from './EmployeeGpsDashboard'
import EmployeeGpsCheckin from './EmployeeGpsCheckin'
import EmployeeGpsHistory from './EmployeeGpsHistory'
import EmployeeLiveLocation from './EmployeeLiveLocation'
import EmployeeAttendance from './EmployeeAttendance'
import EmployeeNotifications from './EmployeeNotifications'
import EmployeeFeedback from './EmployeeFeedback'
import EmployeeApplyLeave from './EmployeeApplyLeave'

const EmployeeRoutes = () => {
  return (
    <Routes>
      <Route index element={<EmployeeDashboard />} />
      <Route path="dashboard" element={<EmployeeDashboard />} />
      <Route path="profile" element={<EmployeeProfile />} />
      <Route path="salary" element={<EmployeeSalary />} />
      <Route path="job-cards" element={<EmployeeJobCards />} />
      <Route path="gps-dashboard" element={<EmployeeGpsDashboard />} />
      <Route path="gps-checkin" element={<EmployeeGpsCheckin />} />
      <Route path="gps-history" element={<EmployeeGpsHistory />} />
      <Route path="live-location" element={<EmployeeLiveLocation />} />
      <Route path="attendance" element={<EmployeeAttendance />} />
      <Route path="notifications" element={<EmployeeNotifications />} />
      <Route path="feedback" element={<EmployeeFeedback />} />
      <Route path="apply-leave" element={<EmployeeApplyLeave />} />
    </Routes>
  )
}

export default EmployeeRoutes
