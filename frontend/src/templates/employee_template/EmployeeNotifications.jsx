import React, { useState } from 'react'
import { Card, Row, Col, Button, Badge, Alert, Modal, Form } from 'react-bootstrap'
import { toast } from 'react-toastify'

const EmployeeNotifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Task Assigned',
      message: 'You have been assigned a new task: "Website Redesign Project"',
      type: 'info',
      time: '2 hours ago',
      read: false,
      priority: 'high'
    },
    {
      id: 2,
      title: 'Salary Credited',
      message: 'Your salary for December 2024 has been credited to your account',
      type: 'success',
      time: '1 day ago',
      read: false,
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Leave Request Approved',
      message: 'Your leave request for January 15-17 has been approved',
      type: 'success',
      time: '2 days ago',
      read: true,
      priority: 'medium'
    },
    {
      id: 4,
      title: 'Team Meeting Reminder',
      message: 'Team meeting scheduled for today at 3:00 PM in Conference Room A',
      type: 'warning',
      time: '3 hours ago',
      read: false,
      priority: 'high'
    },
    {
      id: 5,
      title: 'Performance Review',
      message: 'Your quarterly performance review is scheduled for next week',
      type: 'info',
      time: '1 week ago',
      read: true,
      priority: 'low'
    }
  ])

  const [showModal, setShowModal] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
    toast.success('Notification marked as read')
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
    toast.success('All notifications marked as read')
  }

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
    toast.success('Notification deleted')
  }

  const viewNotification = (notification) => {
    setSelectedNotification(notification)
    if (!notification.read) {
      markAsRead(notification.id)
    }
    setShowModal(true)
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

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle text-success'
      case 'warning':
        return 'fas fa-exclamation-triangle text-warning'
      case 'danger':
        return 'fas fa-times-circle text-danger'
      default:
        return 'fas fa-info-circle text-info'
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  // Filter notifications based on search and filter
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'unread' && !notification.read) ||
                         (filterType === 'read' && notification.read) ||
                         notification.type === filterType ||
                         notification.priority === filterType
    return matchesSearch && matchesFilter
  })

  const handleRefresh = () => {
    toast.info('Refreshing notifications...')
    setTimeout(() => {
      toast.success('Notifications refreshed!')
    }, 1000)
  }

  const handleClearAll = () => {
    setNotifications([])
    toast.success('All notifications cleared!')
  }

  return (
    <div>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Notifications</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="#">Employee</a></li>
                <li className="breadcrumb-item active">Notifications</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          {/* Header with Actions */}
          <Row className="mb-4">
            <Col lg={12}>
              <Alert variant="info">
                <h4 className="alert-heading">
                  <i className="fas fa-bell mr-2"></i>
                  You have {unreadCount} unread notifications
                </h4>
                <div className="mt-2">
                  <Button variant="success" size="sm" onClick={markAllAsRead} className="mr-2">
                    <i className="fas fa-check mr-1"></i>
                    Mark All as Read
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleRefresh} className="mr-2">
                    <i className="fas fa-sync mr-1"></i>
                    Refresh
                  </Button>
                  <Button variant="danger" size="sm" onClick={handleClearAll}>
                    <i className="fas fa-trash mr-1"></i>
                    Clear All
                  </Button>
                </div>
              </Alert>
            </Col>
          </Row>

          {/* Search and Filter Controls */}
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
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Search Notifications</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Search by title or message..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Filter By</Form.Label>
                        <Form.Control
                          as="select"
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                        >
                          <option value="all">All Notifications</option>
                          <option value="unread">Unread Only</option>
                          <option value="read">Read Only</option>
                          <option value="high">High Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="low">Low Priority</option>
                          <option value="success">Success Messages</option>
                          <option value="warning">Warning Messages</option>
                          <option value="info">Info Messages</option>
                        </Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Notifications List */}
          <Row>
            <Col lg={12}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-list mr-2"></i>
                    All Notifications
                  </h3>
                </Card.Header>
                <Card.Body>
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="fas fa-bell-slash fa-3x text-muted mb-3"></i>
                      <h5>No notifications found</h5>
                      <p className="text-muted">
                        {searchTerm || filterType !== 'all' 
                          ? 'Try adjusting your search or filter criteria' 
                          : 'You\'re all caught up!'}
                      </p>
                    </div>
                  ) : (
                    <div className="timeline">
                      {filteredNotifications.map((notification) => (
                        <div key={notification.id} className={`timeline-item ${!notification.read ? 'unread' : ''}`} style={{
                          border: '1px solid #e9ecef',
                          borderRadius: '8px',
                          padding: '15px',
                          marginBottom: '15px',
                          backgroundColor: !notification.read ? '#f8f9fa' : '#ffffff',
                          cursor: 'pointer'
                        }}
                        onClick={() => viewNotification(notification)}>
                          <div className="d-flex align-items-start">
                            <div className="mr-3" style={{ fontSize: '20px' }}>
                              <i className={getTypeIcon(notification.type)}></i>
                            </div>
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1">
                                  <h5 className="mb-2" style={{ 
                                    fontWeight: !notification.read ? 'bold' : 'normal',
                                    color: !notification.read ? '#007bff' : '#333'
                                  }}>
                                    {notification.title}
                                    {!notification.read && <Badge bg="primary" className="ml-2">New</Badge>}
                                  </h5>
                                  <p className="mb-2 text-muted">{notification.message}</p>
                                  <div className="d-flex justify-content-between align-items-center">
                                    <small className="text-muted">
                                      <i className="fas fa-clock mr-1"></i>
                                      {notification.time}
                                    </small>
                                    <span>{getPriorityBadge(notification.priority)}</span>
                                  </div>
                                </div>
                                <div className="ml-3" onClick={(e) => e.stopPropagation()}>
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="mr-1"
                                    onClick={() => viewNotification(notification)}
                                    title="View Details"
                                  >
                                    <i className="fas fa-eye"></i>
                                  </Button>
                                  {!notification.read && (
                                    <Button
                                      variant="outline-success"
                                      size="sm"
                                      className="mr-1"
                                      onClick={() => markAsRead(notification.id)}
                                      title="Mark as Read"
                                    >
                                      <i className="fas fa-check"></i>
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => deleteNotification(notification.id)}
                                    title="Delete Notification"
                                  >
                                    <i className="fas fa-trash"></i>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Notification Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-bell mr-2"></i>
            {selectedNotification?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNotification && (
            <div>
              <div className="mb-3">
                <strong>Priority:</strong> {getPriorityBadge(selectedNotification.priority)}
              </div>
              <div className="mb-3">
                <strong>Time:</strong> {selectedNotification.time}
              </div>
              <div className="mb-3">
                <strong>Message:</strong>
                <p className="mt-2">{selectedNotification.message}</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          {selectedNotification && !selectedNotification.read && (
            <Button variant="success" onClick={() => {
              markAsRead(selectedNotification.id)
              setShowModal(false)
            }}>
              Mark as Read
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default EmployeeNotifications
