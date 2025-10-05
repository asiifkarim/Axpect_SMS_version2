import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { Modal, Button, Row, Col } from 'react-bootstrap'
import { useMockDataStore } from '../../store/mockDataStore'

const CeoNotifyManager = () => {
  const { employees, notifications } = useMockDataStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  // Filter managers (user_type === '2')
  const managers = employees.filter(emp => emp.user_type === '2')
  
  const filteredNotifications = notifications.filter(notif => {
    const manager = managers.find(mgr => mgr.id === notif.recipient_id)
    const matchesSearch = !searchTerm || 
                         (manager?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          notif.message.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = !filterType || notif.type === filterType
    return matchesSearch && matchesType
  })

  const onSubmit = (data) => {
    const newNotification = {
      ...data,
      id: Date.now(),
      from_user: 'CEO',
      created_date: new Date().toISOString(),
      read: false
    }
    
    toast.success('Notification sent successfully!')
    reset()
    setShowAddForm(false)
  }

  const handleMarkAsRead = (notificationId) => {
    toast.success('Notification marked as read!')
  }

  const handleViewNotification = (notification) => {
    setSelectedNotification(notification)
    setShowViewModal(true)
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'info': return 'info'
      case 'success': return 'success'
      case 'warning': return 'warning'
      case 'danger': return 'danger'
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
                <h3>{filteredNotifications.length}</h3>
                <p>Total Notifications</p>
              </div>
              <div className="icon">
                <i className="fas fa-bell"></i>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-6">
            <div className="small-box bg-success">
              <div className="inner">
                <h3>{filteredNotifications.filter(n => n.read).length}</h3>
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
                <h3>{filteredNotifications.filter(n => !n.read).length}</h3>
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
                <h3>{filteredNotifications.filter(n => n.type === 'danger').length}</h3>
                <p>Urgent</p>
              </div>
              <div className="icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Management */}
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Manager Notifications</h3>
                <div className="card-tools">
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => setShowAddForm(!showAddForm)}
                  >
                    <i className="fas fa-plus mr-1"></i>
                    Send Notification
                  </button>
                </div>
              </div>
              <div className="card-body">
                {/* Send Notification Form */}
                {showAddForm && (
                  <div className="card mb-4">
                    <div className="card-header">
                      <h4 className="card-title">Send Notification to Manager</h4>
                    </div>
                    <div className="card-body">
                      <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="recipient_id">Select Manager *</label>
                              <select
                                className={`form-control ${errors.recipient_id ? 'is-invalid' : ''}`}
                                id="recipient_id"
                                {...register('recipient_id', { required: 'Please select a manager' })}
                              >
                                <option value="">Choose Manager</option>
                                {managers.map(manager => (
                                  <option key={manager.id} value={manager.id}>
                                    {manager.name} - {manager.department}
                                  </option>
                                ))}
                              </select>
                              {errors.recipient_id && (
                                <div className="invalid-feedback">{errors.recipient_id.message}</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="type">Notification Type *</label>
                              <select
                                className={`form-control ${errors.type ? 'is-invalid' : ''}`}
                                id="type"
                                {...register('type', { required: 'Please select notification type' })}
                              >
                                <option value="">Select Type</option>
                                <option value="info">Information</option>
                                <option value="success">Success</option>
                                <option value="warning">Warning</option>
                                <option value="danger">Urgent</option>
                              </select>
                              {errors.type && (
                                <div className="invalid-feedback">{errors.type.message}</div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="form-group">
                          <label htmlFor="title">Title *</label>
                          <input
                            type="text"
                            className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                            id="title"
                            placeholder="Notification title"
                            {...register('title', { required: 'Title is required' })}
                          />
                          {errors.title && (
                            <div className="invalid-feedback">{errors.title.message}</div>
                          )}
                        </div>

                        <div className="form-group">
                          <label htmlFor="message">Message *</label>
                          <textarea
                            className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                            id="message"
                            rows="4"
                            placeholder="Write your notification message..."
                            {...register('message', { required: 'Message is required' })}
                          />
                          {errors.message && (
                            <div className="invalid-feedback">{errors.message.message}</div>
                          )}
                        </div>

                        <div className="form-group">
                          <button type="submit" className="btn btn-primary">
                            <i className="fas fa-paper-plane mr-2"></i>
                            Send Notification
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
                      <label htmlFor="search">Search Notifications</label>
                      <input
                        type="text"
                        className="form-control"
                        id="search"
                        placeholder="Search by manager or message..."
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
                        <option value="info">Information</option>
                        <option value="success">Success</option>
                        <option value="warning">Warning</option>
                        <option value="danger">Urgent</option>
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
                          <th>Manager</th>
                          <th>Title</th>
                          <th>Type</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredNotifications.map(notification => {
                          const manager = managers.find(mgr => mgr.id === notification.recipient_id)
                          return (
                            <tr key={notification.id}>
                              <td>{notification.id}</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <img 
                                    src={manager?.profile_pic || '/images/default-avatar.png'} 
                                    alt={manager?.name}
                                    className="img-circle elevation-2 mr-2"
                                    style={{width: '32px', height: '32px'}}
                                  />
                                  <div>
                                    <strong>{manager?.name}</strong>
                                    <br />
                                    <small className="text-muted">{manager?.department}</small>
                                  </div>
                                </div>
                              </td>
                              <td>{notification.title}</td>
                              <td>
                                <span className={`badge badge-${getTypeColor(notification.type)}`}>
                                  {notification.type}
                                </span>
                              </td>
                              <td>
                                <span className={`badge badge-${notification.read ? 'success' : 'warning'}`}>
                                  {notification.read ? 'Read' : 'Unread'}
                                </span>
                              </td>
                              <td>{new Date(notification.created_date).toLocaleDateString()}</td>
                              <td>
                                <div className="btn-group btn-group-sm">
                                  <button 
                                    className="btn btn-info btn-sm"
                                    onClick={() => handleViewNotification(notification)}
                                  >
                                    <i className="fas fa-eye"></i>
                                  </button>
                                  {!notification.read && (
                                    <button 
                                      className="btn btn-success btn-sm"
                                      onClick={() => handleMarkAsRead(notification.id)}
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
                    {filteredNotifications.map(notification => {
                      const manager = managers.find(mgr => mgr.id === notification.recipient_id)
                      return (
                        <div key={notification.id} className="job-card">
                          <div className="job-card-header">
                            <div>
                              <h5 className="job-card-title">{notification.title}</h5>
                              <div className="job-card-number">{manager?.name}</div>
                            </div>
                            <span className={`badge badge-${getTypeColor(notification.type)}`}>
                              {notification.type}
                            </span>
                          </div>
                          
                          <div className="job-card-meta">
                            <div className="meta-item">
                              <div className="meta-label">Manager</div>
                              <div className="meta-value">{manager?.name}</div>
                            </div>
                            <div className="meta-item">
                              <div className="meta-label">Department</div>
                              <div className="meta-value">{manager?.department}</div>
                            </div>
                            <div className="meta-item">
                              <div className="meta-label">Status</div>
                              <div className="meta-value">
                                <span className={`badge badge-${notification.read ? 'success' : 'warning'}`}>
                                  {notification.read ? 'Read' : 'Unread'}
                                </span>
                              </div>
                            </div>
                            <div className="meta-item">
                              <div className="meta-label">Date</div>
                              <div className="meta-value">{new Date(notification.created_date).toLocaleDateString()}</div>
                            </div>
                          </div>
                          
                          <div className="job-card-actions">
                            <div className="btn-group">
                              <button 
                                className="btn btn-info btn-sm"
                                onClick={() => handleViewNotification(notification)}
                              >
                                <i className="fas fa-eye mr-1"></i>
                                View
                              </button>
                              {!notification.read && (
                                <button 
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleMarkAsRead(notification.id)}
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

                {filteredNotifications.length === 0 && (
                  <div className="text-center py-4">
                    <i className="fas fa-bell fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No notifications found</h5>
                    <p className="text-muted">Try adjusting your search criteria</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Notification Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-eye mr-2"></i>
            Manager Notification Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNotification && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>From:</strong> {selectedNotification.from_user}
                </Col>
                <Col md={6}>
                  <strong>To:</strong> {managers.find(emp => emp.id === selectedNotification.employee_id)?.name || 'Unknown Manager'}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Type:</strong> 
                  <span className={`badge badge-${getTypeColor(selectedNotification.type)} ml-2`}>
                    {selectedNotification.type}
                  </span>
                </Col>
                <Col md={6}>
                  <strong>Status:</strong> 
                  <span className={`badge ${selectedNotification.read ? 'badge-success' : 'badge-warning'} ml-2`}>
                    {selectedNotification.read ? 'Read' : 'Unread'}
                  </span>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Date:</strong> {new Date(selectedNotification.created_date).toLocaleDateString()}
                </Col>
                <Col md={6}>
                  <strong>Time:</strong> {new Date(selectedNotification.created_date).toLocaleTimeString()}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <strong>Subject:</strong>
                  <p className="mt-2">{selectedNotification.subject}</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <strong>Message:</strong>
                  <div className="mt-2 p-3 bg-light rounded">
                    {selectedNotification.message}
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
          {!selectedNotification?.read && (
            <Button variant="success" onClick={() => {
              handleMarkAsRead(selectedNotification.id)
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

export default CeoNotifyManager
