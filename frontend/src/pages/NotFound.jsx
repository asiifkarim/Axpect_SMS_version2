import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="content">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Page Not Found</h3>
              </div>
              <div className="card-body text-center">
                <h1 className="display-1 text-muted">404</h1>
                <h2>Oops! Page not found</h2>
                <p className="lead">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
                <Link to="/" className="btn btn-primary">
                  <i className="fas fa-home mr-2"></i>
                  Go Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
