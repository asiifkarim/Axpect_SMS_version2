import React, { useState } from 'react'
import { Card, Row, Col, Table, Badge, Button, Form, Modal } from 'react-bootstrap'
import { toast } from 'react-toastify'

const ManagerUpdateAttendance = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [editForm, setEditForm] = useState({
    check_in: '',
    check_out: '',
    status: '',
    notes: ''
  })

  // Mock attendance data
  const attendanceData = [
    {
      id: 1,
      employee_name: 'John Doe',
      date: '2024-01-15',
      check_in: '09:00 AM',
      check_out: '05:30 PM',
      hours_worked: 8.5,
      status: 'present',
      location: 'Office Building A',
      notes: ''
    },
    {
      id: 2,
      employee_name: 'Jane Smith',
      date: '2024-01-15',
      check_in: '08:45 AM',
      check_out: '05:15 PM',
      hours_worked: 8.5,
      status: 'present',
      location: 'Client Site B',
      notes: ''
    },
    {
      id: 3,
      employee_name: 'Mike Johnson',
      date: '2024-01-15',
      check_in: '09:15 AM',
      check_out: '05:45 PM',
      hours_worked: 8.5,
      status: 'late',
      location: 'Office Building A',
      notes: 'Traffic delay'
    },
    {
      id: 4,
      employee_name: 'Sarah Wilson',
      date: '2024-01-15',
      check_in: '08:30 AM',
      check_out: '05:00 PM',
      hours_worked: 8.5,
      status: 'present',
      location: 'Client Site C',
      notes: ''
    }
  ]

  const filteredData = attendanceData.filter(record =>
    record.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    record.date === selectedDate
  )

  const handleEdit = (record) => {
    setSelectedRecord(record)
    setEditForm({
      check_in: record.check_in,
      check_out: record.check_out,
      status: record.status,
      notes: record.notes
    })
    setShowEditModal(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleUpdate = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Attendance record updated successfully!')
      setShowEditModal(false)
    } catch (error) {
      toast.error('Failed to update attendance record')
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'present':
        return <Badge bg="success">Present</Badge>
      case 'absent':
        return <Badge bg="danger">Absent</Badge>
      case 'late':
        return <Badge bg="warning">Late</Badge>
      case 'half_day':
        return <Badge bg="info">Half Day</Badge>
      default:
        return <Badge bg="secondary">{status}</Badge>
    }
  }

  const calculateStats = () => {
    const total = filteredData.length
    const present = filteredData.filter(record => record.status === 'present').length
    const absent = filteredData.filter(record => record.status === 'absent').length
    const late = filteredData.filter(record => record.status === 'late').length
    const avgHours = filteredData.reduce((sum, record) => sum + record.hours_worked, 0) / total

    return { total, present, absent, late, avgHours }
  }

  const stats = calculateStats()

  return (
    <div>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">View/Update Attendance</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="#">Manager</a></li>
                <li className="breadcrumb-item active">Update Attendance</li>
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
                      <h4>{stats.total}</h4>
                      <p className="mb-0">Total Records</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-list fa-2x"></i>
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
                      <h4>{stats.present}</h4>
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
                      <h4>{stats.absent}</h4>
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
              <Card className="bg-info text-white">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4>{stats.avgHours.toFixed(1)}h</h4>
                      <p className="mb-0">Avg Hours</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-clock fa-2x"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Filters */}
          <Row className="mb-4">
            <Col lg={12}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-filter mr-2"></i>
                    Search & Filter
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Search Employee</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Search by name..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4} className="d-flex align-items-end">
                      <Button variant="primary" className="mr-2">
                        <i className="fas fa-sync mr-1"></i>
                        Refresh
                      </Button>
                      <Button variant="success">
                        <i className="fas fa-download mr-1"></i>
                        Export
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Attendance Table */}
          <Row>
            <Col lg={12}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-table mr-2"></i>
                    Attendance Records - {selectedDate}
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Date</th>
                        <th>Check-in</th>
                        <th>Check-out</th>
                        <th>Hours Worked</th>
                        <th>Status</th>
                        <th>Location</th>
                        <th>Notes</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((record) => (
                        <tr key={record.id}>
                          <td>{record.employee_name}</td>
                          <td>{record.date}</td>
                          <td>{record.check_in}</td>
                          <td>{record.check_out}</td>
                          <td>{record.hours_worked}h</td>
                          <td>{getStatusBadge(record.status)}</td>
                          <td>{record.location}</td>
                          <td>
                            {record.notes ? (
                              <span className="text-muted">{record.notes}</span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEdit(record)}
                            >
                              <i className="fas fa-edit"></i> Edit
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

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-edit mr-2"></i>
            Edit Attendance - {selectedRecord?.employee_name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Check-in Time</Form.Label>
                  <Form.Control
                    type="time"
                    name="check_in"
                    value={editForm.check_in}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Check-out Time</Form.Label>
                  <Form.Control
                    type="time"
                    name="check_out"
                    value={editForm.check_out}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={editForm.status}
                    onChange={handleInputChange}
                  >
                    <option value="present">Present</option>
                    <option value="late">Late</option>
                    <option value="half_day">Half Day</option>
                    <option value="absent">Absent</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={editForm.notes}
                onChange={handleInputChange}
                placeholder="Enter any additional notes"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Update Attendance
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default ManagerUpdateAttendance
