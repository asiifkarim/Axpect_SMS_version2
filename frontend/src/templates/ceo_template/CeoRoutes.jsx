import React from 'react'
import { Routes, Route } from 'react-router-dom'
import CeoDashboard from './CeoDashboard'
import CeoAddEmployee from './CeoAddEmployee'
import CeoManageEmployee from './CeoManageEmployee'
import CeoAddManager from './CeoAddManager'
import CeoManageManager from './CeoManageManager'
import CeoAddDepartment from './CeoAddDepartment'
import CeoManageDepartment from './CeoManageDepartment'
import CeoGpsDashboard from './CeoGpsDashboard'
import CeoJobCardDashboard from './CeoJobCardDashboard'
import CeoCustomersManage from './CeoCustomersManage'
import CeoViewAttendance from './CeoViewAttendance'
import CeoViewProfile from './CeoViewProfile'
import CeoAddDivision from './CeoAddDivision'
import CeoManageDivision from './CeoManageDivision'
import CeoManagerLeave from './CeoManagerLeave'
import CeoEmployeeLeave from './CeoEmployeeLeave'
import CeoEmployeeFeedback from './CeoEmployeeFeedback'
import CeoLocationAnalytics from './CeoLocationAnalytics'
import CeoGeofenceManagement from './CeoGeofenceManagement'
import CeoManagerFeedback from './CeoManagerFeedback'
import CeoNotifyManager from './CeoNotifyManager'
import CeoNotifyEmployee from './CeoNotifyEmployee'

const CeoRoutes = () => {
  return (
    <Routes>
      <Route index element={<CeoDashboard />} />
      <Route path="dashboard" element={<CeoDashboard />} />
      <Route path="profile" element={<CeoViewProfile />} />
      
      {/* User Management */}
      <Route path="add-employee" element={<CeoAddEmployee />} />
      <Route path="manage-employee" element={<CeoManageEmployee />} />
      <Route path="add-manager" element={<CeoAddManager />} />
      <Route path="manage-manager" element={<CeoManageManager />} />
      
      {/* Organization */}
      <Route path="add-department" element={<CeoAddDepartment />} />
      <Route path="manage-department" element={<CeoManageDepartment />} />
      <Route path="add-division" element={<CeoAddDivision />} />
      <Route path="manage-division" element={<CeoManageDivision />} />
      
      {/* Customer Management */}
      <Route path="customers-manage" element={<CeoCustomersManage />} />
      
      {/* Job Management */}
      <Route path="job-card-dashboard" element={<CeoJobCardDashboard />} />
      
      {/* GPS Tracking */}
      <Route path="gps-dashboard" element={<CeoGpsDashboard />} />
      <Route path="location-analytics" element={<CeoLocationAnalytics />} />
      <Route path="geofence-management" element={<CeoGeofenceManagement />} />
      
      {/* Attendance */}
      <Route path="view-attendance" element={<CeoViewAttendance />} />
      
      {/* Communication */}
      <Route path="employee-feedback" element={<CeoEmployeeFeedback />} />
      <Route path="manager-feedback" element={<CeoManagerFeedback />} />
      <Route path="notify-manager" element={<CeoNotifyManager />} />
      <Route path="notify-employee" element={<CeoNotifyEmployee />} />
      
      {/* Leave Management */}
      <Route path="manager-leave" element={<CeoManagerLeave />} />
      <Route path="employee-leave" element={<CeoEmployeeLeave />} />
    </Routes>
  )
}

export default CeoRoutes
