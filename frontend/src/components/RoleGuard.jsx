import React from 'react'
import { Navigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'

const RoleGuard = ({ children, allowedRoles }) => {
  const { role, isAuthenticated } = useUserStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default RoleGuard
