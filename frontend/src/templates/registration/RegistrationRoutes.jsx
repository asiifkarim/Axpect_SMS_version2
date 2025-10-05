import React from 'react'
import { Routes, Route } from 'react-router-dom'
import LoginForm from './LoginForm'

const RegistrationRoutes = () => {
  return (
    <Routes>
      <Route index element={<LoginForm />} />
      <Route path="login" element={<LoginForm />} />
      <Route path="password-reset" element={<div>Password Reset Form</div>} />
      <Route path="signup" element={<div>Signup Form</div>} />
    </Routes>
  )
}

export default RegistrationRoutes
