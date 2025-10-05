import React, { useState } from 'react'
import { Card, Row, Col, Form, Button, Alert, Modal, Badge } from 'react-bootstrap'
import { toast } from 'react-toastify'

const EmployeeFeedback = () => {
  const [feedbackForm, setFeedbackForm] = useState({
    type: '',
    subject: '',
    message: '',
    priority: 'medium',
    anonymous: false
  })

  const [showModal, setShowModal] = useState(false)
  const [submittedFeedback, setSubmittedFeedback] = useState([])

  const feedbackTypes = [
    { value: 'general', label: 'General Feedback' },
    { value: 'suggestion', label: 'Suggestion' },
    { value: 'complaint', label: 'Complaint' },
    { value: 'appreciation', label: 'Appreciation' },
    { value: 'improvement', label: 'Process Improvement' }
  ]

  const handleInputChange = (field, value) => {
    setFeedbackForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmitFeedback = () => {
    if (!feedbackForm.type || !feedbackForm.subject || !feedbackForm.message) {
      toast.error('Please fill in all required fields')
      return
    }

    const newFeedback = {
      id: Date.now(),
      ...feedbackForm,
      status: 'submitted',
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    }

    setSubmittedFeedback(prev => [newFeedback, ...prev])
    setFeedbackForm({
      type: '',
      subject: '',
      message: '',
      priority: 'medium',
      anonymous: false
    })
    setShowModal(false)
    toast.success('Feedback submitted successfully!')
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'submitted':
        return <Badge bg="info">Submitted</Badge>
      case 'under_review':
        return <Badge bg="warning">Under Review</Badge>
      case 'resolved':
        return <Badge bg="success">Resolved</Badge>
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

  return (
    <div>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Feedback</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="#">Employee</a></li>
                <li className="breadcrumb-item active">Feedback</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          {/* Quick Actions */}
          <Row className="mb-4">
            <Col lg={12}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-comment-dots mr-2"></i>
                    Submit Feedback
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Alert variant="info">
                    <h5 className="alert-heading">
                      <i className="fas fa-info-circle mr-2"></i>
                      Share Your Feedback
                    </h5>
                    <p className="mb-0">
                      Your feedback helps us improve our workplace environment and processes. 
                      All feedback is confidential and will be reviewed by the HR team.
                    </p>
                  </Alert>
                  <div className="text-center">
                    <Button variant="primary" size="lg" onClick={() => setShowModal(true)}>
                      <i className="fas fa-plus mr-2"></i>
                      Submit New Feedback
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Submitted Feedback */}
          <Row>
            <Col lg={12}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-history mr-2"></i>
                    My Submitted Feedback
                  </h3>
                </Card.Header>
                <Card.Body>
                  {submittedFeedback.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="fas fa-comment-slash fa-3x text-muted mb-3"></i>
                      <h5>No feedback submitted yet</h5>
                      <p className="text-muted">Submit your first feedback to get started!</p>
                    </div>
                  ) : (
                    <div className="timeline">
                      {submittedFeedback.map((feedback) => (
                        <div key={feedback.id} className="timeline-item">
                          <i className="fas fa-comment text-primary"></i>
                          <div className="timeline-item-content">
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <h4 className="timeline-header">
                                  {feedback.subject}
                                  {getStatusBadge(feedback.status)}
                                </h4>
                                <p className="timeline-body">{feedback.message}</p>
                                <div className="timeline-footer">
                                  <small className="text-muted">
                                    <i className="fas fa-calendar mr-1"></i>
                                    {feedback.date} at {feedback.time}
                                  </small>
                                  <span className="ml-3">{getPriorityBadge(feedback.priority)}</span>
                                  <span className="ml-3">
                                    <Badge bg="secondary">
                                      {feedbackTypes.find(t => t.value === feedback.type)?.label}
                                    </Badge>
                                  </span>
                                  {feedback.anonymous && (
                                    <Badge bg="info" className="ml-2">Anonymous</Badge>
                                  )}
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

      {/* Feedback Form Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-comment-dots mr-2"></i>
            Submit Feedback
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Feedback Type *</Form.Label>
                  <Form.Select
                    value={feedbackForm.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                  >
                    <option value="">Select type...</option>
                    {feedbackTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Priority</Form.Label>
                  <Form.Select
                    value={feedbackForm.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Subject *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Brief description of your feedback"
                value={feedbackForm.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Message *</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                placeholder="Please provide detailed feedback..."
                value={feedbackForm.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Submit anonymously"
                checked={feedbackForm.anonymous}
                onChange={(e) => handleInputChange('anonymous', e.target.checked)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitFeedback}>
            Submit Feedback
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default EmployeeFeedback
