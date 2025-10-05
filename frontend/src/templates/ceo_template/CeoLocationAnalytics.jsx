import React, { useState } from 'react'
import { useMockDataStore } from '../../store/mockDataStore'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

const CeoLocationAnalytics = () => {
  const { locations, employees, attendance } = useMockDataStore()
  const [timeRange, setTimeRange] = useState('week')
  const [selectedEmployee, setSelectedEmployee] = useState('all')

  // Filter data based on time range
  const getFilteredLocations = () => {
    const now = new Date()
    const filterDate = new Date()
    
    switch (timeRange) {
      case 'today':
        filterDate.setDate(now.getDate() - 1)
        break
      case 'week':
        filterDate.setDate(now.getDate() - 7)
        break
      case 'month':
        filterDate.setMonth(now.getMonth() - 1)
        break
      default:
        filterDate.setDate(now.getDate() - 7)
    }
    
    return locations.filter(loc => new Date(loc.timestamp) >= filterDate)
  }

  const filteredLocations = getFilteredLocations()

  // Calculate analytics
  const totalLocations = filteredLocations.length
  const uniqueEmployees = [...new Set(filteredLocations.map(loc => loc.employee_id))].length
  const avgSpeed = filteredLocations.reduce((sum, loc) => sum + (loc.speed || 0), 0) / totalLocations

  // Location distribution by hour
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const count = filteredLocations.filter(loc => {
      const locHour = new Date(loc.timestamp).getHours()
      return locHour === hour
    }).length
    return { hour: `${hour}:00`, count }
  })

  // Employee movement patterns
  const employeeMovement = employees.map(employee => {
    const empLocations = filteredLocations.filter(loc => loc.employee_id === employee.id)
    const totalDistance = empLocations.reduce((total, loc, index) => {
      if (index === 0) return 0
      const prevLoc = empLocations[index - 1]
      const distance = calculateDistance(prevLoc.lat, prevLoc.lng, loc.lat, loc.lng)
      return total + distance
    }, 0)
    
    return {
      name: employee.name,
      locations: empLocations.length,
      distance: Math.round(totalDistance * 100) / 100,
      avgSpeed: empLocations.length > 0 ? 
        Math.round((totalDistance / empLocations.length) * 100) / 100 : 0
    }
  })

  // Location status distribution
  const statusData = [
    { name: 'Active', value: filteredLocations.filter(loc => loc.status === 'active').length, color: '#28a745' },
    { name: 'Idle', value: filteredLocations.filter(loc => loc.status === 'idle').length, color: '#ffc107' },
    { name: 'Offline', value: filteredLocations.filter(loc => loc.status === 'offline').length, color: '#dc3545' }
  ]

  // Calculate distance between two points
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371 // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  return (
    <div className="content">
      <div className="container-fluid">
        {/* Statistics Cards */}
        <div className="row">
          <div className="col-lg-3 col-6">
            <div className="small-box bg-info">
              <div className="inner">
                <h3>{totalLocations}</h3>
                <p>Location Records</p>
              </div>
              <div className="icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-6">
            <div className="small-box bg-success">
              <div className="inner">
                <h3>{uniqueEmployees}</h3>
                <p>Active Employees</p>
              </div>
              <div className="icon">
                <i className="fas fa-users"></i>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-6">
            <div className="small-box bg-warning">
              <div className="inner">
                <h3>{avgSpeed.toFixed(1)}</h3>
                <p>Avg Speed (km/h)</p>
              </div>
              <div className="icon">
                <i className="fas fa-tachometer-alt"></i>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-6">
            <div className="small-box bg-danger">
              <div className="inner">
                <h3>{Math.round(totalLocations / uniqueEmployees)}</h3>
                <p>Avg Records/Employee</p>
              </div>
              <div className="icon">
                <i className="fas fa-chart-line"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Time Range Filter */}
        <div className="row mb-3">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Analytics Filters</h3>
                <div className="card-tools">
                  <div className="btn-group">
                    <button 
                      className={`btn ${timeRange === 'today' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setTimeRange('today')}
                    >
                      Today
                    </button>
                    <button 
                      className={`btn ${timeRange === 'week' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setTimeRange('week')}
                    >
                      Week
                    </button>
                    <button 
                      className={`btn ${timeRange === 'month' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setTimeRange('month')}
                    >
                      Month
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Location Activity by Hour</h3>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Location Status Distribution</h3>
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
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Employee Movement Analysis</h3>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={employeeMovement}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="locations" fill="#8884d8" name="Location Records" />
                    <Bar dataKey="distance" fill="#82ca9d" name="Distance (km)" />
                    <Bar dataKey="avgSpeed" fill="#ffc658" name="Avg Speed (km/h)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analytics Table */}
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Detailed Employee Analytics</h3>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-bordered table-striped">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Location Records</th>
                        <th>Total Distance</th>
                        <th>Avg Speed</th>
                        <th>Last Location</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeeMovement.map(employee => {
                        const empData = employees.find(emp => emp.name === employee.name)
                        const lastLocation = filteredLocations
                          .filter(loc => loc.employee_id === empData?.id)
                          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
                        
                        return (
                          <tr key={employee.name}>
                            <td>
                              <div className="d-flex align-items-center">
                                <img 
                                  src={empData?.profile_pic || '/images/default-avatar.png'} 
                                  alt={employee.name}
                                  className="img-circle elevation-2 mr-2"
                                  style={{width: '32px', height: '32px'}}
                                />
                                <strong>{employee.name}</strong>
                              </div>
                            </td>
                            <td>{empData?.department}</td>
                            <td>
                              <span className="badge badge-info">{employee.locations}</span>
                            </td>
                            <td>{employee.distance} km</td>
                            <td>{employee.avgSpeed} km/h</td>
                            <td>
                              {lastLocation ? 
                                `${lastLocation.lat.toFixed(4)}, ${lastLocation.lng.toFixed(4)}` : 
                                'No data'
                              }
                            </td>
                            <td>
                              <span className={`badge badge-${lastLocation?.status === 'active' ? 'success' : 'warning'}`}>
                                {lastLocation?.status || 'Unknown'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CeoLocationAnalytics
