import React, { useState } from 'react'
import { Card, Row, Col, Form, Button, Alert } from 'react-bootstrap'
import { toast } from 'react-toastify'

const ManagerApplyLeave = () => {
  const [formData, setFormData] = useState({
    leave_type: '',
    start_date: '',
    end_date: '',
    reason: '',
    emergency_contact: '',
    contact_number: ''
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
      
      toast.success('Leave request submitted successfully!')
      setFormData({
        leave_type: '',
        start_date: '',
        end_date: '',
        reason: '',
        emergency_contact: '',
        contact_number: ''
      })
    } catch (error) {
      toast.error('Failed to submit leave request')
    }
  }

  return (
    <div>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Apply For Leave</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="#">Manager</a></li>
                <li className="breadcrumb-item active">Apply Leave</li>
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
                    <i className="fas fa-calendar-minus mr-2"></i>
                    Leave Application Form
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Leave Type</Form.Label>
                          <Form.Select
                            name="leave_type"
                            value={formData.leave_type}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select Leave Type</option>
                            <option value="sick">Sick Leave</option>
                            <option value="vacation">Vacation Leave</option>
                            <option value="personal">Personal Leave</option>
                            <option value="emergency">Emergency Leave</option>
                            <option value="maternity">Maternity Leave</option>
                            <option value="paternity">Paternity Leave</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Start Date</Form.Label>
                          <Form.Control
                            type="date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>End Date</Form.Label>
                          <Form.Control
                            type="date"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Reason for Leave</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="reason"
                        value={formData.reason}
                        onChange={handleInputChange}
                        placeholder="Please provide a detailed reason for your leave request"
                        required
                      />
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Emergency Contact Person</Form.Label>
                          <Form.Control
                            type="text"
                            name="emergency_contact"
                            value={formData.emergency_contact}
                            onChange={handleInputChange}
                            placeholder="Name of emergency contact"
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Emergency Contact Number</Form.Label>
                          <Form.Control
                            type="tel"
                            name="contact_number"
                            value={formData.contact_number}
                            onChange={handleInputChange}
                            placeholder="Emergency contact phone number"
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Button type="submit" variant="primary" className="mr-2">
                      <i className="fas fa-paper-plane mr-1"></i>
                      Submit Leave Request
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
                    Leave Policy
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Alert variant="info">
                    <h6>Leave Types</h6>
                    <ul className="mb-0">
                      <li><strong>Sick Leave:</strong> 12 days per year</li>
                      <li><strong>Vacation Leave:</strong> 21 days per year</li>
                      <li><strong>Personal Leave:</strong> 5 days per year</li>
                      <li><strong>Emergency Leave:</strong> As needed</li>
                    </ul>
                  </Alert>
                  
                  <Alert variant="warning">
                    <h6>Important Notes</h6>
                    <ul className="mb-0">
                      <li>Submit requests at least 2 days in advance</li>
                      <li>Emergency leave can be submitted same day</li>
                      <li>All leave requests require approval</li>
                      <li>Provide valid emergency contact information</li>
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

export default ManagerApplyLeave
