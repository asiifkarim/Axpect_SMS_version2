import React from 'react'
import { Routes, Route } from 'react-router-dom'

// Import Manager components
import ManagerDashboard from './ManagerDashboard'
import ManagerProfile from './ManagerProfile'
import ManagerAddSalary from './ManagerAddSalary'
import ManagerEditSalary from './ManagerEditSalary'
import ManagerJobCardDashboard from './ManagerJobCardDashboard'
import ManagerCreateJobCard from './ManagerCreateJobCard'
import ManagerAssignJobCard from './ManagerAssignJobCard'
import ManagerJobCardReports from './ManagerJobCardReports'
import ManagerGpsDashboard from './ManagerGpsDashboard'
import ManagerEmployeeLocations from './ManagerEmployeeLocations'
import ManagerAttendanceReports from './ManagerAttendanceReports'
import ManagerTakeAttendance from './ManagerTakeAttendance'
import ManagerUpdateAttendance from './ManagerUpdateAttendance'
import ManagerNotifications from './ManagerNotifications'
import ManagerFeedback from './ManagerFeedback'
import ManagerApplyLeave from './ManagerApplyLeave'

const ManagerRoutes = () => {
  return (
    <Routes>
      {/* Dashboard */}
      <Route path="/dashboard" element={<ManagerDashboard />} />
      
      {/* Profile */}
      <Route path="/profile" element={<ManagerProfile />} />
      
      {/* Salary Management */}
      <Route path="/add-salary" element={<ManagerAddSalary />} />
      <Route path="/edit-salary" element={<ManagerEditSalary />} />
      
      {/* Job Management */}
      <Route path="/job-card-dashboard" element={<ManagerJobCardDashboard />} />
      <Route path="/create-job-card" element={<ManagerCreateJobCard />} />
      <Route path="/assign-job-card" element={<ManagerAssignJobCard />} />
      <Route path="/job-card-reports" element={<ManagerJobCardReports />} />
      
      {/* GPS Tracking */}
      <Route path="/gps-dashboard" element={<ManagerGpsDashboard />} />
      <Route path="/employee-locations" element={<ManagerEmployeeLocations />} />
      <Route path="/attendance-reports" element={<ManagerAttendanceReports />} />
      
      {/* Attendance Management */}
      <Route path="/take-attendance" element={<ManagerTakeAttendance />} />
      <Route path="/update-attendance" element={<ManagerUpdateAttendance />} />
      
      {/* Communication */}
      <Route path="/notifications" element={<ManagerNotifications />} />
      <Route path="/feedback" element={<ManagerFeedback />} />
      
      {/* Leave Management */}
      <Route path="/apply-leave" element={<ManagerApplyLeave />} />
    </Routes>
  )
}

export default ManagerRoutes
