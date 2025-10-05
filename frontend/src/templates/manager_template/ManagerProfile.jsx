import React, { useState } from 'react'
import { Card, Row, Col, Form, Button, Alert } from 'react-bootstrap'
import { toast } from 'react-toastify'

const ManagerProfile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: 'Jane Manager',
    email: 'manager@axpecttech.com',
    phone: '+1-555-0101',
    department: 'Engineering',
    position: 'Engineering Manager',
    hire_date: '2021-03-10'
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  return (
    <div>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">My Profile</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="#">Manager</a></li>
                <li className="breadcrumb-item active">Profile</li>
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
                    <i className="fas fa-user mr-2"></i>
                    Profile Information
                  </h3>
                  <div className="card-tools">
                    <Button
                      variant={isEditing ? "success" : "primary"}
                      onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    >
                      <i className={`fas fa-${isEditing ? 'save' : 'edit'} mr-1`}></i>
                      {isEditing ? 'Save Changes' : 'Edit Profile'}
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Form>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Full Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Phone</Form.Label>
                          <Form.Control
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Department</Form.Label>
                          <Form.Control
                            type="text"
                            name="department"
                            value={formData.department}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Position</Form.Label>
                          <Form.Control
                            type="text"
                            name="position"
                            value={formData.position}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Hire Date</Form.Label>
                          <Form.Control
                            type="date"
                            name="hire_date"
                            value={formData.hire_date}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-info-circle mr-2"></i>
                    Profile Summary
                  </h3>
                </Card.Header>
                <Card.Body>
                  <div className="text-center mb-3">
                    <img
                      src="/images/default-avatar.png"
                      alt="Profile"
                      className="img-circle img-fluid"
                      style={{ width: '100px', height: '100px' }}
                    />
                  </div>
                  <Alert variant="info">
                    <h6>Manager Role</h6>
                    <p className="mb-0">You have access to team management features including attendance, salary, and GPS tracking.</p>
                  </Alert>
                  <Alert variant="success">
                    <h6>Team Size</h6>
                    <p className="mb-0">You are managing 12 employees across different departments.</p>
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

export default ManagerProfile
