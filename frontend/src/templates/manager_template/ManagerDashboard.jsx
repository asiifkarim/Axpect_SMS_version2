import React, { useState } from 'react'
import { Card, Row, Col, Form, Button, Alert } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const ManagerDashboard = () => {
  const navigate = useNavigate()
  const [stats] = useState({
    totalEmployees: 12,
    presentToday: 10,
    pendingLeaves: 3,
    activeProjects: 8
  })

  const handleTakeAttendance = () => {
    toast.info('Redirecting to Take Attendance...')
    setTimeout(() => {
      navigate('/manager/take-attendance')
    }, 1000)
  }

  const handleAddSalary = () => {
    toast.info('Redirecting to Add Salary...')
    setTimeout(() => {
      navigate('/manager/add-salary')
    }, 1000)
  }

  const handleViewGpsDashboard = () => {
    toast.info('Redirecting to GPS Dashboard...')
    setTimeout(() => {
      navigate('/manager/gps-dashboard')
    }, 1000)
  }

  const handleViewNotifications = () => {
    toast.info('Redirecting to Notifications...')
    setTimeout(() => {
      navigate('/manager/notifications')
    }, 1000)
  }

  return (
    <div>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Manager Dashboard</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="#">Manager</a></li>
                <li className="breadcrumb-item active">Dashboard</li>
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
                      <h4>{stats.totalEmployees}</h4>
                      <p className="mb-0">Total Employees</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-users fa-2x"></i>
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
                      <h4>{stats.presentToday}</h4>
                      <p className="mb-0">Present Today</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-check-circle fa-2x"></i>
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
                      <h4>{stats.pendingLeaves}</h4>
                      <p className="mb-0">Pending Leaves</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-calendar-minus fa-2x"></i>
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
                      <h4>{stats.activeProjects}</h4>
                      <p className="mb-0">Active Projects</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-project-diagram fa-2x"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Quick Actions */}
          <Row className="mb-4">
            <Col lg={12}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-bolt mr-2"></i>
                    Quick Actions
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={3}>
                      <Button variant="primary" className="w-100 mb-2" onClick={handleTakeAttendance}>
                        <i className="fas fa-calendar-check mr-2"></i>
                        Take Attendance
                      </Button>
                    </Col>
                    <Col md={3}>
                      <Button variant="success" className="w-100 mb-2" onClick={handleAddSalary}>
                        <i className="fas fa-dollar-sign mr-2"></i>
                        Add Salary
                      </Button>
                    </Col>
                    <Col md={3}>
                      <Button variant="info" className="w-100 mb-2" onClick={handleViewGpsDashboard}>
                        <i className="fas fa-map-marker-alt mr-2"></i>
                        View GPS Dashboard
                      </Button>
                    </Col>
                    <Col md={3}>
                      <Button variant="warning" className="w-100 mb-2" onClick={handleViewNotifications}>
                        <i className="fas fa-bell mr-2"></i>
                        View Notifications
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Recent Activity */}
          <Row>
            <Col lg={8}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-history mr-2"></i>
                    Recent Activity
                  </h3>
                </Card.Header>
                <Card.Body>
                  <div className="timeline">
                    <div className="time-label">
                      <span className="bg-red">Today</span>
                    </div>
                    <div>
                      <i className="fas fa-user bg-blue"></i>
                      <div className="timeline-item">
                        <span className="time"><i className="fas fa-clock"></i> 12:05</span>
                        <h3 className="timeline-header">John Doe submitted leave request</h3>
                        <div className="timeline-body">
                          Request for 2 days starting from tomorrow
                        </div>
                      </div>
                    </div>
                    <div>
                      <i className="fas fa-clock bg-green"></i>
                      <div className="timeline-item">
                        <span className="time"><i className="fas fa-clock"></i> 10:30</span>
                        <h3 className="timeline-header">Mike Johnson checked in</h3>
                        <div className="timeline-body">
                          Checked in at Office Building A
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-chart-pie mr-2"></i>
                    Team Overview
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Alert variant="info">
                    <h6>Team Performance</h6>
                    <p className="mb-0">Your team is performing well with 95% attendance rate this month.</p>
                  </Alert>
                  <Alert variant="success">
                    <h6>Project Status</h6>
                    <p className="mb-0">All active projects are on track for completion.</p>
                  </Alert>
                  <Alert variant="warning">
                    <h6>Pending Actions</h6>
                    <p className="mb-0">3 leave requests need your approval.</p>
                  </Alert>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  )
}

export default ManagerDashboard
