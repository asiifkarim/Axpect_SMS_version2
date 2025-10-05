import React, { useState } from 'react'
import { useMockDataStore } from '../../store/mockDataStore'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'

const CeoViewAttendance = () => {
  const { attendance, employees } = useMockDataStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const filteredAttendance = attendance.filter(record => {
    const employee = employees.find(emp => emp.id === record.employee_id)
    const matchesSearch = !searchTerm || 
                         (employee?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          employee?.email.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesDate = !filterDate || record.date === filterDate
    const matchesStatus = !filterStatus || record.status === filterStatus
    return matchesSearch && matchesDate && matchesStatus
  })

  // Calculate statistics
  const totalRecords = attendance.length
  const presentRecords = attendance.filter(record => record.status === 'present').length
  const absentRecords = attendance.filter(record => record.status === 'absent').length
  const averageHours = attendance.reduce((sum, record) => sum + (record.hours_worked || 0), 0) / totalRecords

  // Chart data - attendance by date
  const attendanceByDate = attendance.reduce((acc, record) => {
    const date = record.date
    if (!acc[date]) {
      acc[date] = { date, present: 0, absent: 0 }
    }
    if (record.status === 'present') {
      acc[date].present++
    } else {
      acc[date].absent++
    }
    return acc
  }, {})

  const chartData = Object.values(attendanceByDate).sort((a, b) => new Date(a.date) - new Date(b.date))

  // Employee attendance summary
  const employeeSummary = employees.map(employee => {
    const empAttendance = attendance.filter(record => record.employee_id === employee.id)
    const presentDays = empAttendance.filter(record => record.status === 'present').length
    const totalDays = empAttendance.length
    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0
    
    return {
      id: employee.id,
      name: employee.name,
      department: employee.department,
      presentDays,
      totalDays,
      attendanceRate: Math.round(attendanceRate)
    }
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'success'
      case 'absent': return 'danger'
      case 'late': return 'warning'
      default: return 'secondary'
    }
  }

  const getAttendanceRateColor = (rate) => {
    if (rate >= 90) return 'success'
    if (rate >= 70) return 'warning'
    return 'danger'
  }

  return (
    <div className="content">
      <div className="container-fluid">
        {/* Statistics Cards */}
        <div className="row">
          <div className="col-lg-3 col-6">
            <div className="small-box bg-info">
              <div className="inner">
                <h3>{totalRecords}</h3>
                <p>Total Records</p>
              </div>
              <div className="icon">
                <i className="fas fa-calendar-check"></i>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-6">
            <div className="small-box bg-success">
              <div className="inner">
                <h3>{presentRecords}</h3>
                <p>Present</p>
              </div>
              <div className="icon">
                <i className="fas fa-check-circle"></i>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-6">
            <div className="small-box bg-danger">
              <div className="inner">
                <h3>{absentRecords}</h3>
                <p>Absent</p>
              </div>
              <div className="icon">
                <i className="fas fa-times-circle"></i>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-6">
            <div className="small-box bg-warning">
              <div className="inner">
                <h3>{averageHours.toFixed(1)}</h3>
                <p>Avg Hours/Day</p>
              </div>
              <div className="icon">
                <i className="fas fa-clock"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="row">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Attendance Trend</h3>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="present" stroke="#28a745" name="Present" />
                    <Line type="monotone" dataKey="absent" stroke="#dc3545" name="Absent" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Employee Attendance Rates</h3>
              </div>
              <div className="card-body">
                <div className="list-group">
                  {employeeSummary.slice(0, 5).map(employee => (
                    <div key={employee.id} className="list-group-item">
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{employee.name}</h6>
                        <span className={`badge badge-${getAttendanceRateColor(employee.attendanceRate)}`}>
                          {employee.attendanceRate}%
                        </span>
                      </div>
                      <p className="mb-1 text-muted">{employee.department}</p>
                      <small>{employee.presentDays}/{employee.totalDays} days</small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Records */}
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Attendance Records</h3>
              </div>
              <div className="card-body">
                {/* Filters */}
                <div className="row mb-3">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label htmlFor="search">Search Employee</label>
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
                      <label htmlFor="date">Filter by Date</label>
                      <input
                        type="date"
                        className="form-control"
                        id="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
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
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
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
                          <th>Employee</th>
                          <th>Date</th>
                          <th>Check In</th>
                          <th>Check Out</th>
                          <th>Hours Worked</th>
                          <th>Status</th>
                          <th>Location</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAttendance.map(record => {
                          const employee = employees.find(emp => emp.id === record.employee_id)
                          return (
                            <tr key={record.id}>
                              <td>{record.id}</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <img 
                                    src={employee?.profile_pic || '/images/default-avatar.png'} 
                                    alt={employee?.name}
                                    className="img-circle elevation-2 mr-2"
                                    style={{width: '32px', height: '32px'}}
                                  />
                                  <div>
                                    <strong>{employee?.name}</strong>
                                    <br />
                                    <small className="text-muted">{employee?.department}</small>
                                  </div>
                                </div>
                              </td>
                              <td>{new Date(record.date).toLocaleDateString()}</td>
                              <td>{record.check_in}</td>
                              <td>{record.check_out}</td>
                              <td>
                                <span className="badge badge-info">
                                  {record.hours_worked?.toFixed(1)}h
                                </span>
                              </td>
                              <td>
                                <span className={`badge badge-${getStatusColor(record.status)}`}>
                                  {record.status}
                                </span>
                              </td>
                              <td>
                                {record.location && (
                                  <small className="text-muted">
                                    {record.location.lat.toFixed(4)}, {record.location.lng.toFixed(4)}
                                  </small>
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
                    {filteredAttendance.map(record => {
                      const employee = employees.find(emp => emp.id === record.employee_id)
                      return (
                        <div key={record.id} className="job-card">
                          <div className="job-card-header">
                            <div>
                              <h5 className="job-card-title">{employee?.name}</h5>
                              <div className="job-card-number">{employee?.department}</div>
                            </div>
                            <span className={`badge badge-${getStatusColor(record.status)}`}>
                              {record.status}
                            </span>
                          </div>
                          
                          <div className="job-card-meta">
                            <div className="meta-item">
                              <div className="meta-label">Date</div>
                              <div className="meta-value">{new Date(record.date).toLocaleDateString()}</div>
                            </div>
                            <div className="meta-item">
                              <div className="meta-label">Check In</div>
                              <div className="meta-value">{record.check_in}</div>
                            </div>
                            <div className="meta-item">
                              <div className="meta-label">Check Out</div>
                              <div className="meta-value">{record.check_out}</div>
                            </div>
                            <div className="meta-item">
                              <div className="meta-label">Hours Worked</div>
                              <div className="meta-value">
                                <span className="badge badge-info">
                                  {record.hours_worked?.toFixed(1)}h
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {filteredAttendance.length === 0 && (
                  <div className="text-center py-4">
                    <i className="fas fa-calendar-check fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No attendance records found</h5>
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

export default CeoViewAttendance
