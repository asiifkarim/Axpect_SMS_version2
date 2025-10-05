import React, { useState } from 'react'
import { Card, Row, Col, Table, Badge, Button, Form, Modal } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const ManagerJobCardDashboard = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)

  // Mock job card data
  const jobCards = [
    {
      id: 1,
      title: 'Website Development',
      client: 'ABC Company',
      assigned_to: 'John Doe',
      status: 'in_progress',
      priority: 'high',
      due_date: '2024-01-20',
      progress: 75
    },
    {
      id: 2,
      title: 'Mobile App Design',
      client: 'XYZ Corp',
      assigned_to: 'Jane Smith',
      status: 'completed',
      priority: 'medium',
      due_date: '2024-01-15',
      progress: 100
    },
    {
      id: 3,
      title: 'Database Optimization',
      client: 'DEF Ltd',
      assigned_to: 'Mike Johnson',
      status: 'pending',
      priority: 'low',
      due_date: '2024-01-25',
      progress: 25
    }
  ]

  const filteredCards = jobCards.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.assigned_to.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || card.status === statusFilter
    return matchesSearch && matchesStatus
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

  const handleViewCard = (card) => {
    setSelectedCard(card)
    setShowViewModal(true)
  }

  const handleEditCard = (card) => {
    setSelectedCard(card)
    setShowEditModal(true)
  }

  const handleAddJobCard = () => {
    toast.info('Redirecting to Create Job Card page...')
    setTimeout(() => {
      navigate('/manager/create-job-card')
    }, 1000)
  }

  const handleExport = () => {
    toast.success('Exporting job cards data...')
    // In a real app, this would trigger a download
    setTimeout(() => {
      toast.success('Export completed!')
    }, 2000)
  }

  const calculateStats = () => {
    const total = jobCards.length
    const completed = jobCards.filter(card => card.status === 'completed').length
    const inProgress = jobCards.filter(card => card.status === 'in_progress').length
    const pending = jobCards.filter(card => card.status === 'pending').length

    return { total, completed, inProgress, pending }
  }

  const stats = calculateStats()

  return (
    <div>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Job Card Management</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="#">Manager</a></li>
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
                      <h4>{stats.pending}</h4>
                      <p className="mb-0">Pending</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-hourglass-half fa-2x"></i>
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
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4} className="d-flex align-items-end">
                      <Button variant="primary" className="mr-2" onClick={handleAddJobCard}>
                        <i className="fas fa-plus mr-1"></i>
                        Add Job Card
                      </Button>
                      <Button variant="success" onClick={handleExport}>
                        <i className="fas fa-download mr-1"></i>
                        Export
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
                    Job Cards
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Client</th>
                        <th>Assigned To</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Due Date</th>
                        <th>Progress</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCards.map((card) => (
                        <tr key={card.id}>
                          <td>#{card.id}</td>
                          <td>
                            <strong>{card.title}</strong>
                          </td>
                          <td>{card.client}</td>
                          <td>{card.assigned_to}</td>
                          <td>{getStatusBadge(card.status)}</td>
                          <td>{getPriorityBadge(card.priority)}</td>
                          <td>{card.due_date}</td>
                          <td>
                            <div className="progress progress-sm">
                              <div
                                className="progress-bar"
                                role="progressbar"
                                style={{ width: `${card.progress}%` }}
                                aria-valuenow={card.progress}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              >
                                {card.progress}%
                              </div>
                            </div>
                          </td>
                          <td>
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              className="mr-1"
                              onClick={() => handleViewCard(card)}
                            >
                              <i className="fas fa-eye"></i>
                            </Button>
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              onClick={() => handleEditCard(card)}
                            >
                              <i className="fas fa-edit"></i>
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
            Job Card Details - {selectedCard?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCard && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Job ID:</strong> #{selectedCard.id}
                </Col>
                <Col md={6}>
                  <strong>Client:</strong> {selectedCard.client}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Assigned To:</strong> {selectedCard.assigned_to}
                </Col>
                <Col md={6}>
                  <strong>Due Date:</strong> {selectedCard.due_date}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Status:</strong> {getStatusBadge(selectedCard.status)}
                </Col>
                <Col md={6}>
                  <strong>Priority:</strong> {getPriorityBadge(selectedCard.priority)}
                </Col>
              </Row>
              <div className="mb-3">
                <strong>Progress:</strong>
                <div className="progress mt-2">
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${selectedCard.progress}%` }}
                    aria-valuenow={selectedCard.progress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    {selectedCard.progress}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => {
            setShowViewModal(false)
            handleEditCard(selectedCard)
          }}>
            Edit Job Card
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Job Card Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-edit mr-2"></i>
            Edit Job Card - {selectedCard?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCard && (
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type="text"
                      defaultValue={selectedCard.title}
                      placeholder="Enter job title"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Client</Form.Label>
                    <Form.Control
                      type="text"
                      defaultValue={selectedCard.client}
                      placeholder="Enter client name"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Assigned To</Form.Label>
                    <Form.Select defaultValue={selectedCard.assigned_to}>
                      <option value="John Doe">John Doe</option>
                      <option value="Jane Smith">Jane Smith</option>
                      <option value="Mike Johnson">Mike Johnson</option>
                      <option value="Sarah Wilson">Sarah Wilson</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select defaultValue={selectedCard.status}>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Priority</Form.Label>
                    <Form.Select defaultValue={selectedCard.priority}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Due Date</Form.Label>
                    <Form.Control
                      type="date"
                      defaultValue={selectedCard.due_date}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => {
            toast.success('Job card updated successfully!')
            setShowEditModal(false)
          }}>
            Update Job Card
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default ManagerJobCardDashboard
