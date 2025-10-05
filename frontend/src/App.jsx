import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import BaseLayout from './components/BaseLayout'
import RoleGuard from './components/RoleGuard'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

// CEO Routes
import CeoRoutes from './templates/ceo_template/CeoRoutes'

// Manager Routes  
import ManagerRoutes from './templates/manager_template/ManagerRoutes'

// Employee Routes
import EmployeeRoutes from './templates/employee_template/EmployeeRoutes'

// Social Routes
import SocialRoutes from './templates/social/SocialRoutes'

// Registration Routes
import RegistrationRoutes from './templates/registration/RegistrationRoutes'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<RegistrationRoutes />} />
          <Route path="/registration/*" element={<RegistrationRoutes />} />
          
          {/* Protected routes with role-based access */}
          <Route path="/" element={<BaseLayout />}>
            <Route index element={<Home />} />
            
            {/* CEO Routes */}
            <Route path="ceo/*" element={
              <RoleGuard allowedRoles={['ceo']}>
                <CeoRoutes />
              </RoleGuard>
            } />
            
            {/* Manager Routes */}
            <Route path="manager/*" element={
              <RoleGuard allowedRoles={['manager']}>
                <ManagerRoutes />
              </RoleGuard>
            } />
            
            {/* Employee Routes */}
            <Route path="employee/*" element={
              <RoleGuard allowedRoles={['employee']}>
                <EmployeeRoutes />
              </RoleGuard>
            } />
            
            {/* Social Routes (accessible by all roles) */}
            <Route path="social/*" element={<SocialRoutes />} />
            
            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        
        {/* Toast notifications */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  )
}

export default App
