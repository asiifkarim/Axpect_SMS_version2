import React, { useState } from 'react'
import { useMockDataStore } from '../../store/mockDataStore'
import { toast } from 'react-toastify'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const CeoManagerLeave = () => {
  const { employees, leaveRequests } = useMockDataStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')

  // Filter managers (user_type === '2')
  const managers = employees.filter(emp => emp.user_type === '2')
  
  const filteredLeaveRequests = leaveRequests.filter(request => {
    const manager = managers.find(mgr => mgr.id === request.employee_id)
    const matchesSearch = !searchTerm || 
                         (manager?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          manager?.email.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = !filterStatus || request.status === filterStatus
    const matchesType = !filterType || request.leave_type === filterType
    return matchesSearch && matchesStatus && matchesType
  })

  // Calculate statistics
  const totalRequests = leaveRequests.length
  const pendingRequests = leaveRequests.filter(req => req.status === 'pending').length
  const approvedRequests = leaveRequests.filter(req => req.status === 'approved').length
  const rejectedRequests = leaveRequests.filter(req => req.status === 'rejected').length

  // Chart data
  const statusData = [
    { name: 'Approved', value: approvedRequests, color: '#28a745' },
    { name: 'Pending', value: pendingRequests, color: '#ffc107' },
    { name: 'Rejected', value: rejectedRequests, color: '#dc3545' }
  ]

  const typeData = leaveRequests.reduce((acc, request) => {
    acc[request.leave_type] = (acc[request.leave_type] || 0) + 1
    return acc
  }, {})

  const chartData = Object.entries(typeData).map(([type, count]) => ({
    type,
    count
  }))

  const handleStatusChange = (requestId, newStatus) => {
    // Update leave request status
    toast.success(`Leave request ${newStatus} successfully!`)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success'
      case 'pending': return 'warning'
      case 'rejected': return 'danger'
      default: return 'secondary'
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'sick': return 'danger'
      case 'vacation': return 'success'
      case 'personal': return 'info'
      case 'emergency': return 'warning'
      default: return 'secondary'
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
                <h3>{totalRequests}</h3>
                <p>Total Requests</p>
              </div>
              <div className="icon">
                <i className="fas fa-calendar-times"></i>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-6">
            <div className="small-box bg-warning">
              <div className="inner">
                <h3>{pendingRequests}</h3>
                <p>Pending</p>
              </div>
              <div className="icon">
                <i className="fas fa-clock"></i>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-6">
            <div className="small-box bg-success">
              <div className="inner">
                <h3>{approvedRequests}</h3>
                <p>Approved</p>
              </div>
              <div className="icon">
                <i className="fas fa-check-circle"></i>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-6">
            <div className="small-box bg-danger">
              <div className="inner">
                <h3>{rejectedRequests}</h3>
                <p>Rejected</p>
              </div>
              <div className="icon">
                <i className="fas fa-times-circle"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Leave Request Status</h3>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
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
                <h3 className="card-title">Leave Types</h3>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Leave Requests Management */}
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Manager Leave Requests</h3>
              </div>
              <div className="card-body">
                {/* Filters */}
                <div className="row mb-3">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label htmlFor="search">Search Manager</label>
                      <input
                        type="text"
                        className="form-control"
                        id="search"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label htmlFor="status">Filter by Status</label>
                      <select
                        className="form-control"
                        id="status"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label htmlFor="type">Filter by Type</label>
                      <select
                        className="form-control"
                        id="type"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                      >
                        <option value="">All Types</option>
                        <option value="sick">Sick Leave</option>
                        <option value="vacation">Vacation</option>
                        <option value="personal">Personal</option>
                        <option value="emergency">Emergency</option>
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
                          <th>Manager</th>
                          <th>Leave Type</th>
                          <th>Start Date</th>
                          <th>End Date</th>
                          <th>Days</th>
                          <th>Reason</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLeaveRequests.map(request => {
                          const manager = managers.find(mgr => mgr.id === request.employee_id)
                          const startDate = new Date(request.start_date)
                          const endDate = new Date(request.end_date)
                          const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
                          
                          return (
                            <tr key={request.id}>
                              <td>{request.id}</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <img 
                                    src={manager?.profile_pic || '/images/default-avatar.png'} 
                                    alt={manager?.name}
                                    className="img-circle elevation-2 mr-2"
                                    style={{width: '32px', height: '32px'}}
                                  />
                                  <div>
                                    <strong>{manager?.name}</strong>
                                    <br />
                                    <small className="text-muted">{manager?.department}</small>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className={`badge badge-${getTypeColor(request.leave_type)}`}>
                                  {request.leave_type}
                                </span>
                              </td>
                              <td>{startDate.toLocaleDateString()}</td>
                              <td>{endDate.toLocaleDateString()}</td>
                              <td>
                                <span className="badge badge-info">{daysDiff} days</span>
                              </td>
                              <td>
                                <small className="text-muted">{request.reason}</small>
                              </td>
                              <td>
                                <span className={`badge badge-${getStatusColor(request.status)}`}>
                                  {request.status}
                                </span>
                              </td>
                              <td>
                                {request.status === 'pending' && (
                                  <div className="btn-group btn-group-sm">
                                    <button 
                                      className="btn btn-success btn-sm"
                                      onClick={() => handleStatusChange(request.id, 'approved')}
                                    >
                                      <i className="fas fa-check"></i>
                                    </button>
                                    <button 
                                      className="btn btn-danger btn-sm"
                                      onClick={() => handleStatusChange(request.id, 'rejected')}
                                    >
                                      <i className="fas fa-times"></i>
                                    </button>
                                  </div>
                                )}
                                {request.status !== 'pending' && (
                                  <span className="text-muted">Processed</span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Grid */}
                <div className="mobile-grid">
                  <div className="job-card-grid">
                    {filteredLeaveRequests.map(request => {
                      const manager = managers.find(mgr => mgr.id === request.employee_id)
                      const startDate = new Date(request.start_date)
                      const endDate = new Date(request.end_date)
                      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
                      
                      return (
                        <div key={request.id} className="job-card">
                          <div className="job-card-header">
                            <div>
                              <h5 className="job-card-title">{manager?.name}</h5>
                              <div className="job-card-number">{manager?.department}</div>
                            </div>
                            <div>
                              <span className={`badge badge-${getTypeColor(request.leave_type)} mr-1`}>
                                {request.leave_type}
                              </span>
                              <span className={`badge badge-${getStatusColor(request.status)}`}>
                                {request.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="job-card-meta">
                            <div className="meta-item">
                              <div className="meta-label">Start Date</div>
                              <div className="meta-value">{startDate.toLocaleDateString()}</div>
                            </div>
                            <div className="meta-item">
                              <div className="meta-label">End Date</div>
                              <div className="meta-value">{endDate.toLocaleDateString()}</div>
                            </div>
                            <div className="meta-item">
                              <div className="meta-label">Duration</div>
                              <div className="meta-value">
                                <span className="badge badge-info">{daysDiff} days</span>
                              </div>
                            </div>
                            <div className="meta-item">
                              <div className="meta-label">Reason</div>
                              <div className="meta-value">{request.reason}</div>
                            </div>
                          </div>
                          
                          <div className="job-card-actions">
                            {request.status === 'pending' && (
                              <div className="btn-group">
                                <button 
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleStatusChange(request.id, 'approved')}
                                >
                                  <i className="fas fa-check mr-1"></i>
                                  Approve
                                </button>
                                <button 
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleStatusChange(request.id, 'rejected')}
                                >
                                  <i className="fas fa-times mr-1"></i>
                                  Reject
                                </button>
                              </div>
                            )}
                            {request.status !== 'pending' && (
                              <span className="text-muted">Already processed</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {filteredLeaveRequests.length === 0 && (
                  <div className="text-center py-4">
                    <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No leave requests found</h5>
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

export default CeoManagerLeave
