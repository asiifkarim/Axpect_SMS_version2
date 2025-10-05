import React, { useState } from 'react'
import { Card, Form, Button, Row, Col, Alert, Modal } from 'react-bootstrap'
import { toast } from 'react-toastify'

const ManagerTakeAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // Mock employee data
  const employees = [
    { id: 1, name: 'John Doe', department: 'Engineering', position: 'Developer' },
    { id: 2, name: 'Jane Smith', department: 'Engineering', position: 'Designer' },
    { id: 3, name: 'Mike Johnson', department: 'Sales', position: 'Sales Rep' },
    { id: 4, name: 'Sarah Wilson', department: 'Marketing', position: 'Marketing Specialist' }
  ]

  const handleAttendanceChange = (employeeId, status) => {
    setAttendanceData(prev => {
      const existing = prev.find(item => item.employee_id === employeeId)
      if (existing) {
        return prev.map(item =>
          item.employee_id === employeeId ? { ...item, status } : item
        )
      } else {
        return [...prev, { employee_id: employeeId, status, date: selectedDate }]
      }
    })
  }

  const getAttendanceStatus = (employeeId) => {
    const record = attendanceData.find(item => item.employee_id === employeeId)
    return record ? record.status : 'not_marked'
  }

  const handleSubmit = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Attendance recorded successfully!')
      setAttendanceData([])
      setShowConfirmModal(false)
    } catch (error) {
      toast.error('Failed to record attendance')
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'present':
        return <span className="badge badge-success">Present</span>
      case 'absent':
        return <span className="badge badge-danger">Absent</span>
      case 'late':
        return <span className="badge badge-warning">Late</span>
      case 'half_day':
        return <span className="badge badge-info">Half Day</span>
      default:
        return <span className="badge badge-secondary">Not Marked</span>
    }
  }

  const getStatusCounts = () => {
    const counts = { present: 0, absent: 0, late: 0, half_day: 0, not_marked: 0 }
    employees.forEach(employee => {
      const status = getAttendanceStatus(employee.id)
      counts[status]++
    })
    return counts
  }

  const counts = getStatusCounts()

  return (
    <div>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Take Attendance</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="#">Manager</a></li>
                <li className="breadcrumb-item active">Take Attendance</li>
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
                      <h4>{employees.length}</h4>
                      <p className="mb-0">Total Employees</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-users fa-2x"></i>
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
                      <h4>{counts.present}</h4>
                      <p className="mb-0">Present</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-check-circle fa-2x"></i>
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
                      <h4>{counts.absent}</h4>
                      <p className="mb-0">Absent</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-times-circle fa-2x"></i>
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
                      <h4>{counts.late}</h4>
                      <p className="mb-0">Late</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-clock fa-2x"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Attendance Form */}
          <Row>
            <Col lg={8}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-calendar-check mr-2"></i>
                    Mark Attendance
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Form>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Date</Form.Label>
                          <Form.Control
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th>Employee</th>
                            <th>Department</th>
                            <th>Position</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {employees.map((employee) => (
                            <tr key={employee.id}>
                              <td>
                                <strong>{employee.name}</strong>
                              </td>
                              <td>{employee.department}</td>
                              <td>{employee.position}</td>
                              <td>{getStatusBadge(getAttendanceStatus(employee.id))}</td>
                              <td>
                                <div className="btn-group" role="group">
                                  <Button
                                    variant={getAttendanceStatus(employee.id) === 'present' ? 'success' : 'outline-success'}
                                    size="sm"
                                    onClick={() => handleAttendanceChange(employee.id, 'present')}
                                  >
                                    Present
                                  </Button>
                                  <Button
                                    variant={getAttendanceStatus(employee.id) === 'late' ? 'warning' : 'outline-warning'}
                                    size="sm"
                                    onClick={() => handleAttendanceChange(employee.id, 'late')}
                                  >
                                    Late
                                  </Button>
                                  <Button
                                    variant={getAttendanceStatus(employee.id) === 'half_day' ? 'info' : 'outline-info'}
                                    size="sm"
                                    onClick={() => handleAttendanceChange(employee.id, 'half_day')}
                                  >
                                    Half Day
                                  </Button>
                                  <Button
                                    variant={getAttendanceStatus(employee.id) === 'absent' ? 'danger' : 'outline-danger'}
                                    size="sm"
                                    onClick={() => handleAttendanceChange(employee.id, 'absent')}
                                  >
                                    Absent
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-3">
                      <Button
                        variant="primary"
                        onClick={() => setShowConfirmModal(true)}
                        disabled={attendanceData.length === 0}
                      >
                        <i className="fas fa-save mr-1"></i>
                        Save Attendance
                      </Button>
                      <Button variant="secondary" className="ml-2">
                        <i className="fas fa-times mr-1"></i>
                        Cancel
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-info-circle mr-2"></i>
                    Attendance Guidelines
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Alert variant="info">
                    <h6>Attendance Status:</h6>
                    <ul className="mb-0">
                      <li><strong>Present:</strong> Employee is present and working</li>
                      <li><strong>Late:</strong> Employee arrived late</li>
                      <li><strong>Half Day:</strong> Employee worked half day</li>
                      <li><strong>Absent:</strong> Employee is not present</li>
                    </ul>
                  </Alert>
                  
                  <Alert variant="warning">
                    <h6>Important Notes:</h6>
                    <ul className="mb-0">
                      <li>Attendance can only be marked once per day</li>
                      <li>Changes require manager approval</li>
                      <li>Late arrivals should be documented</li>
                    </ul>
                  </Alert>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Attendance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to save the attendance for <strong>{selectedDate}</strong>?</p>
          <div className="mt-3">
            <h6>Summary:</h6>
            <ul>
              <li>Present: {counts.present}</li>
              <li>Late: {counts.late}</li>
              <li>Half Day: {counts.half_day}</li>
              <li>Absent: {counts.absent}</li>
            </ul>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Confirm & Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default ManagerTakeAttendance
