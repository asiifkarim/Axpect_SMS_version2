import React, { useState } from 'react'
import { Card, Row, Col, Table, Badge, Button, Form, Modal, ProgressBar } from 'react-bootstrap'
import { toast } from 'react-toastify'

const EmployeeJobCards = () => {
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [showExtensionModal, setShowExtensionModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [taskProgress, setTaskProgress] = useState({})
  const [newProgress, setNewProgress] = useState(0)
  const [extensionDays, setExtensionDays] = useState(7)
  const [jobCards, setJobCards] = useState([
    {
      id: 1,
      title: 'Website Redesign Project',
      client: 'ABC Corporation',
      assignedBy: 'Jane Smith',
      assignedDate: '2024-01-10',
      dueDate: '2024-01-25',
      priority: 'high',
      status: 'in_progress',
      progress: 65,
      description: 'Complete redesign of the company website with modern UI/UX',
      requirements: ['HTML/CSS', 'JavaScript', 'React', 'Responsive Design'],
      notes: 'Client prefers dark theme with blue accents'
    },
    {
      id: 2,
      title: 'Mobile App Development',
      client: 'XYZ Tech',
      assignedBy: 'Mike Johnson',
      assignedDate: '2024-01-08',
      dueDate: '2024-02-15',
      priority: 'medium',
      status: 'pending',
      progress: 0,
      description: 'Develop a cross-platform mobile application for inventory management',
      requirements: ['React Native', 'Node.js', 'MongoDB', 'API Integration'],
      notes: 'Focus on offline functionality'
    },
    {
      id: 3,
      title: 'Database Optimization',
      client: 'DEF Industries',
      assignedBy: 'Sarah Wilson',
      assignedDate: '2024-01-05',
      dueDate: '2024-01-20',
      priority: 'high',
      status: 'completed',
      progress: 100,
      description: 'Optimize existing database queries and improve performance',
      requirements: ['SQL', 'Database Design', 'Performance Tuning'],
      notes: 'Achieved 40% performance improvement'
    },
    {
      id: 4,
      title: 'API Documentation',
      client: 'GHI Solutions',
      assignedBy: 'Jane Smith',
      assignedDate: '2024-01-12',
      dueDate: '2024-01-30',
      priority: 'low',
      status: 'in_progress',
      progress: 30,
      description: 'Create comprehensive API documentation for existing services',
      requirements: ['Technical Writing', 'API Knowledge', 'Swagger'],
      notes: 'Include code examples for each endpoint'
    }
  ])

  const filteredCards = jobCards.filter(card => {
    if (selectedStatus !== 'all' && card.status !== selectedStatus) {
      return false
    }
    return true
  })

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

  const handleViewTask = (task) => {
    setSelectedTask(task)
    setTaskProgress(prev => ({
      ...prev,
      [task.id]: task.progress
    }))
    setShowTaskModal(true)
  }

  const handleUpdateProgress = (taskId, newProgress) => {
    setTaskProgress(prev => ({
      ...prev,
      [taskId]: newProgress
    }))
  }

  const handleSubmitProgress = () => {
    if (selectedTask) {
      // Prevent updates to completed tasks
      if (selectedTask.status === 'completed') {
        toast.warning('Cannot modify completed tasks')
        return
      }
      
      // Update the actual job card progress in the main state
      setJobCards(prev => prev.map(card => 
        card.id === selectedTask.id 
          ? { ...card, progress: taskProgress[selectedTask.id] || selectedTask.progress }
          : card
      ))
      toast.success(`Progress updated for "${selectedTask.title}"`)
      setShowTaskModal(false)
    }
  }

  const handleMarkComplete = (task) => {
    // Prevent marking already completed tasks as complete
    if (task.status === 'completed') {
      toast.info('Task is already completed')
      return
    }
    
    // Update the task status to completed and set progress to 100%
    setJobCards(prev => prev.map(card => 
      card.id === task.id 
        ? { ...card, status: 'completed', progress: 100 }
        : card
    ))
    toast.success(`Task "${task.title}" marked as complete!`)
  }

  const handleRequestExtension = (task) => {
    // Prevent extension requests for completed tasks
    if (task.status === 'completed') {
      toast.warning('Cannot request extension for completed tasks')
      return
    }
    
    setSelectedTask(task)
    setExtensionDays(7)
    setShowExtensionModal(true)
  }

  const handleSubmitExtension = () => {
    if (selectedTask && extensionDays > 0) {
      const newDueDate = new Date(selectedTask.dueDate)
      newDueDate.setDate(newDueDate.getDate() + extensionDays)
      
      setJobCards(prev => prev.map(card => 
        card.id === selectedTask.id 
          ? { ...card, dueDate: newDueDate.toISOString().split('T')[0] }
          : card
      ))
      toast.success(`Extension request submitted for "${selectedTask.title}". New due date: ${newDueDate.toLocaleDateString()}`)
      setShowExtensionModal(false)
      setSelectedTask(null)
      setExtensionDays(7)
    } else {
      toast.error('Please enter a valid number of days')
    }
  }

  const handleRefresh = () => {
    toast.info('Refreshing tasks...')
    setTimeout(() => {
      toast.success('Tasks refreshed successfully!')
    }, 1000)
  }

  const handleExportTasks = () => {
    toast.info('Generating task report...')
    setTimeout(() => {
      toast.success('Task report downloaded successfully!')
    }, 2000)
  }

  const handleUpdateProgressModal = (task) => {
    // Prevent opening modal for completed tasks
    if (task.status === 'completed') {
      toast.warning('Cannot modify completed tasks')
      return
    }
    
    setSelectedTask(task)
    setNewProgress(task.progress)
    setShowProgressModal(true)
  }

  const handleSaveProgress = () => {
    if (selectedTask) {
      // Prevent updates to completed tasks
      if (selectedTask.status === 'completed') {
        toast.warning('Cannot modify completed tasks')
        return
      }
      
      setJobCards(prev => prev.map(card => 
        card.id === selectedTask.id 
          ? { 
              ...card, 
              progress: newProgress,
              status: newProgress === 100 ? 'completed' : newProgress > 0 ? 'in_progress' : 'pending'
            }
          : card
      ))
      toast.success(`Progress updated to ${newProgress}%`)
      setShowProgressModal(false)
      setSelectedTask(null)
      setNewProgress(0)
    }
  }

  const handleQuickProgressUpdate = (task, increment) => {
    // Prevent updates to completed tasks
    if (task.status === 'completed') {
      toast.warning('Cannot modify completed tasks')
      return
    }
    
    const newProgressValue = Math.max(0, Math.min(100, task.progress + increment))
    setJobCards(prev => prev.map(jobCard => 
      jobCard.id === task.id 
        ? { 
            ...jobCard, 
            progress: newProgressValue,
            status: newProgressValue === 100 ? 'completed' : newProgressValue > 0 ? 'in_progress' : 'pending'
          }
        : jobCard
    ))
    toast.success(`Progress updated to ${newProgressValue}%`)
  }

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'success'
    if (progress >= 75) return 'info'
    if (progress >= 50) return 'warning'
    if (progress >= 25) return 'primary'
    return 'danger'
  }

  const calculateStats = () => {
    const total = jobCards.length
    const completed = jobCards.filter(card => card.status === 'completed').length
    const inProgress = jobCards.filter(card => card.status === 'in_progress').length
    const pending = jobCards.filter(card => card.status === 'pending').length
    const overdue = jobCards.filter(card => 
      card.status !== 'completed' && new Date(card.dueDate) < new Date()
    ).length

    return { total, completed, inProgress, pending, overdue }
  }

  const stats = calculateStats()

  return (
    <div>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">My Job Cards</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="#">Employee</a></li>
                <li className="breadcrumb-item active">Job Cards</li>
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
                      <h4>{stats.completed}</h4>
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
                      <h4>{stats.inProgress}</h4>
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
              <Card className="bg-danger text-white">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4>{stats.overdue}</h4>
                      <p className="mb-0">Overdue</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-exclamation-triangle fa-2x"></i>
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
                    Filter Tasks
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Status</Form.Label>
                        <Form.Select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                          <option value="all">All Status</option>
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4} className="d-flex align-items-end">
                      <Button variant="primary" className="mr-2" onClick={handleRefresh}>
                        <i className="fas fa-sync mr-1"></i>
                        Refresh
                      </Button>
                      <Button variant="success" onClick={handleExportTasks}>
                        <i className="fas fa-download mr-1"></i>
                        Export Tasks
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Job Cards Table */}
          <Row>
            <Col lg={12}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-table mr-2"></i>
                    My Tasks
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Client</th>
                        <th>Assigned By</th>
                        <th>Due Date</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Progress</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCards.map((card) => (
                        <tr key={card.id}>
                          <td>
                            <strong>{card.title}</strong>
                            <br />
                            <small className="text-muted">{card.description}</small>
                          </td>
                          <td>{card.client}</td>
                          <td>{card.assignedBy}</td>
                          <td>
                            {card.dueDate}
                            {card.status !== 'completed' && new Date(card.dueDate) < new Date() && (
                              <Badge bg="danger" className="ml-1">Overdue</Badge>
                            )}
                          </td>
                          <td>{getPriorityBadge(card.priority)}</td>
                          <td>{getStatusBadge(card.status)}</td>
                          <td>
                            <div className="progress progress-sm mb-1" style={{cursor: card.status === 'completed' ? 'default' : 'pointer'}} onClick={() => card.status !== 'completed' && handleUpdateProgressModal(card)} title={card.status === 'completed' ? 'Task completed - no further updates allowed' : 'Click to update progress'}>
                              <div
                                className={`progress-bar bg-${getProgressColor(card.progress)}`}
                                role="progressbar"
                                style={{ width: `${card.progress}%` }}
                                aria-valuenow={card.progress}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              >
                                {card.progress}%
                              </div>
                            </div>
                            {card.status !== 'completed' && (
                              <div className="btn-group btn-group-xs">
                                <button
                                  className="btn btn-outline-success btn-xs"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleQuickProgressUpdate(card, 10)
                                  }}
                                  title="+10%"
                                >
                                  <i className="fas fa-plus"></i>
                                </button>
                                <button
                                  className="btn btn-outline-warning btn-xs"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleQuickProgressUpdate(card, -10)
                                  }}
                                  title="-10%"
                                >
                                  <i className="fas fa-minus"></i>
                                </button>
                              </div>
                            )}
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="mr-1"
                              onClick={() => handleViewTask(card)}
                            >
                              <i className="fas fa-eye"></i>
                            </Button>
                            {card.status !== 'completed' && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                className="mr-1"
                                onClick={() => handleMarkComplete(card)}
                              >
                                <i className="fas fa-check"></i>
                              </Button>
                            )}
                            {card.status !== 'completed' && (
                              <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() => handleRequestExtension(card)}
                              >
                                <i className="fas fa-clock"></i>
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
                  <strong>Client:</strong> {selectedTask.client}
                </Col>
                <Col md={6}>
                  <strong>Assigned By:</strong> {selectedTask.assignedBy}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Due Date:</strong> {selectedTask.dueDate}
                </Col>
                <Col md={6}>
                  <strong>Priority:</strong> {getPriorityBadge(selectedTask.priority)}
                </Col>
              </Row>
              <div className="mb-3">
                <strong>Description:</strong>
                <p className="mt-1">{selectedTask.description}</p>
              </div>
              <div className="mb-3">
                <strong>Requirements:</strong>
                <div className="mt-1">
                  {selectedTask.requirements.map((req, index) => (
                    <Badge key={index} bg="primary" className="me-1 mb-1">
                      {req}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <strong>Notes:</strong>
                <p className="mt-1">{selectedTask.notes}</p>
              </div>
              <div className="mb-3">
                <strong>Update Progress:</strong>
                <div className="mt-2">
                  <Form.Range
                    min="0"
                    max="100"
                    value={taskProgress[selectedTask.id] || selectedTask.progress}
                    onChange={(e) => handleUpdateProgress(selectedTask.id, parseInt(e.target.value))}
                    className="mb-2"
                    disabled={selectedTask.status === 'completed'}
                  />
                  <div className="d-flex justify-content-between">
                    <span>0%</span>
                    <span className="fw-bold">{taskProgress[selectedTask.id] || selectedTask.progress}%</span>
                    <span>100%</span>
                  </div>
                  {selectedTask.status === 'completed' && (
                    <small className="text-muted">
                      <i className="fas fa-lock mr-1"></i>
                      Task completed - progress cannot be modified
                    </small>
                  )}
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
            <Button variant="primary" onClick={handleSubmitProgress}>
              Update Progress
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Progress Update Modal */}
      <Modal show={showProgressModal} onHide={() => setShowProgressModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-chart-line mr-2"></i>
            Update Progress - {selectedTask?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTask && (
            <div>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Progress Percentage</Form.Label>
                    <Form.Control
                      type="range"
                      min="0"
                      max="100"
                      value={newProgress}
                      onChange={(e) => setNewProgress(parseInt(e.target.value))}
                      className="mb-2"
                    />
                    <div className="text-center">
                      <h4 className="text-primary">{newProgress}%</h4>
                    </div>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <div className="progress mb-3">
                    <div
                      className={`progress-bar bg-${getProgressColor(newProgress)}`}
                      role="progressbar"
                      style={{ width: `${newProgress}%` }}
                    >
                      {newProgress}%
                    </div>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <div className="btn-group w-100">
                    <Button
                      variant="outline-secondary"
                      onClick={() => setNewProgress(0)}
                    >
                      0%
                    </Button>
                    <Button
                      variant="outline-info"
                      onClick={() => setNewProgress(25)}
                    >
                      25%
                    </Button>
                    <Button
                      variant="outline-primary"
                      onClick={() => setNewProgress(50)}
                    >
                      50%
                    </Button>
                    <Button
                      variant="outline-warning"
                      onClick={() => setNewProgress(75)}
                    >
                      75%
                    </Button>
                    <Button
                      variant="outline-success"
                      onClick={() => setNewProgress(100)}
                    >
                      100%
                    </Button>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProgressModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveProgress}>
            <i className="fas fa-save mr-1"></i>
            Update Progress
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Extension Request Modal */}
      <Modal show={showExtensionModal} onHide={() => setShowExtensionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-calendar-plus mr-2"></i>
            Request Time Extension
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTask && (
            <div>
              <div className="mb-3">
                <strong>Task:</strong> {selectedTask.title}
              </div>
              <div className="mb-3">
                <strong>Current Due Date:</strong> {selectedTask.dueDate}
              </div>
              <Form.Group className="mb-3">
                <Form.Label>Extension Days</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="30"
                  value={extensionDays}
                  onChange={(e) => setExtensionDays(parseInt(e.target.value) || 0)}
                  placeholder="Enter number of days"
                />
                <Form.Text className="text-muted">
                  Maximum 30 days extension allowed
                </Form.Text>
              </Form.Group>
              <div className="mb-3">
                <strong>New Due Date:</strong> 
                <span className="text-primary ml-2">
                  {(() => {
                    const newDate = new Date(selectedTask.dueDate)
                    newDate.setDate(newDate.getDate() + extensionDays)
                    return newDate.toLocaleDateString()
                  })()}
                </span>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowExtensionModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitExtension}>
            <i className="fas fa-calendar-plus mr-1"></i>
            Submit Extension Request
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default EmployeeJobCards
