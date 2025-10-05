import React, { useState } from 'react'
import { Card, Row, Col, Form, Button, Alert, Table, Badge, Modal } from 'react-bootstrap'
import { toast } from 'react-toastify'

const EmployeeApplyLeave = () => {
  const [leaveForm, setLeaveForm] = useState({
    type: '',
    startDate: '',
    endDate: '',
    reason: '',
    emergencyContact: '',
    emergencyPhone: ''
  })

  const [showModal, setShowModal] = useState(false)
  const [submittedLeaves, setSubmittedLeaves] = useState([
    {
      id: 1,
      type: 'Sick Leave',
      startDate: '2024-01-15',
      endDate: '2024-01-17',
      days: 3,
      reason: 'Medical appointment and recovery',
      status: 'approved',
      submittedDate: '2024-01-10',
      approvedBy: 'Jane Smith'
    },
    {
      id: 2,
      type: 'Personal Leave',
      startDate: '2024-02-20',
      endDate: '2024-02-22',
      days: 3,
      reason: 'Family event',
      status: 'pending',
      submittedDate: '2024-01-12',
      approvedBy: 'Pending'
    }
  ])

  const leaveTypes = [
    { value: 'sick', label: 'Sick Leave', maxDays: 10 },
    { value: 'personal', label: 'Personal Leave', maxDays: 5 },
    { value: 'vacation', label: 'Vacation Leave', maxDays: 15 },
    { value: 'emergency', label: 'Emergency Leave', maxDays: 3 },
    { value: 'maternity', label: 'Maternity Leave', maxDays: 90 },
    { value: 'paternity', label: 'Paternity Leave', maxDays: 15 }
  ]

  const handleInputChange = (field, value) => {
    setLeaveForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const calculateDays = () => {
    if (leaveForm.startDate && leaveForm.endDate) {
      const start = new Date(leaveForm.startDate)
      const end = new Date(leaveForm.endDate)
      const diffTime = Math.abs(end - start)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      return diffDays
    }
    return 0
  }

  const handleSubmitLeave = () => {
    if (!leaveForm.type || !leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) {
      toast.error('Please fill in all required fields')
      return
    }

    const days = calculateDays()
    const selectedLeaveType = leaveTypes.find(t => t.value === leaveForm.type)
    
    if (days > selectedLeaveType.maxDays) {
      toast.error(`Maximum ${selectedLeaveType.maxDays} days allowed for ${selectedLeaveType.label}`)
      return
    }

    const newLeave = {
      id: Date.now(),
      ...leaveForm,
      days,
      status: 'pending',
      submittedDate: new Date().toLocaleDateString(),
      approvedBy: 'Pending'
    }

    setSubmittedLeaves(prev => [newLeave, ...prev])
    setLeaveForm({
      type: '',
      startDate: '',
      endDate: '',
      reason: '',
      emergencyContact: '',
      emergencyPhone: ''
    })
    setShowModal(false)
    toast.success('Leave application submitted successfully!')
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge bg="success">Approved</Badge>
      case 'pending':
        return <Badge bg="warning">Pending</Badge>
      case 'rejected':
        return <Badge bg="danger">Rejected</Badge>
      default:
        return <Badge bg="secondary">{status}</Badge>
    }
  }

  const handleCancelLeave = (leaveId) => {
    setSubmittedLeaves(prev => 
      prev.map(leave => 
        leave.id === leaveId ? { ...leave, status: 'cancelled' } : leave
      )
    )
    toast.success('Leave application cancelled')
  }

  return (
    <div>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Apply for Leave</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="#">Employee</a></li>
                <li className="breadcrumb-item active">Apply Leave</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          {/* Leave Balance */}
          <Row className="mb-4">
            <Col lg={12}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-calendar-check mr-2"></i>
                    Leave Balance
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={3}>
                      <div className="text-center">
                        <h4 className="text-primary">15</h4>
                        <p className="mb-0">Vacation Days</p>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="text-center">
                        <h4 className="text-success">10</h4>
                        <p className="mb-0">Sick Days</p>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="text-center">
                        <h4 className="text-info">5</h4>
                        <p className="mb-0">Personal Days</p>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="text-center">
                        <h4 className="text-warning">3</h4>
                        <p className="mb-0">Emergency Days</p>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Quick Actions */}
          <Row className="mb-4">
            <Col lg={12}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-plus mr-2"></i>
                    Apply for Leave
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Alert variant="info">
                    <h5 className="alert-heading">
                      <i className="fas fa-info-circle mr-2"></i>
                      Leave Application Guidelines
                    </h5>
                    <ul className="mb-0">
                      <li>Submit leave applications at least 48 hours in advance</li>
                      <li>Emergency leaves can be submitted with shorter notice</li>
                      <li>All leave applications require manager approval</li>
                      <li>Provide emergency contact information for longer leaves</li>
                    </ul>
                  </Alert>
                  <div className="text-center">
                    <Button variant="primary" size="lg" onClick={() => setShowModal(true)}>
                      <i className="fas fa-calendar-plus mr-2"></i>
                      Apply for Leave
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Leave History */}
          <Row>
            <Col lg={12}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-history mr-2"></i>
                    Leave Applications History
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>Leave Type</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Days</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Submitted Date</th>
                        <th>Approved By</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submittedLeaves.map((leave) => (
                        <tr key={leave.id}>
                          <td>
                            <strong>{leave.type}</strong>
                          </td>
                          <td>{leave.startDate}</td>
                          <td>{leave.endDate}</td>
                          <td>{leave.days}</td>
                          <td>{leave.reason}</td>
                          <td>{getStatusBadge(leave.status)}</td>
                          <td>{leave.submittedDate}</td>
                          <td>{leave.approvedBy}</td>
                          <td>
                            {leave.status === 'pending' && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleCancelLeave(leave.id)}
                              >
                                <i className="fas fa-times mr-1"></i>
                                Cancel
                              </Button>
                            )}
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

      {/* Leave Application Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-calendar-plus mr-2"></i>
            Apply for Leave
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Leave Type *</Form.Label>
                  <Form.Select
                    value={leaveForm.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                  >
                    <option value="">Select leave type...</option>
                    {leaveTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label} (Max: {type.maxDays} days)
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Total Days</Form.Label>
                  <Form.Control
                    type="text"
                    value={calculateDays() > 0 ? `${calculateDays()} days` : 'Select dates'}
                    readOnly
                    className="bg-light"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={leaveForm.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={leaveForm.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    min={leaveForm.startDate || new Date().toISOString().split('T')[0]}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Reason *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Please provide a reason for your leave..."
                value={leaveForm.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Emergency Contact</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Contact person name"
                    value={leaveForm.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Emergency Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Contact phone number"
                    value={leaveForm.emergencyPhone}
                    onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitLeave}>
            Submit Application
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default EmployeeApplyLeave
