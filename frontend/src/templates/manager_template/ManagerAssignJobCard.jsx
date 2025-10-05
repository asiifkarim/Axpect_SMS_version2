import React, { useState } from 'react'
import { Card, Row, Col, Table, Badge, Button, Form, Modal } from 'react-bootstrap'
import { toast } from 'react-toastify'

const ManagerAssignJobCard = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedJobCard, setSelectedJobCard] = useState(null)
  const [assignForm, setAssignForm] = useState({
    assigned_to: '',
    due_date: '',
    priority: 'medium',
    notes: ''
  })

  // Mock job card data
  const jobCards = [
    {
      id: 1,
      title: 'Website Development',
      client: 'ABC Company',
      description: 'Develop a responsive website for ABC Company',
      status: 'unassigned',
      priority: 'high',
      created_date: '2024-01-15',
      estimated_hours: 40
    },
    {
      id: 2,
      title: 'Mobile App Design',
      client: 'XYZ Corp',
      description: 'Design UI/UX for mobile application',
      status: 'assigned',
      priority: 'medium',
      created_date: '2024-01-14',
      estimated_hours: 30,
      assigned_to: 'Jane Smith',
      due_date: '2024-01-25'
    },
    {
      id: 3,
      title: 'Database Optimization',
      client: 'DEF Ltd',
      description: 'Optimize database performance',
      status: 'unassigned',
      priority: 'low',
      created_date: '2024-01-13',
      estimated_hours: 20
    }
  ]

  const filteredCards = jobCards.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.client.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || card.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleAssign = (card) => {
    setSelectedJobCard(card)
    setAssignForm({
      assigned_to: '',
      due_date: '',
      priority: card.priority,
      notes: ''
    })
    setShowAssignModal(true)
  }

  const handleAssignSubmit = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Job card assigned successfully!')
      setShowAssignModal(false)
    } catch (error) {
      toast.error('Failed to assign job card')
    }
  }

  const handleViewJobCard = (card) => {
    setSelectedJobCard(card)
    setShowViewModal(true)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'assigned':
        return <Badge bg="success">Assigned</Badge>
      case 'unassigned':
        return <Badge bg="warning">Unassigned</Badge>
      case 'in_progress':
        return <Badge bg="primary">In Progress</Badge>
      case 'completed':
        return <Badge bg="info">Completed</Badge>
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
    const total = jobCards.length
    const assigned = jobCards.filter(card => card.status === 'assigned').length
    const unassigned = jobCards.filter(card => card.status === 'unassigned').length
    const inProgress = jobCards.filter(card => card.status === 'in_progress').length

    return { total, assigned, unassigned, inProgress }
  }

  const stats = calculateStats()

  return (
    <div>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Assign Job Card</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="#">Manager</a></li>
                <li className="breadcrumb-item active">Assign Job Card</li>
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
                      <h4>{stats.assigned}</h4>
                      <p className="mb-0">Assigned</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-user-check fa-2x"></i>
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
                      <h4>{stats.unassigned}</h4>
                      <p className="mb-0">Unassigned</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-user-times fa-2x"></i>
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
          </Row>

          {/* Filters */}
          <Row className="mb-4">
            <Col lg={12}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-filter mr-2"></i>
                    Search & Filter
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Search</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Search job cards..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Status</Form.Label>
                        <Form.Select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          <option value="all">All Status</option>
                          <option value="unassigned">Unassigned</option>
                          <option value="assigned">Assigned</option>
                          <option value="in_progress">In Progress</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4} className="d-flex align-items-end">
                      <Button variant="primary">
                        <i className="fas fa-sync mr-1"></i>
                        Refresh
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
                    Job Cards Assignment
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Client</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Assigned To</th>
                        <th>Due Date</th>
                        <th>Estimated Hours</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCards.map((card) => (
                        <tr key={card.id}>
                          <td>#{card.id}</td>
                          <td>
                            <strong>{card.title}</strong>
                            <br />
                            <small className="text-muted">{card.description}</small>
                          </td>
                          <td>{card.client}</td>
                          <td>{getPriorityBadge(card.priority)}</td>
                          <td>{getStatusBadge(card.status)}</td>
                          <td>{card.assigned_to || '-'}</td>
                          <td>{card.due_date || '-'}</td>
                          <td>{card.estimated_hours}h</td>
                          <td>
                            {card.status === 'unassigned' ? (
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleAssign(card)}
                              >
                                <i className="fas fa-user-plus"></i> Assign
                              </Button>
                            ) : (
                              <Button 
                                variant="outline-info" 
                                size="sm"
                                onClick={() => handleViewJobCard(card)}
                              >
                                <i className="fas fa-eye"></i> View
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

      {/* Assign Modal */}
      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-user-plus mr-2"></i>
            Assign Job Card - {selectedJobCard?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Assign To</Form.Label>
                  <Form.Select
                    name="assigned_to"
                    value={assignForm.assigned_to}
                    onChange={(e) => setAssignForm(prev => ({ ...prev, assigned_to: e.target.value }))}
                    required
                  >
                    <option value="">Select Employee</option>
                    <option value="John Doe">John Doe</option>
                    <option value="Jane Smith">Jane Smith</option>
                    <option value="Mike Johnson">Mike Johnson</option>
                    <option value="Sarah Wilson">Sarah Wilson</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Due Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="due_date"
                    value={assignForm.due_date}
                    onChange={(e) => setAssignForm(prev => ({ ...prev, due_date: e.target.value }))}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Priority</Form.Label>
                  <Form.Select
                    name="priority"
                    value={assignForm.priority}
                    onChange={(e) => setAssignForm(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Assignment Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={assignForm.notes}
                onChange={(e) => setAssignForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Enter any specific instructions or notes"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAssignSubmit}>
            Assign Job Card
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Job Card Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-eye mr-2"></i>
            Job Card Details - {selectedJobCard?.title}
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
                  <strong>Priority:</strong> {getPriorityBadge(selectedJobCard.priority)}
                </Col>
                <Col md={6}>
                  <strong>Status:</strong> {getStatusBadge(selectedJobCard.status)}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Assigned To:</strong> {selectedJobCard.assigned_to || 'Not assigned'}
                </Col>
                <Col md={6}>
                  <strong>Due Date:</strong> {selectedJobCard.due_date || 'Not set'}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Created Date:</strong> {new Date(selectedJobCard.created_date).toLocaleDateString()}
                </Col>
                <Col md={6}>
                  <strong>Estimated Hours:</strong> {selectedJobCard.estimated_hours}h
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <strong>Description:</strong>
                  <div className="mt-2 p-3 bg-light rounded">
                    {selectedJobCard.description}
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
          {selectedJobCard?.status === 'unassigned' && (
            <Button variant="primary" onClick={() => {
              setShowViewModal(false)
              handleAssign(selectedJobCard)
            }}>
              <i className="fas fa-user-plus mr-1"></i>
              Assign Job Card
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default ManagerAssignJobCard
