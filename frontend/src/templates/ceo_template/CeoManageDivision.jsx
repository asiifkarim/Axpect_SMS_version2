import React, { useState } from 'react'
import { useMockDataStore } from '../../store/mockDataStore'
import { toast } from 'react-toastify'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const CeoManageDivision = () => {
  const { divisions, departments, employees } = useMockDataStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDivision, setSelectedDivision] = useState(null)

  const filteredDivisions = divisions.filter(division => 
    division.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Chart data for division comparison
  const chartData = divisions.map(division => ({
    name: division.name,
    departments: division.departments_count,
    employees: division.employees_count
  }))

  const handleEditDivision = (division) => {
    setSelectedDivision(division)
    // Open edit modal or navigate to edit page
    toast.info(`Edit functionality for ${division.name} will be implemented`)
  }

  const handleDeleteDivision = (divisionId) => {
    if (window.confirm('Are you sure you want to delete this division? This action cannot be undone.')) {
      toast.success('Division deleted successfully!')
    }
  }

  return (
    <div className="content">
      <div className="container-fluid">
        {/* Statistics Cards */}
        <div className="row">
          <div className="col-lg-3 col-6">
            <div className="small-box bg-info">
              <div className="inner">
                <h3>{divisions.length}</h3>
                <p>Total Divisions</p>
              </div>
              <div className="icon">
                <i className="fas fa-sitemap"></i>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-6">
            <div className="small-box bg-success">
              <div className="inner">
                <h3>{departments.length}</h3>
                <p>Total Departments</p>
              </div>
              <div className="icon">
                <i className="fas fa-building"></i>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-6">
            <div className="small-box bg-warning">
              <div className="inner">
                <h3>{employees.length}</h3>
                <p>Total Employees</p>
              </div>
              <div className="icon">
                <i className="fas fa-users"></i>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-6">
            <div className="small-box bg-danger">
              <div className="inner">
                <h3>{Math.round(employees.length / divisions.length)}</h3>
                <p>Avg per Division</p>
              </div>
              <div className="icon">
                <i className="fas fa-chart-pie"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Division Overview</h3>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="departments" fill="#8884d8" name="Departments" />
                    <Bar dataKey="employees" fill="#82ca9d" name="Employees" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Division Management */}
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Manage Divisions</h3>
                <div className="card-tools">
                  <a href="#/ceo/add-division" className="btn btn-primary btn-sm">
                    <i className="fas fa-plus mr-1"></i>
                    Add Division
                  </a>
                </div>
              </div>
              <div className="card-body">
                {/* Search */}
                <div className="row mb-3">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="search">Search Divisions</label>
                      <input
                        type="text"
                        className="form-control"
                        id="search"
                        placeholder="Search by division name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Desktop Table */}
                <div className="desktop-table">
                  <div className="table-responsive">
                    <table className="table table-bordered table-striped">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Code</th>
                          <th>Departments</th>
                          <th>Employees</th>
                          <th>Head</th>
                          <th>Location</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDivisions.map(division => (
                          <tr key={division.id}>
                            <td>{division.id}</td>
                            <td>
                              <strong>{division.name}</strong>
                            </td>
                            <td>
                              <span className="badge badge-secondary">{division.code || 'N/A'}</span>
                            </td>
                            <td>
                              <span className="badge badge-info">{division.departments_count}</span>
                            </td>
                            <td>
                              <span className="badge badge-success">{division.employees_count}</span>
                            </td>
                            <td>{division.head || 'Not assigned'}</td>
                            <td>{division.location || 'Not specified'}</td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button 
                                  className="btn btn-info btn-sm"
                                  onClick={() => {/* View details */}}
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button 
                                  className="btn btn-warning btn-sm"
                                  onClick={() => handleEditDivision(division)}
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button 
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleDeleteDivision(division.id)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Grid */}
                <div className="mobile-grid">
                  <div className="job-card-grid">
                    {filteredDivisions.map(division => (
                      <div key={division.id} className="job-card">
                        <div className="job-card-header">
                          <div>
                            <h5 className="job-card-title">{division.name}</h5>
                            <div className="job-card-number">ID: {division.id}</div>
                          </div>
                          <span className="badge badge-secondary">{division.code || 'N/A'}</span>
                        </div>
                        
                        <div className="job-card-meta">
                          <div className="meta-item">
                            <div className="meta-label">Departments</div>
                            <div className="meta-value">
                              <span className="badge badge-info">{division.departments_count}</span>
                            </div>
                          </div>
                          <div className="meta-item">
                            <div className="meta-label">Employees</div>
                            <div className="meta-value">
                              <span className="badge badge-success">{division.employees_count}</span>
                            </div>
                          </div>
                          <div className="meta-item">
                            <div className="meta-label">Head</div>
                            <div className="meta-value">{division.head || 'Not assigned'}</div>
                          </div>
                          <div className="meta-item">
                            <div className="meta-label">Location</div>
                            <div className="meta-value">{division.location || 'Not specified'}</div>
                          </div>
                        </div>
                        
                        <div className="job-card-actions">
                          <div className="btn-group">
                            <button 
                              className="btn btn-info btn-sm"
                              onClick={() => {/* View details */}}
                            >
                              <i className="fas fa-eye mr-1"></i>
                              View
                            </button>
                            <button 
                              className="btn btn-warning btn-sm"
                              onClick={() => handleEditDivision(division)}
                            >
                              <i className="fas fa-edit mr-1"></i>
                              Edit
                            </button>
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteDivision(division.id)}
                            >
                              <i className="fas fa-trash mr-1"></i>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {filteredDivisions.length === 0 && (
                  <div className="text-center py-4">
                    <i className="fas fa-sitemap fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No divisions found</h5>
                    <p className="text-muted">Try adjusting your search criteria</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CeoManageDivision
