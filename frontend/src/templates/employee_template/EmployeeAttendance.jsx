import React, { useState } from 'react'
import { Card, Row, Col, Table, Badge, Button, Alert } from 'react-bootstrap'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { toast } from 'react-toastify'

const EmployeeAttendance = () => {
  const [selectedMonth, setSelectedMonth] = useState('2024-01')

  // Mock attendance data
  const attendanceData = [
    { date: '2024-01-01', checkIn: '09:00', checkOut: '18:00', status: 'present', hours: 9 },
    { date: '2024-01-02', checkIn: '08:45', checkOut: '17:30', status: 'present', hours: 8.75 },
    { date: '2024-01-03', checkIn: '09:15', checkOut: '18:15', status: 'present', hours: 9 },
    { date: '2024-01-04', checkIn: '-', checkOut: '-', status: 'absent', hours: 0 },
    { date: '2024-01-05', checkIn: '09:00', checkOut: '18:00', status: 'present', hours: 9 },
    { date: '2024-01-06', checkIn: '08:30', checkOut: '17:45', status: 'present', hours: 9.25 },
    { date: '2024-01-07', checkIn: '09:00', checkOut: '18:00', status: 'present', hours: 9 },
    { date: '2024-01-08', checkIn: '09:00', checkOut: '18:00', status: 'present', hours: 9 },
    { date: '2024-01-09', checkIn: '08:45', checkOut: '17:30', status: 'present', hours: 8.75 },
    { date: '2024-01-10', checkIn: '09:15', checkOut: '18:15', status: 'present', hours: 9 }
  ]

  const monthlyStats = {
    totalDays: 22,
    presentDays: 20,
    absentDays: 2,
    lateArrivals: 3,
    earlyDepartures: 1,
    averageHours: 8.8,
    totalHours: 176
  }

  const weeklyTrend = [
    { week: 'Week 1', hours: 45 },
    { week: 'Week 2', hours: 42 },
    { week: 'Week 3', hours: 38 },
    { week: 'Week 4', hours: 40 }
  ]

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

  const handleRequestCorrection = (date) => {
    toast.info(`Correction request submitted for ${date}`)
  }

  const handleDownloadReport = () => {
    toast.info('Generating attendance report...')
    setTimeout(() => {
      toast.success('Report downloaded successfully!')
    }, 2000)
  }

  return (
    <div>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Attendance Records</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="#">Employee</a></li>
                <li className="breadcrumb-item active">Attendance</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          {/* Summary Cards */}
          <Row className="mb-4">
            <Col lg={3} md={6}>
              <Card className="bg-success text-white">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4>{monthlyStats.presentDays}</h4>
                      <p className="mb-0">Present Days</p>
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
                      <h4>{monthlyStats.absentDays}</h4>
                      <p className="mb-0">Absent Days</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-times-circle fa-2x"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={3} md={6}>
              <Card className="bg-warning text-white">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4>{monthlyStats.lateArrivals}</h4>
                      <p className="mb-0">Late Arrivals</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-clock fa-2x"></i>
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
                      <h4>{monthlyStats.totalHours}</h4>
                      <p className="mb-0">Total Hours</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-hourglass-half fa-2x"></i>
                    </div>
                  </div>
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
                    Weekly Hours Trend
                  </h3>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weeklyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="hours" stroke="#007bff" strokeWidth={2} />
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
                    Attendance Summary
                  </h3>
                </Card.Header>
                <Card.Body>
                  <div className="text-center">
                    <h2 className="text-success">{monthlyStats.presentDays}</h2>
                    <p>Present Days</p>
                    <hr />
                    <h2 className="text-danger">{monthlyStats.absentDays}</h2>
                    <p>Absent Days</p>
                    <hr />
                    <h2 className="text-primary">{monthlyStats.averageHours}</h2>
                    <p>Average Hours/Day</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Attendance Table */}
          <Row>
            <Col lg={12}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-table mr-2"></i>
                    Daily Attendance Records
                  </h3>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <Button variant="success" className="mr-2" onClick={handleDownloadReport}>
                      <i className="fas fa-download mr-1"></i>
                      Download Report
                    </Button>
                    <Button variant="info">
                      <i className="fas fa-calendar mr-1"></i>
                      Request Correction
                    </Button>
                  </div>
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Hours Worked</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceData.map((record, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{new Date(record.date).toLocaleDateString()}</strong>
                          </td>
                          <td>{record.checkIn}</td>
                          <td>{record.checkOut}</td>
                          <td>{record.hours} hours</td>
                          <td>{getStatusBadge(record.status)}</td>
                          <td>
                            {record.status === 'absent' && (
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => handleRequestCorrection(record.date)}
                              >
                                <i className="fas fa-edit mr-1"></i>
                                Request Correction
                              </Button>
                            )}
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

export default EmployeeAttendance
