import React, { useState } from 'react'
import { useMockDataStore } from '../../store/mockDataStore'
import { toast } from 'react-toastify'
import { Modal, Button, Form, Row, Col } from 'react-bootstrap'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const CeoJobCardDashboard = () => {
  const { jobCards, employees, addJobCard, updateJobCard } = useMockDataStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [newProgress, setNewProgress] = useState(0)
  const [newJobCard, setNewJobCard] = useState({
    title: '',
    client: '',
    assigned_to: '',
    priority: 'medium',
    status: 'pending',
    progress: 0,
    description: '',
    due_date: ''
  })

  const filteredJobCards = jobCards.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.assigned_to.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filterStatus || card.status === filterStatus
    const matchesPriority = !filterPriority || card.priority === filterPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  // Calculate statistics
  const totalJobCards = jobCards.length
  const completedCards = jobCards.filter(card => card.status === 'completed').length
  const inProgressCards = jobCards.filter(card => card.status === 'in_progress').length
  const pendingCards = jobCards.filter(card => card.status === 'pending').length

  // Chart data
  const statusData = [
    { name: 'Completed', value: completedCards, color: '#28a745' },
    { name: 'In Progress', value: inProgressCards, color: '#ffc107' },
    { name: 'Pending', value: pendingCards, color: '#dc3545' }
  ]

  const priorityData = [
    { name: 'High', value: jobCards.filter(card => card.priority === 'high').length },
    { name: 'Medium', value: jobCards.filter(card => card.priority === 'medium').length },
    { name: 'Low', value: jobCards.filter(card => card.priority === 'low').length }
  ]

  const handleStatusChange = (cardId, newStatus) => {
    updateJobCard(cardId, { status: newStatus })
    toast.success(`Job card status updated to ${newStatus}`)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'danger'
      case 'medium': return 'warning'
      case 'low': return 'success'
      default: return 'secondary'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success'
      case 'in_progress': return 'warning'
      case 'pending': return 'danger'
      default: return 'secondary'
    }
  }

  const handleAddJobCard = () => {
    setNewJobCard({
      title: '',
      client: '',
      assigned_to: '',
      priority: 'medium',
      status: 'pending',
      progress: 0,
      description: '',
      due_date: ''
    })
    setShowAddModal(true)
  }

  const handleSaveNewJobCard = () => {
    if (!newJobCard.title || !newJobCard.client || !newJobCard.assigned_to) {
      toast.error('Please fill in all required fields')
      return
    }

    const jobCardData = {
      ...newJobCard,
      id: Date.now(),
      created_date: new Date().toISOString().split('T')[0],
      due_date: newJobCard.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default to 7 days from now
    }

    addJobCard(jobCardData)
    toast.success('Job card created successfully!')
    setShowAddModal(false)
    setNewJobCard({
      title: '',
      client: '',
      assigned_to: '',
      priority: 'medium',
      status: 'pending',
      progress: 0,
      description: '',
      due_date: ''
    })
  }

  const handleInputChange = (field, value) => {
    setNewJobCard(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleUpdateProgress = (card) => {
    setSelectedCard(card)
    setNewProgress(card.progress)
    setShowProgressModal(true)
  }

  const handleSaveProgress = () => {
    if (selectedCard) {
      updateJobCard(selectedCard.id, { progress: newProgress })
      toast.success(`Progress updated to ${newProgress}%`)
      setShowProgressModal(false)
      setSelectedCard(null)
      setNewProgress(0)
    }
  }

  const handleQuickProgressUpdate = (card, increment) => {
    const newProgressValue = Math.max(0, Math.min(100, card.progress + increment))
    updateJobCard(card.id, { progress: newProgressValue })
    toast.success(`Progress updated to ${newProgressValue}%`)
  }

  const handleViewCard = (card) => {
    setSelectedCard(card)
    setShowViewModal(true)
  }

  const handleEditCard = (card) => {
    setSelectedCard(card)
    setShowEditModal(true)
  }

  return (
    <div className="content">
      <div className="container-fluid">
        {/* Statistics Cards */}
        <div className="row">
          <div className="col-lg-3 col-6">
            <div className="small-box bg-info">
              <div className="inner">
                <h3>{totalJobCards}</h3>
                <p>Total Job Cards</p>
              </div>
              <div className="icon">
                <i className="fas fa-clipboard-list"></i>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-6">
            <div className="small-box bg-success">
              <div className="inner">
                <h3>{completedCards}</h3>
                <p>Completed</p>
              </div>
              <div className="icon">
                <i className="fas fa-check-circle"></i>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-6">
            <div className="small-box bg-warning">
              <div className="inner">
                <h3>{inProgressCards}</h3>
                <p>In Progress</p>
              </div>
              <div className="icon">
                <i className="fas fa-clock"></i>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-6">
            <div className="small-box bg-danger">
              <div className="inner">
                <h3>{pendingCards}</h3>
                <p>Pending</p>
              </div>
              <div className="icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Job Card Status Distribution</h3>
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
          
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Priority Distribution</h3>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Job Cards Management */}
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Job Cards Management</h3>
                <div className="card-tools">
                  <button className="btn btn-primary btn-sm" onClick={handleAddJobCard}>
                    <i className="fas fa-plus mr-1"></i>
                    Add Job Card
                  </button>
                </div>
              </div>
              <div className="card-body">
                {/* Filters */}
                <div className="row mb-3">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label htmlFor="search">Search Job Cards</label>
                      <input
                        type="text"
                        className="form-control"
                        id="search"
                        placeholder="Search by title or assignee..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label htmlFor="priority">Filter by Priority</label>
                      <select
                        className="form-control"
                        id="priority"
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                      >
                        <option value="">All Priority</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
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
                          <th>Title</th>
                          <th>Assigned To</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Progress</th>
                          <th>Due Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredJobCards.map(card => (
                          <tr key={card.id}>
                            <td>{card.id}</td>
                            <td>
                              <div>
                                <strong>{card.title}</strong>
                                <br />
                                <small className="text-muted">{card.description}</small>
                              </div>
                            </td>
                            <td>{card.assigned_to}</td>
                            <td>
                              <span className={`badge badge-${getPriorityColor(card.priority)}`}>
                                {card.priority}
                              </span>
                            </td>
                            <td>
                              <span className={`badge badge-${getStatusColor(card.status)}`}>
                                {card.status}
                              </span>
                            </td>
                            <td>
                              <div className="progress progress-sm mb-1" style={{cursor: 'pointer'}} onClick={() => handleUpdateProgress(card)} title="Click to update progress">
                                <div 
                                  className="progress-bar bg-info" 
                                  role="progressbar" 
                                  style={{width: `${card.progress}%`}}
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
                            <td>{new Date(card.due_date).toLocaleDateString()}</td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button 
                                  className="btn btn-info btn-sm"
                                  onClick={() => handleViewCard(card)}
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button 
                                  className="btn btn-warning btn-sm"
                                  onClick={() => handleEditCard(card)}
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button 
                                  className={`btn btn-sm ${card.status === 'pending' ? 'btn-danger' : card.status === 'in_progress' ? 'btn-warning' : 'btn-success'}`}
                                  onClick={() => {
                                    const statuses = ['pending', 'in_progress', 'completed']
                                    const currentIndex = statuses.indexOf(card.status)
                                    const nextIndex = (currentIndex + 1) % statuses.length
                                    handleStatusChange(card.id, statuses[nextIndex])
                                  }}
                                  title={`Click to change status from ${card.status}`}
                                >
                                  <i className={`fas fa-${card.status === 'pending' ? 'clock' : card.status === 'in_progress' ? 'play' : 'check'}`}></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Grid */}
                <div className="mobile-grid">
                  <div className="job-card-grid">
                    {filteredJobCards.map(card => (
                      <div key={card.id} className="job-card">
                        <div className="job-card-header">
                          <div>
                            <h5 className="job-card-title">{card.title}</h5>
                            <div className="job-card-number">ID: {card.id}</div>
                          </div>
                          <div>
                            <span className={`badge badge-${getPriorityColor(card.priority)} mr-1`}>
                              {card.priority}
                            </span>
                            <span className={`badge badge-${getStatusColor(card.status)}`}>
                              {card.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="job-card-meta">
                          <div className="meta-item">
                            <div className="meta-label">Assigned To</div>
                            <div className="meta-value">{card.assigned_to}</div>
                          </div>
                          <div className="meta-item">
                            <div className="meta-label">Due Date</div>
                            <div className="meta-value">{new Date(card.due_date).toLocaleDateString()}</div>
                          </div>
                          <div className="meta-item">
                            <div className="meta-label">Progress</div>
                            <div className="meta-value">{card.progress}%</div>
                          </div>
                        </div>
                        
                        <div className="job-card-progress">
                          <div className="progress mb-2" style={{cursor: 'pointer'}} onClick={() => handleUpdateProgress(card)} title="Click to update progress">
                            <div 
                              className="progress-bar bg-info" 
                              role="progressbar" 
                              style={{width: `${card.progress}%`}}
                            >
                              {card.progress}%
                            </div>
                          </div>
                          <div className="btn-group btn-group-sm">
                            <button 
                              className="btn btn-outline-success btn-sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleQuickProgressUpdate(card, 10)
                              }}
                              title="+10%"
                            >
                              <i className="fas fa-plus mr-1"></i>
                              +10%
                            </button>
                            <button 
                              className="btn btn-outline-warning btn-sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleQuickProgressUpdate(card, -10)
                              }}
                              title="-10%"
                            >
                              <i className="fas fa-minus mr-1"></i>
                              -10%
                            </button>
                          </div>
                        </div>
                        
                        <div className="job-card-actions">
                          <div className="btn-group">
                            <button 
                              className="btn btn-info btn-sm"
                              onClick={() => handleViewCard(card)}
                            >
                              <i className="fas fa-eye mr-1"></i>
                              View
                            </button>
                            <button 
                              className="btn btn-warning btn-sm"
                              onClick={() => handleEditCard(card)}
                            >
                              <i className="fas fa-edit mr-1"></i>
                              Edit
                            </button>
                            <button 
                              className={`btn btn-sm ${card.status === 'pending' ? 'btn-danger' : card.status === 'in_progress' ? 'btn-warning' : 'btn-success'}`}
                              onClick={() => {
                                const statuses = ['pending', 'in_progress', 'completed']
                                const currentIndex = statuses.indexOf(card.status)
                                const nextIndex = (currentIndex + 1) % statuses.length
                                handleStatusChange(card.id, statuses[nextIndex])
                              }}
                              title={`Click to change status from ${card.status}`}
                            >
                              <i className={`fas fa-${card.status === 'pending' ? 'clock' : card.status === 'in_progress' ? 'play' : 'check'} mr-1`}></i>
                              {card.status === 'pending' ? 'Start' : card.status === 'in_progress' ? 'Complete' : 'Restart'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {filteredJobCards.length === 0 && (
                  <div className="text-center py-4">
                    <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No job cards found</h5>
                    <p className="text-muted">Try adjusting your search criteria</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Update Modal */}
      <Modal show={showProgressModal} onHide={() => setShowProgressModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-chart-line mr-2"></i>
            Update Progress - {selectedCard?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCard && (
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
                      className="progress-bar bg-info" 
                      role="progressbar" 
                      style={{width: `${newProgress}%`}}
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

      {/* Add Job Card Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-plus mr-2"></i>
            Add New Job Card
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Job Title *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newJobCard.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter job title"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Client *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newJobCard.client}
                    onChange={(e) => handleInputChange('client', e.target.value)}
                    placeholder="Enter client name"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Assign To *</Form.Label>
                  <Form.Control
                    as="select"
                    value={newJobCard.assigned_to}
                    onChange={(e) => handleInputChange('assigned_to', e.target.value)}
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map(employee => (
                      <option key={employee.id} value={employee.name}>{employee.name}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Priority</Form.Label>
                  <Form.Control
                    as="select"
                    value={newJobCard.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Control
                    as="select"
                    value={newJobCard.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Progress (%)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max="100"
                    value={newJobCard.progress}
                    onChange={(e) => handleInputChange('progress', parseInt(e.target.value) || 0)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Due Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={newJobCard.due_date}
                    onChange={(e) => handleInputChange('due_date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={newJobCard.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter job description"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveNewJobCard}>
            <i className="fas fa-plus mr-1"></i>
            Create Job Card
          </Button>
        </Modal.Footer>
      </Modal>

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
                  <strong>Priority:</strong> 
                  <span className={`badge badge-${getPriorityColor(selectedCard.priority)} ml-2`}>
                    {selectedCard.priority}
                  </span>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Status:</strong> 
                  <span className={`badge badge-${getStatusColor(selectedCard.status)} ml-2`}>
                    {selectedCard.status}
                  </span>
                </Col>
                <Col md={6}>
                  <strong>Progress:</strong> {selectedCard.progress}%
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Due Date:</strong> {new Date(selectedCard.due_date).toLocaleDateString()}
                </Col>
                <Col md={6}>
                  <strong>Created:</strong> {new Date(selectedCard.created_date).toLocaleDateString()}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <strong>Description:</strong>
                  <p className="mt-2">{selectedCard.description}</p>
                </Col>
              </Row>
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
                    <Form.Control
                      as="select"
                      defaultValue={selectedCard.assigned_to}
                    >
                      {employees.map(employee => (
                        <option key={employee.id} value={employee.name}>{employee.name}</option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Priority</Form.Label>
                    <Form.Control
                      as="select"
                      defaultValue={selectedCard.priority}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Control
                      as="select"
                      defaultValue={selectedCard.status}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Progress (%)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={selectedCard.progress}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      defaultValue={selectedCard.description}
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

export default CeoJobCardDashboard
