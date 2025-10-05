import React, { useState } from 'react'
import { Card, Row, Col, Table, Badge, Button, Form } from 'react-bootstrap'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { toast } from 'react-toastify'

const ManagerAttendanceReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [selectedEmployee, setSelectedEmployee] = useState('all')

  // Mock attendance data
  const attendanceData = [
    {
      id: 1,
      employee_name: 'John Doe',
      date: '2024-01-15',
      check_in: '09:00 AM',
      check_out: '05:30 PM',
      hours_worked: 8.5,
      status: 'present',
      location: 'Office Building A'
    },
    {
      id: 2,
      employee_name: 'Jane Smith',
      date: '2024-01-15',
      check_in: '08:45 AM',
      check_out: '05:15 PM',
      hours_worked: 8.5,
      status: 'present',
      location: 'Client Site B'
    },
    {
      id: 3,
      employee_name: 'Mike Johnson',
      date: '2024-01-15',
      check_in: '09:15 AM',
      check_out: '05:45 PM',
      hours_worked: 8.5,
      status: 'present',
      location: 'Office Building A'
    },
    {
      id: 4,
      employee_name: 'Sarah Wilson',
      date: '2024-01-15',
      check_in: '08:30 AM',
      check_out: '05:00 PM',
      hours_worked: 8.5,
      status: 'present',
      location: 'Client Site C'
    }
  ]

  // Mock chart data
  const weeklyData = [
    { day: 'Mon', present: 4, absent: 0, late: 0 },
    { day: 'Tue', present: 4, absent: 0, late: 1 },
    { day: 'Wed', present: 3, absent: 1, late: 0 },
    { day: 'Thu', present: 4, absent: 0, late: 0 },
    { day: 'Fri', present: 4, absent: 0, late: 0 }
  ]

  const employeeData = [
    { name: 'John Doe', attendance: 95 },
    { name: 'Jane Smith', attendance: 98 },
    { name: 'Mike Johnson', attendance: 92 },
    { name: 'Sarah Wilson', attendance: 100 }
  ]

  const statusData = [
    { name: 'Present', value: 18, color: '#28a745' },
    { name: 'Absent', value: 1, color: '#dc3545' },
    { name: 'Late', value: 1, color: '#ffc107' }
  ]

  const filteredData = attendanceData.filter(record => {
    if (selectedEmployee !== 'all' && record.employee_name !== selectedEmployee) {
      return false
    }
    return true
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'present':
        return <Badge bg="success">Present</Badge>
      case 'absent':
        return <Badge bg="danger">Absent</Badge>
      case 'late':
        return <Badge bg="warning">Late</Badge>
      default:
        return <Badge bg="secondary">{status}</Badge>
    }
  }

  const calculateStats = () => {
    const total = filteredData.length
    const present = filteredData.filter(record => record.status === 'present').length
    const absent = filteredData.filter(record => record.status === 'absent').length
    const late = filteredData.filter(record => record.status === 'late').length
    const avgHours = filteredData.reduce((sum, record) => sum + record.hours_worked, 0) / total

    return { total, present, absent, late, avgHours }
  }

  const stats = calculateStats()

  return (
    <div>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">GPS Reports</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="#">Manager</a></li>
                <li className="breadcrumb-item active">GPS Reports</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          {/* Statistics Cards */}
          <Row className="mb-4">
            <Col lg={3} md={6}>
              <Card className="bg-primary text-white">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4>{stats.total}</h4>
                      <p className="mb-0">Total Records</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-list fa-2x"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={3} md={6}>
              <Card className="bg-success text-white">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4>{stats.present}</h4>
                      <p className="mb-0">Present</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-check-circle fa-2x"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={3} md={6}>
              <Card className="bg-danger text-white">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4>{stats.absent}</h4>
                      <p className="mb-0">Absent</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-times-circle fa-2x"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={3} md={6}>
              <Card className="bg-info text-white">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4>{stats.avgHours.toFixed(1)}h</h4>
                      <p className="mb-0">Avg Hours</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-clock fa-2x"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Filters */}
          <Row className="mb-4">
            <Col lg={12}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-filter mr-2"></i>
                    Report Filters
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Period</Form.Label>
                        <Form.Select
                          value={selectedPeriod}
                          onChange={(e) => setSelectedPeriod(e.target.value)}
                        >
                          <option value="week">This Week</option>
                          <option value="month">This Month</option>
                          <option value="quarter">This Quarter</option>
                          <option value="year">This Year</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Employee</Form.Label>
                        <Form.Select
                          value={selectedEmployee}
                          onChange={(e) => setSelectedEmployee(e.target.value)}
                        >
                          <option value="all">All Employees</option>
                          {attendanceData.map(record => (
                            <option key={record.id} value={record.employee_name}>
                              {record.employee_name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6} className="d-flex align-items-end">
                      <Button variant="primary" className="mr-2">
                        <i className="fas fa-sync mr-1"></i>
                        Refresh
                      </Button>
                      <Button variant="success" className="mr-2">
                        <i className="fas fa-download mr-1"></i>
                        Export PDF
                      </Button>
                      <Button variant="info">
                        <i className="fas fa-file-excel mr-1"></i>
                        Export Excel
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Charts */}
          <Row className="mb-4">
            <Col lg={8}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-chart-line mr-2"></i>
                    Weekly Attendance Trend
                  </h3>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="present" stroke="#28a745" strokeWidth={2} />
                      <Line type="monotone" dataKey="absent" stroke="#dc3545" strokeWidth={2} />
                      <Line type="monotone" dataKey="late" stroke="#ffc107" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-chart-pie mr-2"></i>
                    Attendance Status
                  </h3>
                </Card.Header>
                <Card.Body>
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
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Employee Performance */}
          <Row className="mb-4">
            <Col lg={12}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-chart-bar mr-2"></i>
                    Employee Attendance Performance
                  </h3>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={employeeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="attendance" fill="#007bff" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Detailed Table */}
          <Row>
            <Col lg={12}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-table mr-2"></i>
                    Detailed Attendance Records
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Date</th>
                        <th>Check-in</th>
                        <th>Check-out</th>
                        <th>Hours Worked</th>
                        <th>Status</th>
                        <th>Location</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((record) => (
                        <tr key={record.id}>
                          <td>{record.employee_name}</td>
                          <td>{record.date}</td>
                          <td>{record.check_in}</td>
                          <td>{record.check_out}</td>
                          <td>{record.hours_worked}h</td>
                          <td>{getStatusBadge(record.status)}</td>
                          <td>{record.location}</td>
                          <td>
                            <Button variant="outline-primary" size="sm">
                              <i className="fas fa-eye"></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  )
}

export default ManagerAttendanceReports
