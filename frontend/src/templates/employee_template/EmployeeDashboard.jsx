import React, { useState } from 'react'
import { Card, Row, Col, Table, Badge, Button, ProgressBar, Alert, Modal } from 'react-bootstrap'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const EmployeeDashboard = () => {
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString())
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [recentTasks, setRecentTasks] = useState([
    { id: 1, title: 'Complete project documentation', status: 'completed', priority: 'high', dueDate: '2024-01-15', description: 'Complete the project documentation including API documentation, user manual, and technical specifications.' },
    { id: 2, title: 'Client meeting preparation', status: 'in_progress', priority: 'medium', dueDate: '2024-01-16', description: 'Prepare presentation materials and agenda for the upcoming client meeting.' },
    { id: 3, title: 'Code review for module A', status: 'pending', priority: 'low', dueDate: '2024-01-17', description: 'Review the code for module A and provide feedback on code quality and best practices.' },
    { id: 4, title: 'Update user manual', status: 'completed', priority: 'medium', dueDate: '2024-01-14', description: 'Update the user manual with new features and improvements.' },
    { id: 5, title: 'Bug fixes for login system', status: 'in_progress', priority: 'high', dueDate: '2024-01-16', description: 'Fix critical bugs in the login system including authentication and session management issues.' }
  ])

  // Update time every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Mock data for charts
  const attendanceData = [
    { name: 'Mon', present: 1, absent: 0 },
    { name: 'Tue', present: 1, absent: 0 },
    { name: 'Wed', present: 1, absent: 0 },
    { name: 'Thu', present: 0, absent: 1 },
    { name: 'Fri', present: 1, absent: 0 },
    { name: 'Sat', present: 1, absent: 0 },
    { name: 'Sun', present: 0, absent: 0 }
  ]

  const taskProgressData = [
    { name: 'Completed', value: 8, color: '#28a745' },
    { name: 'In Progress', value: 3, color: '#ffc107' },
    { name: 'Pending', value: 2, color: '#dc3545' }
  ]

  // Mock employee data
  const employeeStats = {
    totalTasks: 13,
    completedTasks: 8,
    pendingTasks: 2,
    inProgressTasks: 3,
    attendanceRate: 85.7,
    currentLocation: 'Office Building A',
    checkInTime: '09:00 AM',
    workHours: 7.5,
    overtimeHours: 1.5
  }

  const notifications = [
    { id: 1, message: 'New task assigned: Client presentation', time: '2 hours ago', type: 'info' },
    { id: 2, message: 'Salary credited to your account', time: '1 day ago', type: 'success' },
    { id: 3, message: 'Leave request approved', time: '2 days ago', type: 'success' },
    { id: 4, message: 'Team meeting at 3:00 PM', time: '3 hours ago', type: 'warning' }
  ]

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge bg="success">Completed</Badge>
      case 'in_progress':
        return <Badge bg="warning">In Progress</Badge>
      case 'pending':
        return <Badge bg="danger">Pending</Badge>
      default:
        return <Badge bg="secondary">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <Badge bg="danger">High</Badge>
      case 'medium':
        return <Badge bg="warning">Medium</Badge>
      case 'low':
        return <Badge bg="info">Low</Badge>
      default:
        return <Badge bg="secondary">{priority}</Badge>
    }
  }

  const handleCheckIn = () => {
    toast.success('Checked in successfully!')
  }

  const handleCheckOut = () => {
    toast.success('Checked out successfully!')
  }

  const handleViewTask = (task) => {
    setSelectedTask(task)
    setShowTaskModal(true)
  }

  const handleMarkComplete = (task) => {
    // Update the task status in the state
    setRecentTasks(prevTasks => 
      prevTasks.map(t => 
        t.id === task.id ? { ...t, status: 'completed' } : t
      )
    )
    toast.success(`Task "${task.title}" marked as complete!`)
  }

  const handleUpdateLocation = () => {
    toast.info('Redirecting to Update Location...')
    setTimeout(() => {
      navigate('/employee/live-location')
    }, 1000)
  }

  const handleApplyLeave = () => {
    toast.info('Redirecting to Apply Leave...')
    setTimeout(() => {
      navigate('/employee/apply-leave')
    }, 1000)
  }

  return (
    <div>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Employee Dashboard</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="#">Employee</a></li>
                <li className="breadcrumb-item active">Dashboard</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          {/* Welcome Message */}
          <Row className="mb-4">
            <Col lg={12}>
              <Alert variant="info" className="mb-0">
                <h4 className="alert-heading">
                  <i className="fas fa-user mr-2"></i>
                  Welcome back, John Doe!
                </h4>
                <p className="mb-0">
                  Current time: <strong>{currentTime}</strong> | 
                  Location: <strong>{employeeStats.currentLocation}</strong> | 
                  Check-in: <strong>{employeeStats.checkInTime}</strong>
                </p>
              </Alert>
            </Col>
          </Row>

          {/* Statistics Cards */}
          <Row className="mb-4">
            <Col lg={3} md={6}>
              <Card className="bg-primary text-white">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4>{employeeStats.totalTasks}</h4>
                      <p className="mb-0">Total Tasks</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-tasks fa-2x"></i>
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
                      <h4>{employeeStats.completedTasks}</h4>
                      <p className="mb-0">Completed</p>
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
                      <h4>{employeeStats.inProgressTasks}</h4>
                      <p className="mb-0">In Progress</p>
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
                      <h4>{employeeStats.attendanceRate}%</h4>
                      <p className="mb-0">Attendance Rate</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-calendar-check fa-2x"></i>
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
                      <Button variant="success" size="lg" block onClick={handleCheckIn}>
                        <i className="fas fa-sign-in-alt mr-2"></i>
                        Check In
                      </Button>
                    </Col>
                    <Col md={3}>
                      <Button variant="danger" size="lg" block onClick={handleCheckOut}>
                        <i className="fas fa-sign-out-alt mr-2"></i>
                        Check Out
                      </Button>
                    </Col>
                    <Col md={3}>
                      <Button variant="primary" size="lg" block onClick={handleUpdateLocation}>
                        <i className="fas fa-map-marker-alt mr-2"></i>
                        Update Location
                      </Button>
                    </Col>
                    <Col md={3}>
                      <Button variant="info" size="lg" block onClick={handleApplyLeave}>
                        <i className="fas fa-calendar-plus mr-2"></i>
                        Apply Leave
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Charts Row */}
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
                    <LineChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="present" stroke="#28a745" strokeWidth={2} name="Present" />
                      <Line type="monotone" dataKey="absent" stroke="#dc3545" strokeWidth={2} name="Absent" />
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
                    Task Progress
                  </h3>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={taskProgressData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {taskProgressData.map((entry, index) => (
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

          {/* Recent Tasks and Notifications */}
          <Row>
            <Col lg={8}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-tasks mr-2"></i>
                    Recent Tasks
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Due Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTasks.map((task) => (
                        <tr key={task.id}>
                          <td>
                            <strong>{task.title}</strong>
                          </td>
                          <td>{getStatusBadge(task.status)}</td>
                          <td>{getPriorityBadge(task.priority)}</td>
                          <td>{task.dueDate}</td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="mr-1"
                              onClick={() => handleViewTask(task)}
                            >
                              <i className="fas fa-eye"></i>
                            </Button>
                            {task.status !== 'completed' && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleMarkComplete(task)}
                              >
                                <i className="fas fa-check"></i>
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
            <Col lg={4}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-bell mr-2"></i>
                    Recent Notifications
                  </h3>
                </Card.Header>
                <Card.Body>
                  <div className="timeline">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="time-label">
                        <span className={`bg-${notification.type}`}>
                          {notification.time}
                        </span>
                      </div>
                    ))}
                    {notifications.map((notification) => (
                      <div key={notification.id}>
                        <i className={`fas fa-bell bg-${notification.type}`}></i>
                        <div className="timeline-item">
                          <span className="time">
                            <i className="fas fa-clock"></i> {notification.time}
                          </span>
                          <h3 className="timeline-header">
                            {notification.message}
                          </h3>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Work Hours Progress */}
          <Row className="mt-4">
            <Col lg={12}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-clock mr-2"></i>
                    Today's Work Progress
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <h5>Regular Hours: {employeeStats.workHours} / 8 hours</h5>
                      <ProgressBar 
                        now={(employeeStats.workHours / 8) * 100} 
                        variant="success" 
                        className="mb-2"
                      />
                    </Col>
                    <Col md={6}>
                      <h5>Overtime Hours: {employeeStats.overtimeHours} hours</h5>
                      <ProgressBar 
                        now={(employeeStats.overtimeHours / 4) * 100} 
                        variant="warning" 
                        className="mb-2"
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Task Details Modal */}
      <Modal show={showTaskModal} onHide={() => setShowTaskModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-tasks mr-2"></i>
            {selectedTask?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTask && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Status:</strong> {getStatusBadge(selectedTask.status)}
                </Col>
                <Col md={6}>
                  <strong>Priority:</strong> {getPriorityBadge(selectedTask.priority)}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Due Date:</strong> {selectedTask.dueDate}
                </Col>
                <Col md={6}>
                  <strong>Task ID:</strong> #{selectedTask.id}
                </Col>
              </Row>
              <div className="mb-3">
                <strong>Description:</strong>
                <p className="mt-2">{selectedTask.description}</p>
              </div>
              <div className="mb-3">
                <strong>Progress:</strong>
                <div className="mt-2">
                  <ProgressBar 
                    now={selectedTask.status === 'completed' ? 100 : selectedTask.status === 'in_progress' ? 60 : 0} 
                    variant={selectedTask.status === 'completed' ? 'success' : selectedTask.status === 'in_progress' ? 'warning' : 'danger'}
                    className="mb-2"
                  />
                  <small className="text-muted">
                    {selectedTask.status === 'completed' ? '100% Complete' : 
                     selectedTask.status === 'in_progress' ? '60% In Progress' : 
                     '0% Not Started'}
                  </small>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTaskModal(false)}>
            Close
          </Button>
          {selectedTask && selectedTask.status !== 'completed' && (
            <Button variant="success" onClick={() => {
              handleMarkComplete(selectedTask)
              setShowTaskModal(false)
            }}>
              <i className="fas fa-check mr-1"></i>
              Mark as Complete
            </Button>
          )}
          <Button variant="primary" onClick={() => {
            setShowTaskModal(false)
            navigate('/employee/job-cards')
          }}>
            <i className="fas fa-external-link-alt mr-1"></i>
            View in Job Cards
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default EmployeeDashboard
