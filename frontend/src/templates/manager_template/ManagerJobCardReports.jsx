import React, { useState } from 'react'
import { Card, Row, Col, Table, Badge, Button, Form, Modal } from 'react-bootstrap'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { toast } from 'react-toastify'

const ManagerJobCardReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [showViewModal, setShowViewModal] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [selectedJobCard, setSelectedJobCard] = useState(null)
  const [newProgress, setNewProgress] = useState(0)
  const [jobCards, setJobCards] = useState([
    {
      id: 1,
      title: 'Website Development',
      client: 'ABC Company',
      department: 'Engineering',
      assigned_to: 'John Doe',
      status: 'completed',
      priority: 'high',
      created_date: '2024-01-01',
      completed_date: '2024-01-15',
      estimated_hours: 40,
      actual_hours: 45,
      progress: 100
    },
    {
      id: 2,
      title: 'Mobile App Design',
      client: 'XYZ Corp',
      department: 'Design',
      assigned_to: 'Jane Smith',
      status: 'in_progress',
      priority: 'medium',
      created_date: '2024-01-05',
      completed_date: null,
      estimated_hours: 30,
      actual_hours: 20,
      progress: 75
    },
    {
      id: 3,
      title: 'Database Optimization',
      client: 'DEF Ltd',
      department: 'Engineering',
      assigned_to: 'Mike Johnson',
      status: 'pending',
      priority: 'low',
      created_date: '2024-01-10',
      completed_date: null,
      estimated_hours: 20,
      actual_hours: 5,
      progress: 25
    }
  ])

  // Mock chart data
  const weeklyData = [
    { day: 'Mon', completed: 2, in_progress: 3, pending: 1 },
    { day: 'Tue', completed: 3, in_progress: 2, pending: 2 },
    { day: 'Wed', completed: 1, in_progress: 4, pending: 1 },
    { day: 'Thu', completed: 4, in_progress: 1, pending: 2 },
    { day: 'Fri', completed: 2, in_progress: 3, pending: 1 }
  ]

  const departmentData = [
    { name: 'Engineering', completed: 8, in_progress: 3, pending: 2 },
    { name: 'Design', completed: 5, in_progress: 2, pending: 1 },
    { name: 'Sales', completed: 3, in_progress: 1, pending: 0 },
    { name: 'Marketing', completed: 2, in_progress: 1, pending: 1 }
  ]

  const statusData = [
    { name: 'Completed', value: 18, color: '#28a745' },
    { name: 'In Progress', value: 7, color: '#007bff' },
    { name: 'Pending', value: 4, color: '#ffc107' }
  ]

  const filteredData = jobCards.filter(card => {
    if (selectedDepartment !== 'all' && card.department !== selectedDepartment) {
      return false
    }
    return true
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge bg="success">Completed</Badge>
      case 'in_progress':
        return <Badge bg="primary">In Progress</Badge>
      case 'pending':
        return <Badge bg="warning">Pending</Badge>
      default:
        return <Badge bg="secondary">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return <Badge bg="danger">Urgent</Badge>
      case 'high':
        return <Badge bg="warning">High</Badge>
      case 'medium':
        return <Badge bg="info">Medium</Badge>
      case 'low':
        return <Badge bg="success">Low</Badge>
      default:
        return <Badge bg="secondary">{priority}</Badge>
    }
  }

  const calculateStats = () => {
    const total = filteredData.length
    const completed = filteredData.filter(card => card.status === 'completed').length
    const inProgress = filteredData.filter(card => card.status === 'in_progress').length
    const pending = filteredData.filter(card => card.status === 'pending').length
    const avgProgress = filteredData.reduce((sum, card) => sum + card.progress, 0) / total

    return { total, completed, inProgress, pending, avgProgress }
  }

  const stats = calculateStats()

  const handleRefresh = () => {
    toast.info('Refreshing reports...')
    setTimeout(() => {
      toast.success('Reports refreshed successfully!')
    }, 1000)
  }

  const handleExportPDF = () => {
    toast.info('Generating PDF report...')
    setTimeout(() => {
      toast.success('PDF report downloaded successfully!')
    }, 2000)
  }

  const handleExportExcel = () => {
    toast.info('Generating Excel report...')
    setTimeout(() => {
      toast.success('Excel report downloaded successfully!')
    }, 2000)
  }

  const handleViewJobCard = (card) => {
    setSelectedJobCard(card)
    setShowViewModal(true)
  }

  const handleUpdateProgress = (card) => {
    setSelectedJobCard(card)
    setNewProgress(card.progress)
    setShowProgressModal(true)
  }

  const handleSaveProgress = () => {
    if (selectedJobCard) {
      setJobCards(prev => prev.map(card => 
        card.id === selectedJobCard.id 
          ? { ...card, progress: newProgress }
          : card
      ))
      toast.success(`Progress updated to ${newProgress}%`)
      setShowProgressModal(false)
      setSelectedJobCard(null)
      setNewProgress(0)
    }
  }

  const handleQuickProgressUpdate = (card, increment) => {
    const newProgressValue = Math.max(0, Math.min(100, card.progress + increment))
    setJobCards(prev => prev.map(jobCard => 
      jobCard.id === card.id 
        ? { ...jobCard, progress: newProgressValue }
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

  return (
    <div>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Job Card Reports</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="#">Manager</a></li>
                <li className="breadcrumb-item active">Job Card Reports</li>
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
                      <p className="mb-0">Total Job Cards</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-clipboard-list fa-2x"></i>
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
              <Card className="bg-info text-white">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4>{stats.avgProgress.toFixed(1)}%</h4>
                      <p className="mb-0">Avg Progress</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-chart-line fa-2x"></i>
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
                        <Form.Label>Department</Form.Label>
                        <Form.Select
                          value={selectedDepartment}
                          onChange={(e) => setSelectedDepartment(e.target.value)}
                        >
                          <option value="all">All Departments</option>
                          <option value="Engineering">Engineering</option>
                          <option value="Design">Design</option>
                          <option value="Sales">Sales</option>
                          <option value="Marketing">Marketing</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6} className="d-flex align-items-end">
                      <Button variant="primary" className="mr-2" onClick={handleRefresh}>
                        <i className="fas fa-sync mr-1"></i>
                        Refresh
                      </Button>
                      <Button variant="success" className="mr-2" onClick={handleExportPDF}>
                        <i className="fas fa-download mr-1"></i>
                        Export PDF
                      </Button>
                      <Button variant="info" onClick={handleExportExcel}>
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
                    Weekly Job Card Trend
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
                      <Line type="monotone" dataKey="completed" stroke="#28a745" strokeWidth={2} />
                      <Line type="monotone" dataKey="in_progress" stroke="#007bff" strokeWidth={2} />
                      <Line type="monotone" dataKey="pending" stroke="#ffc107" strokeWidth={2} />
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
                    Status Distribution
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

          {/* Department Performance */}
          <Row className="mb-4">
            <Col lg={12}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-chart-bar mr-2"></i>
                    Department Performance
                  </h3>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={departmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completed" fill="#28a745" />
                      <Bar dataKey="in_progress" fill="#007bff" />
                      <Bar dataKey="pending" fill="#ffc107" />
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
                    Detailed Job Card Report
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Client</th>
                        <th>Department</th>
                        <th>Assigned To</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Progress</th>
                        <th>Est. Hours</th>
                        <th>Actual Hours</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((card) => (
                        <tr key={card.id}>
                          <td>#{card.id}</td>
                          <td>{card.title}</td>
                          <td>{card.client}</td>
                          <td>{card.department}</td>
                          <td>{card.assigned_to}</td>
                          <td>{getStatusBadge(card.status)}</td>
                          <td>{getPriorityBadge(card.priority)}</td>
                          <td>
                            <div className="progress progress-sm mb-1" style={{cursor: 'pointer'}} onClick={() => handleUpdateProgress(card)} title="Click to update progress">
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
                          </td>
                          <td>{card.estimated_hours}h</td>
                          <td>{card.actual_hours}h</td>
                          <td>
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleViewJobCard(card)}
                            >
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

      {/* View Job Card Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-eye mr-2"></i>
            Job Card Report Details - {selectedJobCard?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedJobCard && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Job Card ID:</strong> #{selectedJobCard.id}
                </Col>
                <Col md={6}>
                  <strong>Client:</strong> {selectedJobCard.client}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Department:</strong> {selectedJobCard.department}
                </Col>
                <Col md={6}>
                  <strong>Assigned To:</strong> {selectedJobCard.assigned_to}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Priority:</strong> {getPriorityBadge(selectedJobCard.priority)}
                </Col>
                <Col md={6}>
                  <strong>Status:</strong> {getStatusBadge(selectedJobCard.status)}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Created Date:</strong> {new Date(selectedJobCard.created_date).toLocaleDateString()}
                </Col>
                <Col md={6}>
                  <strong>Completed Date:</strong> {selectedJobCard.completed_date ? new Date(selectedJobCard.completed_date).toLocaleDateString() : 'Not completed'}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Estimated Hours:</strong> {selectedJobCard.estimated_hours}h
                </Col>
                <Col md={6}>
                  <strong>Actual Hours:</strong> {selectedJobCard.actual_hours}h
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <strong>Progress:</strong>
                  <div className="progress mt-2">
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{ width: `${selectedJobCard.progress}%` }}
                      aria-valuenow={selectedJobCard.progress}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      {selectedJobCard.progress}%
                    </div>
                  </div>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <strong>Title:</strong>
                  <p className="mt-2">{selectedJobCard.title}</p>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
          <Button variant="success" onClick={() => {
            setShowViewModal(false)
            handleExportPDF()
          }}>
            <i className="fas fa-download mr-1"></i>
            Export as PDF
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Progress Update Modal */}
      <Modal show={showProgressModal} onHide={() => setShowProgressModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-chart-line mr-2"></i>
            Update Progress - {selectedJobCard?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedJobCard && (
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
    </div>
  )
}

export default ManagerJobCardReports
