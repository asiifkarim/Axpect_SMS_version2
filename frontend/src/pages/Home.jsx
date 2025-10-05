import React from 'react'
import { Navigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'

const Home = () => {
  const { role, isAuthenticated } = useUserStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Redirect based on user role
  if (role === 'ceo') {
    return <Navigate to="/ceo/dashboard" replace />
  } else if (role === 'manager') {
    return <Navigate to="/manager/dashboard" replace />
  } else if (role === 'employee') {
    return <Navigate to="/employee/dashboard" replace />
  }

  return (
    <div className="content">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Welcome to Axpect Technologies</h3>
              </div>
              <div className="card-body">
                <p>Please select your role to continue.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
