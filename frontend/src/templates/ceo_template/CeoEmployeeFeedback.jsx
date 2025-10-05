import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { Modal, Button, Row, Col } from 'react-bootstrap'
import { useMockDataStore } from '../../store/mockDataStore'

const CeoEmployeeFeedback = () => {
  const { employees, feedback } = useMockDataStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  // Filter employees (user_type === '3')
  const employeesList = employees.filter(emp => emp.user_type === '3')
  
  const filteredFeedback = feedback.filter(fb => {
    const employee = employeesList.find(emp => emp.id === fb.employee_id)
    const matchesSearch = !searchTerm || 
                         (employee?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          fb.message.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = !filterType || fb.type === filterType
    return matchesSearch && matchesType
  })

  const onSubmit = (data) => {
    const newFeedback = {
      ...data,
      id: Date.now(),
      from_user: 'CEO',
      timestamp: new Date().toISOString(),
      status: 'sent'
    }
    
    toast.success('Feedback sent successfully!')
    reset()
    setShowAddForm(false)
  }

  const handleMarkAsRead = (feedbackId) => {
    toast.success('Feedback marked as read!')
  }

  const handleViewFeedback = (feedbackItem) => {
    setSelectedFeedback(feedbackItem)
    setShowViewModal(true)
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'performance': return 'info'
      case 'behavior': return 'warning'
      case 'improvement': return 'success'
      case 'complaint': return 'danger'
      default: return 'secondary'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'danger'
      case 'medium': return 'warning'
      case 'low': return 'success'
      default: return 'secondary'
    }
  }

  return (
    <div className="content">
      <div className="container-fluid">
        {/* Statistics Cards */}
        <div className="row">
          <div className="col-lg-3 col-6">
            <div className="small-box bg-info">
              <div className="inner">
                <h3>{feedback.length}</h3>
                <p>Total Feedback</p>
              </div>
              <div className="icon">
                <i className="fas fa-comments"></i>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-6">
            <div className="small-box bg-success">
              <div className="inner">
                <h3>{feedback.filter(fb => fb.status === 'read').length}</h3>
                <p>Read</p>
              </div>
              <div className="icon">
                <i className="fas fa-check-circle"></i>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-6">
            <div className="small-box bg-warning">
              <div className="inner">
                <h3>{feedback.filter(fb => fb.status === 'unread').length}</h3>
                <p>Unread</p>
              </div>
              <div className="icon">
                <i className="fas fa-envelope"></i>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-6">
            <div className="small-box bg-danger">
              <div className="inner">
                <h3>{feedback.filter(fb => fb.priority === 'high').length}</h3>
                <p>High Priority</p>
              </div>
              <div className="icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Management */}
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Employee Feedback Management</h3>
                <div className="card-tools">
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => setShowAddForm(!showAddForm)}
                  >
                    <i className="fas fa-plus mr-1"></i>
                    Send Feedback
                  </button>
                </div>
              </div>
              <div className="card-body">
                {/* Send Feedback Form */}
                {showAddForm && (
                  <div className="card mb-4">
                    <div className="card-header">
                      <h4 className="card-title">Send Feedback to Employee</h4>
                    </div>
                    <div className="card-body">
                      <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="employee_id">Select Employee *</label>
                              <select
                                className={`form-control ${errors.employee_id ? 'is-invalid' : ''}`}
                                id="employee_id"
                                {...register('employee_id', { required: 'Please select an employee' })}
                              >
                                <option value="">Choose Employee</option>
                                {employeesList.map(employee => (
                                  <option key={employee.id} value={employee.id}>
                                    {employee.name} - {employee.department}
                                  </option>
                                ))}
                              </select>
                              {errors.employee_id && (
                                <div className="invalid-feedback">{errors.employee_id.message}</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="type">Feedback Type *</label>
                              <select
                                className={`form-control ${errors.type ? 'is-invalid' : ''}`}
                                id="type"
                                {...register('type', { required: 'Please select feedback type' })}
                              >
                                <option value="">Select Type</option>
                                <option value="performance">Performance</option>
                                <option value="behavior">Behavior</option>
                                <option value="improvement">Improvement</option>
                                <option value="complaint">Complaint</option>
                              </select>
                              {errors.type && (
                                <div className="invalid-feedback">{errors.type.message}</div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="priority">Priority</label>
                              <select
                                className="form-control"
                                id="priority"
                                {...register('priority')}
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="subject">Subject *</label>
                              <input
                                type="text"
                                className={`form-control ${errors.subject ? 'is-invalid' : ''}`}
                                id="subject"
                                placeholder="Feedback subject"
                                {...register('subject', { required: 'Subject is required' })}
                              />
                              {errors.subject && (
                                <div className="invalid-feedback">{errors.subject.message}</div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="form-group">
                          <label htmlFor="message">Message *</label>
                          <textarea
                            className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                            id="message"
                            rows="4"
                            placeholder="Write your feedback message..."
                            {...register('message', { required: 'Message is required' })}
                          />
                          {errors.message && (
                            <div className="invalid-feedback">{errors.message.message}</div>
                          )}
                        </div>

                        <div className="form-group">
                          <button type="submit" className="btn btn-primary">
                            <i className="fas fa-paper-plane mr-2"></i>
                            Send Feedback
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-secondary ml-2" 
                            onClick={() => {
                              reset()
                              setShowAddForm(false)
                            }}
                          >
                            <i className="fas fa-times mr-2"></i>
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Filters */}
                <div className="row mb-3">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="search">Search Feedback</label>
                      <input
                        type="text"
                        className="form-control"
                        id="search"
                        placeholder="Search by employee or message..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="type">Filter by Type</label>
                      <select
                        className="form-control"
                        id="type"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                      >
                        <option value="">All Types</option>
                        <option value="performance">Performance</option>
                        <option value="behavior">Behavior</option>
                        <option value="improvement">Improvement</option>
                        <option value="complaint">Complaint</option>
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
                          <th>Employee</th>
                          <th>Subject</th>
                          <th>Type</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFeedback.map(feedbackItem => {
                          const employee = employeesList.find(emp => emp.id === feedbackItem.employee_id)
                          return (
                            <tr key={feedbackItem.id}>
                              <td>{feedbackItem.id}</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <img 
                                    src={employee?.profile_pic || '/images/default-avatar.png'} 
                                    alt={employee?.name}
                                    className="img-circle elevation-2 mr-2"
                                    style={{width: '32px', height: '32px'}}
                                  />
                                  <div>
                                    <strong>{employee?.name}</strong>
                                    <br />
                                    <small className="text-muted">{employee?.department}</small>
                                  </div>
                                </div>
                              </td>
                              <td>{feedbackItem.subject}</td>
                              <td>
                                <span className={`badge badge-${getTypeColor(feedbackItem.type)}`}>
                                  {feedbackItem.type}
                                </span>
                              </td>
                              <td>
                                <span className={`badge badge-${getPriorityColor(feedbackItem.priority)}`}>
                                  {feedbackItem.priority}
                                </span>
                              </td>
                              <td>
                                <span className={`badge badge-${feedbackItem.status === 'read' ? 'success' : 'warning'}`}>
                                  {feedbackItem.status}
                                </span>
                              </td>
                              <td>{new Date(feedbackItem.timestamp).toLocaleDateString()}</td>
                              <td>
                                <div className="btn-group btn-group-sm">
                                  <button 
                                    className="btn btn-info btn-sm"
                                    onClick={() => handleViewFeedback(feedbackItem)}
                                  >
                                    <i className="fas fa-eye"></i>
                                  </button>
                                  {feedbackItem.status === 'unread' && (
                                    <button 
                                      className="btn btn-success btn-sm"
                                      onClick={() => handleMarkAsRead(feedbackItem.id)}
                                    >
                                      <i className="fas fa-check"></i>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Grid */}
                <div className="mobile-grid">
                  <div className="job-card-grid">
                    {filteredFeedback.map(feedbackItem => {
                      const employee = employeesList.find(emp => emp.id === feedbackItem.employee_id)
                      return (
                        <div key={feedbackItem.id} className="job-card">
                          <div className="job-card-header">
                            <div>
                              <h5 className="job-card-title">{feedbackItem.subject}</h5>
                              <div className="job-card-number">{employee?.name}</div>
                            </div>
                            <div>
                              <span className={`badge badge-${getTypeColor(feedbackItem.type)} mr-1`}>
                                {feedbackItem.type}
                              </span>
                              <span className={`badge badge-${getPriorityColor(feedbackItem.priority)}`}>
                                {feedbackItem.priority}
                              </span>
                            </div>
                          </div>
                          
                          <div className="job-card-meta">
                            <div className="meta-item">
                              <div className="meta-label">Employee</div>
                              <div className="meta-value">{employee?.name}</div>
                            </div>
                            <div className="meta-item">
                              <div className="meta-label">Department</div>
                              <div className="meta-value">{employee?.department}</div>
                            </div>
                            <div className="meta-item">
                              <div className="meta-label">Status</div>
                              <div className="meta-value">
                                <span className={`badge badge-${feedbackItem.status === 'read' ? 'success' : 'warning'}`}>
                                  {feedbackItem.status}
                                </span>
                              </div>
                            </div>
                            <div className="meta-item">
                              <div className="meta-label">Date</div>
                              <div className="meta-value">{new Date(feedbackItem.timestamp).toLocaleDateString()}</div>
                            </div>
                          </div>
                          
                          <div className="job-card-actions">
                            <div className="btn-group">
                              <button 
                                className="btn btn-info btn-sm"
                                onClick={() => handleViewFeedback(feedbackItem)}
                              >
                                <i className="fas fa-eye mr-1"></i>
                                View
                              </button>
                              {feedbackItem.status === 'unread' && (
                                <button 
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleMarkAsRead(feedbackItem.id)}
                                >
                                  <i className="fas fa-check mr-1"></i>
                                  Mark Read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {filteredFeedback.length === 0 && (
                  <div className="text-center py-4">
                    <i className="fas fa-comments fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No feedback found</h5>
                    <p className="text-muted">Try adjusting your search criteria</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Feedback Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-eye mr-2"></i>
            Feedback Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFeedback && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>From:</strong> {selectedFeedback.from_user}
                </Col>
                <Col md={6}>
                  <strong>To:</strong> {employeesList.find(emp => emp.id === selectedFeedback.employee_id)?.name || 'Unknown Employee'}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Type:</strong> 
                  <span className={`badge badge-${getTypeColor(selectedFeedback.type)} ml-2`}>
                    {selectedFeedback.type}
                  </span>
                </Col>
                <Col md={6}>
                  <strong>Status:</strong> 
                  <span className={`badge ${selectedFeedback.status === 'read' ? 'badge-success' : 'badge-warning'} ml-2`}>
                    {selectedFeedback.status}
                  </span>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Date:</strong> {new Date(selectedFeedback.timestamp).toLocaleDateString()}
                </Col>
                <Col md={6}>
                  <strong>Time:</strong> {new Date(selectedFeedback.timestamp).toLocaleTimeString()}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <strong>Subject:</strong>
                  <p className="mt-2">{selectedFeedback.subject}</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <strong>Message:</strong>
                  <div className="mt-2 p-3 bg-light rounded">
                    {selectedFeedback.message}
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
          {selectedFeedback?.status === 'unread' && (
            <Button variant="success" onClick={() => {
              handleMarkAsRead(selectedFeedback.id)
              setShowViewModal(false)
            }}>
              <i className="fas fa-check mr-1"></i>
              Mark as Read
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default CeoEmployeeFeedback
