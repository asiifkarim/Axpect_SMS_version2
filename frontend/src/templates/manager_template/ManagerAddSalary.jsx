import React, { useState } from 'react'
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap'
import { toast } from 'react-toastify'

const ManagerAddSalary = () => {
  const [formData, setFormData] = useState({
    employee_id: '',
    basic_salary: '',
    allowances: '',
    deductions: '',
    effective_date: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Salary record added successfully!')
      setFormData({
        employee_id: '',
        basic_salary: '',
        allowances: '',
        deductions: '',
        effective_date: '',
        notes: ''
      })
    } catch (error) {
      toast.error('Failed to add salary record')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Add Salary</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="#">Manager</a></li>
                <li className="breadcrumb-item active">Add Salary</li>
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
                    <i className="fas fa-dollar-sign mr-2"></i>
                    Add New Salary Record
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Employee</Form.Label>
                          <Form.Select
                            name="employee_id"
                            value={formData.employee_id}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select Employee</option>
                            <option value="1">John Doe</option>
                            <option value="2">Jane Smith</option>
                            <option value="3">Mike Johnson</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Basic Salary</Form.Label>
                          <Form.Control
                            type="number"
                            name="basic_salary"
                            value={formData.basic_salary}
                            onChange={handleInputChange}
                            placeholder="Enter basic salary"
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Allowances</Form.Label>
                          <Form.Control
                            type="number"
                            name="allowances"
                            value={formData.allowances}
                            onChange={handleInputChange}
                            placeholder="Enter allowances"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Deductions</Form.Label>
                          <Form.Control
                            type="number"
                            name="deductions"
                            value={formData.deductions}
                            onChange={handleInputChange}
                            placeholder="Enter deductions"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Effective Date</Form.Label>
                          <Form.Control
                            type="date"
                            name="effective_date"
                            value={formData.effective_date}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Notes</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Enter any additional notes"
                      />
                    </Form.Group>

                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isSubmitting}
                      className="mr-2"
                    >
                      {isSubmitting ? 'Adding...' : 'Add Salary Record'}
                    </Button>
                    <Button variant="secondary" type="button">
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
                    Salary Guidelines
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Alert variant="info">
                    <h5>Salary Structure</h5>
                    <ul className="mb-0">
                      <li>Basic Salary: Core compensation</li>
                      <li>Allowances: Additional benefits</li>
                      <li>Deductions: Taxes, insurance, etc.</li>
                      <li>Net Salary: Basic + Allowances - Deductions</li>
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

export default ManagerAddSalary
