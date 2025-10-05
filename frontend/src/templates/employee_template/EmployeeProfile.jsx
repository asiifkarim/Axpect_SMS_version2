import React, { useState } from 'react'
import { Card, Row, Col, Form, Button, Alert, Badge, Modal } from 'react-bootstrap'
import { toast } from 'react-toastify'

const EmployeeProfile = () => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@axpect.com',
    phone: '+1 (555) 123-4567',
    employeeId: 'EMP001',
    department: 'Software Development',
    position: 'Senior Developer',
    manager: 'Jane Smith',
    hireDate: '2022-01-15',
    address: '123 Main Street, New York, NY 10001',
    emergencyContact: 'Mary Doe',
    emergencyPhone: '+1 (555) 987-6543',
    skills: ['React', 'Node.js', 'Python', 'SQL'],
    certifications: ['AWS Certified Developer', 'Google Cloud Professional'],
    profilePic: null
  })

  const [editData, setEditData] = useState({ ...profileData })

  const handleEditProfile = () => {
    setEditData({ ...profileData })
    setShowEditModal(true)
  }

  const handleSaveProfile = () => {
    setProfileData({ ...editData })
    setShowEditModal(false)
    toast.success('Profile updated successfully!')
  }

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddSkill = (skill) => {
    if (skill && !editData.skills.includes(skill)) {
      setEditData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }))
    }
  }

  const handleRemoveSkill = (skillToRemove) => {
    setEditData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleAddCertification = (cert) => {
    if (cert && !editData.certifications.includes(cert)) {
      setEditData(prev => ({
        ...prev,
        certifications: [...prev.certifications, cert]
      }))
    }
  }

  const handleRemoveCertification = (certToRemove) => {
    setEditData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert !== certToRemove)
    }))
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
                <li className="breadcrumb-item"><a href="#">Employee</a></li>
                <li className="breadcrumb-item active">Profile</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <Row>
            {/* Profile Overview */}
            <Col lg={4}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-user mr-2"></i>
                    Profile Overview
                  </h3>
                </Card.Header>
                <Card.Body className="text-center">
                  <div className="mb-3">
                    <img
                      src={profileData.profilePic || '/images/default-avatar.png'}
                      alt="Profile"
                      className="rounded-circle"
                      style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                    />
                  </div>
                  <h4>{profileData.name}</h4>
                  <p className="text-muted">{profileData.position}</p>
                  <Badge bg="primary" className="mb-2">{profileData.department}</Badge>
                  <div className="mt-3">
                    <Button variant="primary" onClick={handleEditProfile}>
                      <i className="fas fa-edit mr-1"></i>
                      Edit Profile
                    </Button>
                  </div>
                </Card.Body>
              </Card>

              {/* Quick Stats */}
              <Card className="mt-3">
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-chart-bar mr-2"></i>
                    Quick Stats
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Row className="text-center">
                    <Col md={6}>
                      <h4 className="text-primary">2.5</h4>
                      <small>Years Experience</small>
                    </Col>
                    <Col md={6}>
                      <h4 className="text-success">4</h4>
                      <small>Skills</small>
                    </Col>
                  </Row>
                  <Row className="text-center mt-2">
                    <Col md={6}>
                      <h4 className="text-info">2</h4>
                      <small>Certifications</small>
                    </Col>
                    <Col md={6}>
                      <h4 className="text-warning">95%</h4>
                      <small>Performance</small>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            {/* Detailed Information */}
            <Col lg={8}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-info-circle mr-2"></i>
                    Personal Information
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label><strong>Full Name</strong></Form.Label>
                        <Form.Control plaintext readOnly value={profileData.name} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label><strong>Employee ID</strong></Form.Label>
                        <Form.Control plaintext readOnly value={profileData.employeeId} />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label><strong>Email</strong></Form.Label>
                        <Form.Control plaintext readOnly value={profileData.email} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label><strong>Phone</strong></Form.Label>
                        <Form.Control plaintext readOnly value={profileData.phone} />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label><strong>Department</strong></Form.Label>
                        <Form.Control plaintext readOnly value={profileData.department} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label><strong>Position</strong></Form.Label>
                        <Form.Control plaintext readOnly value={profileData.position} />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label><strong>Manager</strong></Form.Label>
                        <Form.Control plaintext readOnly value={profileData.manager} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label><strong>Hire Date</strong></Form.Label>
                        <Form.Control plaintext readOnly value={profileData.hireDate} />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label><strong>Address</strong></Form.Label>
                    <Form.Control plaintext readOnly value={profileData.address} />
                  </Form.Group>
                </Card.Body>
              </Card>

              {/* Skills and Certifications */}
              <Card className="mt-3">
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-tools mr-2"></i>
                    Skills & Certifications
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <h5>Skills</h5>
                      <div className="mb-2">
                        {profileData.skills.map((skill, index) => (
                          <Badge key={index} bg="primary" className="me-2 mb-1">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </Col>
                    <Col md={6}>
                      <h5>Certifications</h5>
                      <div className="mb-2">
                        {profileData.certifications.map((cert, index) => (
                          <Badge key={index} bg="success" className="me-2 mb-1">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Emergency Contact */}
              <Card className="mt-3">
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-phone mr-2"></i>
                    Emergency Contact
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label><strong>Contact Name</strong></Form.Label>
                        <Form.Control plaintext readOnly value={profileData.emergencyContact} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label><strong>Contact Phone</strong></Form.Label>
                        <Form.Control plaintext readOnly value={profileData.emergencyPhone} />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Edit Profile Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-edit mr-2"></i>
            Edit Profile
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={editData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={editData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
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
                    value={editData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    value={editData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Emergency Contact</Form.Label>
                  <Form.Control
                    type="text"
                    value={editData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Emergency Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    value={editData.emergencyPhone}
                    onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Skills</Form.Label>
                  <div className="mb-2">
                    {editData.skills.map((skill, index) => (
                      <Badge key={index} bg="primary" className="me-2 mb-1">
                        {skill}
                        <Button
                          variant="link"
                          size="sm"
                          className="text-white p-0 ms-1"
                          onClick={() => handleRemoveSkill(skill)}
                        >
                          <i className="fas fa-times"></i>
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <Form.Control
                    type="text"
                    placeholder="Add new skill"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddSkill(e.target.value)
                        e.target.value = ''
                      }
                    }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Certifications</Form.Label>
                  <div className="mb-2">
                    {editData.certifications.map((cert, index) => (
                      <Badge key={index} bg="success" className="me-2 mb-1">
                        {cert}
                        <Button
                          variant="link"
                          size="sm"
                          className="text-white p-0 ms-1"
                          onClick={() => handleRemoveCertification(cert)}
                        >
                          <i className="fas fa-times"></i>
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <Form.Control
                    type="text"
                    placeholder="Add new certification"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddCertification(e.target.value)
                        e.target.value = ''
                      }
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveProfile}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default EmployeeProfile
