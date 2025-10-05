import React, { useState } from 'react'
import { Card, Row, Col, Form, Button, Alert } from 'react-bootstrap'
import { toast } from 'react-toastify'

const ManagerFeedback = () => {
  const [feedbackType, setFeedbackType] = useState('general')
  const [formData, setFormData] = useState({
    recipient: '',
    subject: '',
    message: '',
    priority: 'medium'
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Feedback sent successfully!')
      setFormData({
        recipient: '',
        subject: '',
        message: '',
        priority: 'medium'
      })
    } catch (error) {
      toast.error('Failed to send feedback')
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
                <li className="breadcrumb-item"><a href="#">Manager</a></li>
                <li className="breadcrumb-item active">Feedback</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <Row>
            <Col lg={8}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-comment mr-2"></i>
                    Send Feedback
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Recipient</Form.Label>
                          <Form.Select
                            name="recipient"
                            value={formData.recipient}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select Recipient</option>
                            <option value="ceo">CEO</option>
                            <option value="hr">HR Department</option>
                            <option value="it">IT Department</option>
                            <option value="all_managers">All Managers</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Priority</Form.Label>
                          <Form.Select
                            name="priority"
                            value={formData.priority}
                            onChange={handleInputChange}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Subject</Form.Label>
                      <Form.Control
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Enter feedback subject"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Message</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={6}
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Enter your feedback message"
                        required
                      />
                    </Form.Group>

                    <Button type="submit" variant="primary" className="mr-2">
                      <i className="fas fa-paper-plane mr-1"></i>
                      Send Feedback
                    </Button>
                    <Button variant="secondary" type="button">
                      <i className="fas fa-times mr-1"></i>
                      Cancel
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-info-circle mr-2"></i>
                    Feedback Guidelines
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Alert variant="info">
                    <h6>Feedback Types</h6>
                    <ul className="mb-0">
                      <li><strong>General:</strong> General feedback and suggestions</li>
                      <li><strong>Issue:</strong> Report problems or concerns</li>
                      <li><strong>Improvement:</strong> Suggestions for improvement</li>
                      <li><strong>Appreciation:</strong> Positive feedback and recognition</li>
                    </ul>
                  </Alert>
                  
                  <Alert variant="success">
                    <h6>Best Practices</h6>
                    <ul className="mb-0">
                      <li>Be specific and constructive</li>
                      <li>Provide examples when possible</li>
                      <li>Use appropriate priority levels</li>
                      <li>Be professional and respectful</li>
                    </ul>
                  </Alert>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  )
}

export default ManagerFeedback
