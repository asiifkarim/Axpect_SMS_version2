import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import '../styles/sidebar-styles.module.css'

const Sidebar = () => {
  const location = useLocation()
  const { user, role } = useUserStore()
  const [openMenus, setOpenMenus] = useState({})

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path)
  }

  const toggleMenu = (menuName) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }))
  }

  const isMenuOpen = (menuName) => {
    return openMenus[menuName] || false
  }

  const renderCeoSidebar = () => (
    <aside className="main-sidebar sidebar-dark-primary elevation-4">
      {/* Company Logo and Name */}
      <div className="brand-section">
        <div className="company-logo">
          <img src="/images/company-logo.png" alt="Axpect Technologies Logo" className="logo-image" />
        </div>
        <div className="company-name">
          <span className="brand-text font-weight-light">Axpect Technologies</span>
        </div>
      </div>

      {/* Sidebar */}
      <div className="sidebar">
        {/* Spacer between brand and menu */}
        <div className="sidebar-spacer"></div>

        {/* Sidebar Menu */}
        <nav className="mt-2">
          <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
            
            {/* Dashboard */}
            <li className="nav-item">
              <Link to="/ceo/dashboard" className={`nav-link ${isActive('/ceo/dashboard') ? 'active' : ''}`}>
                <i className="nav-icon fas fa-tachometer-alt"></i>
                <p>Dashboard</p>
              </Link>
            </li>

            {/* Profile Management */}
            <li className="nav-item">
              <Link to="/ceo/profile" className={`nav-link ${isActive('/ceo/profile') ? 'active' : ''}`}>
                <i className="nav-icon fas fa-user-cog"></i>
                <p>My Profile</p>
              </Link>
            </li>

            {/* Social Module */}
            <li className="nav-item">
              <Link to="/social/dashboard" className={`nav-link ${isActive('/social') ? 'active' : ''}`}>
                <i className="nav-icon fas fa-comments"></i>
                <p>Messages</p>
                <span className="badge badge-info right" id="unread-messages-count" style={{display: 'none'}}>0</span>
              </Link>
            </li>

            {/* Google Drive */}
            <li className="nav-item">
              <Link to="/ceo/google-drive" className={`nav-link ${isActive('/ceo/google-drive') ? 'active' : ''}`}>
                <i className="nav-icon fab fa-google-drive"></i>
                <p>G-Drive</p>
              </Link>
            </li>

            {/* User Management - Collapsible */}
            <li className={`nav-item has-treeview ${isMenuOpen('userManagement') ? 'menu-open' : ''}`}>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); toggleMenu('userManagement'); }}>
                <i className="nav-icon fas fa-users"></i>
                <p>
                  User Management
                  <i className="right fas fa-angle-left"></i>
                </p>
              </a>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link to="/ceo/add-manager" className={`nav-link ${isActive('/ceo/add-manager') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Add Manager</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/ceo/manage-manager" className={`nav-link ${isActive('/ceo/manage-manager') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Manage Managers</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/ceo/add-employee" className={`nav-link ${isActive('/ceo/add-employee') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Add Employee</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/ceo/manage-employee" className={`nav-link ${isActive('/ceo/manage-employee') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Manage Employees</p>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Organization - Collapsible */}
            <li className={`nav-item has-treeview ${isMenuOpen('organization') ? 'menu-open' : ''}`}>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); toggleMenu('organization'); }}>
                <i className="nav-icon fas fa-sitemap"></i>
                <p>
                  Organization
                  <i className="right fas fa-angle-left"></i>
                </p>
              </a>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link to="/ceo/add-division" className={`nav-link ${isActive('/ceo/add-division') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Add Division</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/ceo/manage-division" className={`nav-link ${isActive('/ceo/manage-division') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Manage Divisions</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/ceo/add-department" className={`nav-link ${isActive('/ceo/add-department') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Add Department</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/ceo/manage-department" className={`nav-link ${isActive('/ceo/manage-department') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Manage Departments</p>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Business Management - Collapsible */}
            <li className={`nav-item has-treeview ${isMenuOpen('business') ? 'menu-open' : ''}`}>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); toggleMenu('business'); }}>
                <i className="nav-icon fas fa-briefcase"></i>
                <p>
                  Business
                  <i className="right fas fa-angle-left"></i>
                </p>
              </a>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link to="/ceo/customers-manage" className={`nav-link ${isActive('/ceo/customers-manage') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Customer Management</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/ceo/job-card-dashboard" className={`nav-link ${isActive('/ceo/job-card-dashboard') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Job Card Management</p>
                  </Link>
                </li>
              </ul>
            </li>

            {/* GPS Tracking - Collapsible */}
            <li className={`nav-item has-treeview ${isMenuOpen('gpsTracking') ? 'menu-open' : ''}`}>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); toggleMenu('gpsTracking'); }}>
                <i className="nav-icon fas fa-map-marked-alt"></i>
                <p>
                  GPS Tracking
                  <i className="right fas fa-angle-left"></i>
                </p>
              </a>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link to="/ceo/gps-dashboard" className={`nav-link ${isActive('/ceo/gps-dashboard') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>GPS Dashboard</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/ceo/location-analytics" className={`nav-link ${isActive('/ceo/location-analytics') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Location Analytics</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/ceo/geofence-management" className={`nav-link ${isActive('/ceo/geofence-management') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Geofence Management</p>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Attendance */}
            <li className="nav-item">
              <Link to="/ceo/view-attendance" className={`nav-link ${isActive('/ceo/view-attendance') ? 'active' : ''}`}>
                <i className="nav-icon fas fa-calendar-check"></i>
                <p>View Attendance</p>
              </Link>
            </li>

            {/* Communication - Collapsible */}
            <li className={`nav-item has-treeview ${isMenuOpen('communication') ? 'menu-open' : ''}`}>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); toggleMenu('communication'); }}>
                <i className="nav-icon fas fa-comments"></i>
                <p>
                  Communication
                  <i className="right fas fa-angle-left"></i>
                </p>
              </a>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link to="/ceo/employee-feedback" className={`nav-link ${isActive('/ceo/employee-feedback') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Employee Feedback</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/ceo/manager-feedback" className={`nav-link ${isActive('/ceo/manager-feedback') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Manager Feedback</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/ceo/notify-manager" className={`nav-link ${isActive('/ceo/notify-manager') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Notify Manager</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/ceo/notify-employee" className={`nav-link ${isActive('/ceo/notify-employee') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Notify Employee</p>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Leave Management - Collapsible */}
            <li className={`nav-item has-treeview ${isMenuOpen('leaveManagement') ? 'menu-open' : ''}`}>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); toggleMenu('leaveManagement'); }}>
                <i className="nav-icon fas fa-calendar-minus"></i>
                <p>
                  Leave Management
                  <i className="right fas fa-angle-left"></i>
                </p>
              </a>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link to="/ceo/manager-leave" className={`nav-link ${isActive('/ceo/manager-leave') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Manager Leave</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/ceo/employee-leave" className={`nav-link ${isActive('/ceo/employee-leave') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Employee Leave</p>
                  </Link>
                </li>
              </ul>
            </li>

              </ul>
            </nav>
          </div>
        </aside>
  )

  const renderManagerSidebar = () => (
    <aside className="main-sidebar sidebar-dark-primary elevation-4">
      {/* Company Logo and Name */}
      <div className="brand-section">
        <div className="company-logo">
          <img src="/images/company-logo.png" alt="Axpect Technologies Logo" className="logo-image" />
        </div>
        <div className="company-name">
          <span className="brand-text font-weight-light">Axpect Technologies</span>
        </div>
      </div>

      {/* Sidebar */}
      <div className="sidebar">
        {/* Spacer between brand and menu */}
        <div className="sidebar-spacer"></div>

        {/* Sidebar Menu */}
        <nav className="mt-2">
          <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
            
            {/* Dashboard */}
            <li className="nav-item">
              <Link to="/manager/dashboard" className={`nav-link ${isActive('/manager/dashboard') ? 'active' : ''}`}>
                <i className="nav-icon fas fa-tachometer-alt"></i>
                <p>Dashboard</p>
              </Link>
            </li>

            {/* Profile Management */}
            <li className="nav-item">
              <Link to="/manager/profile" className={`nav-link ${isActive('/manager/profile') ? 'active' : ''}`}>
                <i className="nav-icon fas fa-user-cog"></i>
                <p>My Profile</p>
              </Link>
            </li>

            {/* Social Module */}
            <li className="nav-item">
              <Link to="/social/dashboard" className={`nav-link ${isActive('/social') ? 'active' : ''}`}>
                <i className="nav-icon fas fa-comments"></i>
                <p>Messages</p>
                <span className="badge badge-info right" id="unread-messages-count" style={{display: 'none'}}>0</span>
              </Link>
            </li>

            {/* Google Drive */}
            <li className="nav-item">
              <Link to="/manager/google-drive" className={`nav-link ${isActive('/manager/google-drive') ? 'active' : ''}`}>
                <i className="nav-icon fab fa-google-drive"></i>
                <p>G-Drive</p>
              </Link>
            </li>

            {/* Salary Management - Collapsible */}
            <li className={`nav-item has-treeview ${isMenuOpen('salaryManagement') ? 'menu-open' : ''}`}>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); toggleMenu('salaryManagement'); }}>
                <i className="nav-icon fas fa-dollar-sign"></i>
                <p>
                  Salary Management
                  <i className="right fas fa-angle-left"></i>
                </p>
              </a>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link to="/manager/add-salary" className={`nav-link ${isActive('/manager/add-salary') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Add Salary</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/manager/edit-salary" className={`nav-link ${isActive('/manager/edit-salary') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Edit Salary</p>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Job Management - Collapsible */}
            <li className={`nav-item has-treeview ${isMenuOpen('managerJobManagement') ? 'menu-open' : ''}`}>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); toggleMenu('managerJobManagement'); }}>
                <i className="nav-icon fas fa-clipboard-list"></i>
                <p>
                  Job Management
                  <i className="right fas fa-angle-left"></i>
                </p>
              </a>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link to="/manager/job-card-dashboard" className={`nav-link ${isActive('/manager/job-card-dashboard') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Job Card Dashboard</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/manager/create-job-card" className={`nav-link ${isActive('/manager/create-job-card') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Create Job Card</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/manager/assign-job-card" className={`nav-link ${isActive('/manager/assign-job-card') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Assign Job Card</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/manager/job-card-reports" className={`nav-link ${isActive('/manager/job-card-reports') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Job Card Reports</p>
                  </Link>
                </li>
              </ul>
            </li>

            {/* GPS Tracking - Collapsible */}
            <li className={`nav-item has-treeview ${isMenuOpen('managerGpsTracking') ? 'menu-open' : ''}`}>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); toggleMenu('managerGpsTracking'); }}>
                <i className="nav-icon fas fa-map-marked-alt"></i>
                <p>
                  GPS Tracking
                  <i className="right fas fa-angle-left"></i>
                </p>
              </a>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link to="/manager/gps-dashboard" className={`nav-link ${isActive('/manager/gps-dashboard') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Team GPS Dashboard</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/manager/employee-locations" className={`nav-link ${isActive('/manager/employee-locations') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Employee Locations</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/manager/attendance-reports" className={`nav-link ${isActive('/manager/attendance-reports') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>GPS Reports</p>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Attendance Management - Collapsible */}
            <li className={`nav-item has-treeview ${isMenuOpen('managerAttendance') ? 'menu-open' : ''}`}>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); toggleMenu('managerAttendance'); }}>
                <i className="nav-icon fas fa-calendar-check"></i>
                <p>
                  Attendance
                  <i className="right fas fa-angle-left"></i>
                </p>
              </a>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link to="/manager/take-attendance" className={`nav-link ${isActive('/manager/take-attendance') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Take Attendance</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/manager/update-attendance" className={`nav-link ${isActive('/manager/update-attendance') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>View/Update Attendance</p>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Communication - Collapsible */}
            <li className={`nav-item has-treeview ${isMenuOpen('managerCommunication') ? 'menu-open' : ''}`}>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); toggleMenu('managerCommunication'); }}>
                <i className="nav-icon fas fa-comments"></i>
                <p>
                  Communication
                  <i className="right fas fa-angle-left"></i>
                </p>
              </a>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link to="/manager/notifications" className={`nav-link ${isActive('/manager/notifications') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>View Notifications</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/manager/feedback" className={`nav-link ${isActive('/manager/feedback') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Feedback</p>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Leave Management */}
            <li className="nav-item">
              <Link to="/manager/apply-leave" className={`nav-link ${isActive('/manager/apply-leave') ? 'active' : ''}`}>
                <i className="nav-icon fas fa-calendar-minus"></i>
                <p>Apply For Leave</p>
              </Link>
            </li>

              </ul>
            </nav>
          </div>
        </aside>
  )

  const renderEmployeeSidebar = () => (
    <aside className="main-sidebar sidebar-dark-primary elevation-4">
      {/* Company Logo and Name */}
      <div className="brand-section">
        <div className="company-logo">
          <img src="/images/company-logo.png" alt="Axpect Technologies Logo" className="logo-image" />
        </div>
        <div className="company-name">
          <span className="brand-text font-weight-light">Axpect Technologies</span>
        </div>
      </div>

      {/* Sidebar */}
      <div className="sidebar">
        {/* Spacer between brand and menu */}
        <div className="sidebar-spacer"></div>

        {/* Sidebar Menu */}
        <nav className="mt-2">
          <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
            
            {/* Dashboard */}
            <li className="nav-item">
              <Link to="/employee/dashboard" className={`nav-link ${isActive('/employee/dashboard') ? 'active' : ''}`}>
                <i className="nav-icon fas fa-tachometer-alt"></i>
                <p>Dashboard</p>
              </Link>
            </li>

            {/* Profile Management */}
            <li className="nav-item">
              <Link to="/employee/profile" className={`nav-link ${isActive('/employee/profile') ? 'active' : ''}`}>
                <i className="nav-icon fas fa-user-cog"></i>
                <p>My Profile</p>
              </Link>
            </li>

            {/* Social Module */}
            <li className="nav-item">
              <Link to="/social/dashboard" className={`nav-link ${isActive('/social') ? 'active' : ''}`}>
                <i className="nav-icon fas fa-comments"></i>
                <p>Messages</p>
                <span className="badge badge-info right" id="unread-messages-count" style={{display: 'none'}}>0</span>
              </Link>
            </li>

            {/* Google Drive */}
            <li className="nav-item">
              <Link to="/employee/google-drive" className={`nav-link ${isActive('/employee/google-drive') ? 'active' : ''}`}>
                <i className="nav-icon fab fa-google-drive"></i>
                <p>G-Drive</p>
              </Link>
            </li>

            {/* Salary */}
            <li className="nav-item">
              <Link to="/employee/salary" className={`nav-link ${isActive('/employee/salary') ? 'active' : ''}`}>
                <i className="nav-icon fas fa-dollar-sign"></i>
                <p>View Salary</p>
              </Link>
            </li>

            {/* Job Management */}
            <li className="nav-item">
              <Link to="/employee/job-cards" className={`nav-link ${isActive('/employee/job-cards') ? 'active' : ''}`}>
                <i className="nav-icon fas fa-clipboard-list"></i>
                <p>My Job Cards</p>
              </Link>
            </li>

            {/* GPS Tracking - Collapsible */}
            <li className={`nav-item has-treeview ${isMenuOpen('employeeGpsTracking') ? 'menu-open' : ''}`}>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); toggleMenu('employeeGpsTracking'); }}>
                <i className="nav-icon fas fa-map-marked-alt"></i>
                <p>
                  GPS Tracking
                  <i className="right fas fa-angle-left"></i>
                </p>
              </a>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link to="/employee/gps-dashboard" className={`nav-link ${isActive('/employee/gps-dashboard') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>GPS Dashboard</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/employee/gps-history" className={`nav-link ${isActive('/employee/gps-history') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>GPS History</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/employee/live-location" className={`nav-link ${isActive('/employee/live-location') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Live Location</p>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Attendance */}
            <li className="nav-item">
              <Link to="/employee/attendance" className={`nav-link ${isActive('/employee/attendance') ? 'active' : ''}`}>
                <i className="nav-icon fas fa-calendar-check"></i>
                <p>View Attendance</p>
              </Link>
            </li>

            {/* Communication - Collapsible */}
            <li className={`nav-item has-treeview ${isMenuOpen('employeeCommunication') ? 'menu-open' : ''}`}>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); toggleMenu('employeeCommunication'); }}>
                <i className="nav-icon fas fa-comments"></i>
                <p>
                  Communication
                  <i className="right fas fa-angle-left"></i>
                </p>
              </a>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link to="/employee/notifications" className={`nav-link ${isActive('/employee/notifications') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>View Notifications</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/employee/feedback" className={`nav-link ${isActive('/employee/feedback') ? 'active' : ''}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Feedback</p>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Leave Management */}
            <li className="nav-item">
              <Link to="/employee/apply-leave" className={`nav-link ${isActive('/employee/apply-leave') ? 'active' : ''}`}>
                <i className="nav-icon fas fa-calendar-minus"></i>
                <p>Apply For Leave</p>
              </Link>
            </li>

              </ul>
            </nav>
          </div>
        </aside>
  )

  // Render appropriate sidebar based on user role
  if (role === 'ceo') {
    return renderCeoSidebar()
  } else if (role === 'manager') {
    return renderManagerSidebar()
  } else if (role === 'employee') {
    return renderEmployeeSidebar()
  }

  // Default sidebar for unauthenticated users
  return (
    <aside className="main-sidebar sidebar-dark-primary elevation-4">
      <Link to="/" className="brand-link">
        <img src="/images/company-logo.png" alt="Axpect Technologies Logo" className="brand-image img-circle elevation-3" style={{opacity: '.8'}} />
        <span className="brand-text font-weight-light">Axpect Technologies</span>
      </Link>
    </aside>
  )
}

export default Sidebar
