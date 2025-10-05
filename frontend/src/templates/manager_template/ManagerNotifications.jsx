import React, { useState } from 'react'
import { Card, Row, Col, Table, Badge, Button, Form, Modal } from 'react-bootstrap'
import { toast } from 'react-toastify'

const ManagerNotifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Leave Request',
      message: 'John Doe has submitted a leave request for 2 days',
      type: 'leave_request',
      date: '2024-01-15',
      time: '10:30 AM',
      read: false,
      priority: 'high'
    },
    {
      id: 2,
      title: 'Attendance Alert',
      message: 'Mike Johnson is running late today',
      type: 'attendance',
      date: '2024-01-15',
      time: '09:15 AM',
      read: false,
      priority: 'medium'
    },
    {
      id: 3,
      title: 'System Update',
      message: 'New features have been added to the GPS tracking system',
      type: 'system',
      date: '2024-01-14',
      time: '02:00 PM',
      read: true,
      priority: 'low'
    }
  ])

  const [selectedNotification, setSelectedNotification] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const handleMarkAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    )
    toast.success('Notification marked as read')
  }

  const handleViewNotification = (notification) => {
    setSelectedNotification(notification)
    if (!notification.read) {
      handleMarkAsRead(notification.id)
    }
    setShowModal(true)
  }

  const handleDeleteNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
    toast.success('Notification deleted')
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
      case 'leave_request':
        return 'fas fa-calendar-minus'
      case 'attendance':
        return 'fas fa-clock'
      case 'system':
        return 'fas fa-cog'
      default:
        return 'fas fa-bell'
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">View Notifications</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="#">Manager</a></li>
                <li className="breadcrumb-item active">Notifications</li>
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
                      <h4>{notifications.length}</h4>
                      <p className="mb-0">Total Notifications</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-bell fa-2x"></i>
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
                      <h4>{unreadCount}</h4>
                      <p className="mb-0">Unread</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-exclamation-circle fa-2x"></i>
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
                      <h4>{notifications.filter(n => n.priority === 'high').length}</h4>
                      <p className="mb-0">High Priority</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-exclamation-triangle fa-2x"></i>
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
                      <h4>{notifications.filter(n => n.read).length}</h4>
                      <p className="mb-0">Read</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-check-circle fa-2x"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Notifications Table */}
          <Row>
            <Col lg={12}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-list mr-2"></i>
                    Notifications
                  </h3>
                  <div className="card-tools">
                    <Button variant="outline-primary" size="sm">
                      <i className="fas fa-sync mr-1"></i>
                      Refresh
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Title</th>
                        <th>Message</th>
                        <th>Priority</th>
                        <th>Date & Time</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notifications.map((notification) => (
                        <tr key={notification.id} className={!notification.read ? 'table-warning' : ''}>
                          <td>
                            <i className={`${getTypeIcon(notification.type)} mr-2`}></i>
                            {notification.type.replace('_', ' ').toUpperCase()}
                          </td>
                          <td>
                            <strong>{notification.title}</strong>
                            {!notification.read && <span className="badge badge-danger ml-2">NEW</span>}
                          </td>
                          <td>
                            <span className="text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
                              {notification.message}
                            </span>
                          </td>
                          <td>{getPriorityBadge(notification.priority)}</td>
                          <td>
                            <small>
                              {notification.date}<br />
                              {notification.time}
                            </small>
                          </td>
                          <td>
                            {notification.read ? (
                              <Badge bg="success">Read</Badge>
                            ) : (
                              <Badge bg="warning">Unread</Badge>
                            )}
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleViewNotification(notification)}
                              className="mr-1"
                            >
                              <i className="fas fa-eye"></i>
                            </Button>
                            {!notification.read && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="mr-1"
                              >
                                <i className="fas fa-check"></i>
                              </Button>
                            )}
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteNotification(notification.id)}
                            >
                              <i className="fas fa-trash"></i>
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

      {/* Notification Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className={`${getTypeIcon(selectedNotification?.type)} mr-2`}></i>
            {selectedNotification?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNotification && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Priority:</strong> {getPriorityBadge(selectedNotification.priority)}
                </Col>
                <Col md={6}>
                  <strong>Type:</strong> {selectedNotification.type.replace('_', ' ').toUpperCase()}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Date:</strong> {selectedNotification.date}
                </Col>
                <Col md={6}>
                  <strong>Time:</strong> {selectedNotification.time}
                </Col>
              </Row>
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
            <Button variant="success" onClick={() => handleMarkAsRead(selectedNotification.id)}>
              Mark as Read
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default ManagerNotifications
