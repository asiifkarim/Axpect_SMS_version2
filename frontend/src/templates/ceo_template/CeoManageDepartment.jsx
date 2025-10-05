import React, { useState } from 'react'
import { useMockDataStore } from '../../store/mockDataStore'
import { toast } from 'react-toastify'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const CeoManageDepartment = () => {
  const { departments, divisions, employees } = useMockDataStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDivision, setFilterDivision] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState(null)

  const filteredDepartments = departments.filter(department => {
    const matchesSearch = department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         department.manager?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDivision = !filterDivision || department.division === filterDivision
    return matchesSearch && matchesDivision
  })

  // Calculate statistics
  const totalDepartments = departments.length
  const totalEmployees = departments.reduce((sum, dept) => sum + dept.employees_count, 0)
  const averageEmployeesPerDept = Math.round(totalEmployees / totalDepartments)

  // Chart data
  const divisionData = departments.reduce((acc, department) => {
    const division = department.division
    acc[division] = (acc[division] || 0) + 1
    return acc
  }, {})

  const chartData = Object.entries(divisionData).map(([division, count]) => ({
    division,
    departments: count
  }))

  const employeeData = departments.map(dept => ({
    name: dept.name,
    employees: dept.employees_count
  }))

  const handleEditDepartment = (department) => {
    setSelectedDepartment(department)
    toast.info(`Edit functionality for ${department.name} will be implemented`)
  }

  const handleDeleteDepartment = (departmentId) => {
    if (window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      toast.success('Department deleted successfully!')
    }
  }

  const divisionNames = [...new Set(departments.map(dept => dept.division))]

  return (
    <div className="content">
      <div className="container-fluid">
        {/* Statistics Cards */}
        <div className="row">
          <div className="col-lg-3 col-6">
            <div className="small-box bg-info">
              <div className="inner">
                <h3>{totalDepartments}</h3>
                <p>Total Departments</p>
              </div>
              <div className="icon">
                <i className="fas fa-building"></i>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-6">
            <div className="small-box bg-success">
              <div className="inner">
                <h3>{totalEmployees}</h3>
                <p>Total Employees</p>
              </div>
              <div className="icon">
                <i className="fas fa-users"></i>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-6">
            <div className="small-box bg-warning">
              <div className="inner">
                <h3>{averageEmployeesPerDept}</h3>
                <p>Avg per Department</p>
              </div>
              <div className="icon">
                <i className="fas fa-chart-pie"></i>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-6">
            <div className="small-box bg-danger">
              <div className="inner">
                <h3>{divisionNames.length}</h3>
                <p>Divisions</p>
              </div>
              <div className="icon">
                <i className="fas fa-sitemap"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Departments by Division</h3>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ division, percent }) => `${division} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="departments"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Employee Distribution</h3>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={employeeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="employees" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Department Management */}
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Manage Departments</h3>
                <div className="card-tools">
                  <a href="#/ceo/add-department" className="btn btn-primary btn-sm">
                    <i className="fas fa-plus mr-1"></i>
                    Add Department
                  </a>
                </div>
              </div>
              <div className="card-body">
                {/* Filters */}
                <div className="row mb-3">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="search">Search Departments</label>
                      <input
                        type="text"
                        className="form-control"
                        id="search"
                        placeholder="Search by name or manager..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="division">Filter by Division</label>
                      <select
                        className="form-control"
                        id="division"
                        value={filterDivision}
                        onChange={(e) => setFilterDivision(e.target.value)}
                      >
                        <option value="">All Divisions</option>
                        {divisionNames.map(division => (
                          <option key={division} value={division}>{division}</option>
                        ))}
                      </select>
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
                          <th>Division</th>
                          <th>Manager</th>
                          <th>Employees</th>
                          <th>Budget</th>
                          <th>Location</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDepartments.map(department => (
                          <tr key={department.id}>
                            <td>{department.id}</td>
                            <td>
                              <strong>{department.name}</strong>
                            </td>
                            <td>
                              <span className="badge badge-secondary">{department.code || 'N/A'}</span>
                            </td>
                            <td>
                              <span className="badge badge-info">{department.division}</span>
                            </td>
                            <td>{department.manager || 'Not assigned'}</td>
                            <td>
                              <span className="badge badge-success">{department.employees_count}</span>
                            </td>
                            <td>
                              {department.budget ? `$${department.budget.toLocaleString()}` : 'Not set'}
                            </td>
                            <td>{department.location || 'Not specified'}</td>
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
                                  onClick={() => handleEditDepartment(department)}
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button 
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleDeleteDepartment(department.id)}
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
                    {filteredDepartments.map(department => (
                      <div key={department.id} className="job-card">
                        <div className="job-card-header">
                          <div>
                            <h5 className="job-card-title">{department.name}</h5>
                            <div className="job-card-number">ID: {department.id}</div>
                          </div>
                          <span className="badge badge-secondary">{department.code || 'N/A'}</span>
                        </div>
                        
                        <div className="job-card-meta">
                          <div className="meta-item">
                            <div className="meta-label">Division</div>
                            <div className="meta-value">
                              <span className="badge badge-info">{department.division}</span>
                            </div>
                          </div>
                          <div className="meta-item">
                            <div className="meta-label">Manager</div>
                            <div className="meta-value">{department.manager || 'Not assigned'}</div>
                          </div>
                          <div className="meta-item">
                            <div className="meta-label">Employees</div>
                            <div className="meta-value">
                              <span className="badge badge-success">{department.employees_count}</span>
                            </div>
                          </div>
                          <div className="meta-item">
                            <div className="meta-label">Budget</div>
                            <div className="meta-value">
                              {department.budget ? `$${department.budget.toLocaleString()}` : 'Not set'}
                            </div>
                          </div>
                          <div className="meta-item">
                            <div className="meta-label">Location</div>
                            <div className="meta-value">{department.location || 'Not specified'}</div>
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
                              onClick={() => handleEditDepartment(department)}
                            >
                              <i className="fas fa-edit mr-1"></i>
                              Edit
                            </button>
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteDepartment(department.id)}
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

                {filteredDepartments.length === 0 && (
                  <div className="text-center py-4">
                    <i className="fas fa-building fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No departments found</h5>
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

export default CeoManageDepartment