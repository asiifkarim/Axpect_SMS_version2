import React, { useState } from 'react'
import { Card, Row, Col, Form, Button, Alert } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const ManagerCreateJobCard = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client: '',
    priority: 'medium',
    due_date: '',
    estimated_hours: '',
    assigned_to: '',
    department: '',
    notes: ''
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
      
      toast.success('Job card created successfully!')
      setFormData({
        title: '',
        description: '',
        client: '',
        priority: 'medium',
        due_date: '',
        estimated_hours: '',
        assigned_to: '',
        department: '',
        notes: ''
      })
    } catch (error) {
      toast.error('Failed to create job card')
    }
  }

  const handleCancel = () => {
    toast.info('Cancelling job card creation...')
    setTimeout(() => {
      navigate('/manager/job-card-dashboard')
    }, 500)
  }

  return (
    <div>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Create Job Card</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="#">Manager</a></li>
                <li className="breadcrumb-item active">Create Job Card</li>
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
                    <i className="fas fa-plus-circle mr-2"></i>
                    Create New Job Card
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Job Title</Form.Label>
                          <Form.Control
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Enter job title"
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Client</Form.Label>
                          <Form.Control
                            type="text"
                            name="client"
                            value={formData.client}
                            onChange={handleInputChange}
                            placeholder="Enter client name"
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter detailed job description"
                        required
                      />
                    </Form.Group>

                    <Row>
                      <Col md={4}>
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
                            <option value="urgent">Urgent</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Due Date</Form.Label>
                          <Form.Control
                            type="date"
                            name="due_date"
                            value={formData.due_date}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Estimated Hours</Form.Label>
                          <Form.Control
                            type="number"
                            name="estimated_hours"
                            value={formData.estimated_hours}
                            onChange={handleInputChange}
                            placeholder="Enter estimated hours"
                            min="1"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Assign To</Form.Label>
                          <Form.Select
                            name="assigned_to"
                            value={formData.assigned_to}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select Employee</option>
                            <option value="john_doe">John Doe</option>
                            <option value="jane_smith">Jane Smith</option>
                            <option value="mike_johnson">Mike Johnson</option>
                            <option value="sarah_wilson">Sarah Wilson</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Department</Form.Label>
                          <Form.Select
                            name="department"
                            value={formData.department}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select Department</option>
                            <option value="engineering">Engineering</option>
                            <option value="design">Design</option>
                            <option value="sales">Sales</option>
                            <option value="marketing">Marketing</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Additional Notes</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Enter any additional notes or requirements"
                      />
                    </Form.Group>

                    <Button type="submit" variant="primary" className="mr-2">
                      <i className="fas fa-save mr-1"></i>
                      Create Job Card
                    </Button>
                    <Button variant="secondary" type="button" onClick={handleCancel}>
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
                    Job Card Guidelines
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Alert variant="info">
                    <h6>Priority Levels</h6>
                    <ul className="mb-0">
                      <li><strong>Low:</strong> Can be completed within 2 weeks</li>
                      <li><strong>Medium:</strong> Should be completed within 1 week</li>
                      <li><strong>High:</strong> Must be completed within 3 days</li>
                      <li><strong>Urgent:</strong> Must be completed same day</li>
                    </ul>
                  </Alert>
                  
                  <Alert variant="success">
                    <h6>Best Practices</h6>
                    <ul className="mb-0">
                      <li>Provide clear and detailed descriptions</li>
                      <li>Set realistic due dates</li>
                      <li>Assign to appropriate team members</li>
                      <li>Include all necessary requirements</li>
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

export default ManagerCreateJobCard
