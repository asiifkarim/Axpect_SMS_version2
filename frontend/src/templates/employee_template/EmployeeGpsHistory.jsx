import React, { useState } from 'react'
import { Card, Row, Col, Table, Badge, Button, Form, Modal } from 'react-bootstrap'
import { toast } from 'react-toastify'

const EmployeeGpsHistory = () => {
  const [selectedDate, setSelectedDate] = useState('')
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)

  const locationHistory = [
    {
      id: 1,
      date: '2024-01-15',
      checkIn: '09:00 AM',
      checkOut: '06:00 PM',
      location: 'Office Building A',
      hours: 9,
      status: 'completed'
    },
    {
      id: 2,
      date: '2024-01-14',
      checkIn: '08:45 AM',
      checkOut: '05:30 PM',
      location: 'Client Site B',
      hours: 8.75,
      status: 'completed'
    },
    {
      id: 3,
      date: '2024-01-13',
      checkIn: '09:15 AM',
      checkOut: '06:15 PM',
      location: 'Office Building A',
      hours: 9,
      status: 'completed'
    },
    {
      id: 4,
      date: '2024-01-12',
      checkIn: '09:00 AM',
      checkOut: '06:00 PM',
      location: 'Office Building A',
      hours: 9,
      status: 'completed'
    },
    {
      id: 5,
      date: '2024-01-11',
      checkIn: '08:30 AM',
      checkOut: '05:45 PM',
      location: 'Client Site C',
      hours: 9.25,
      status: 'completed'
    }
  ]

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge bg="success">Completed</Badge>
      case 'incomplete':
        return <Badge bg="warning">Incomplete</Badge>
      default:
        return <Badge bg="secondary">{status}</Badge>
    }
  }

  const handleExportHistory = () => {
    toast.info('Exporting location history...')
    setTimeout(() => {
      toast.success('History exported successfully!')
    }, 2000)
  }

  const handleSearch = () => {
    if (selectedDate) {
      toast.info(`Searching for records on ${new Date(selectedDate).toLocaleDateString()}...`)
      setTimeout(() => {
        toast.success('Search completed!')
      }, 1000)
    } else {
      toast.info('Searching all records...')
      setTimeout(() => {
        toast.success('Search completed!')
      }, 1000)
    }
  }

  const handleViewRecord = (record) => {
    setSelectedRecord(record)
    setShowViewModal(true)
  }

  return (
    <div>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">GPS History</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="#">Employee</a></li>
                <li className="breadcrumb-item active">GPS History</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          {/* Filters */}
          <Row className="mb-4">
            <Col lg={12}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-filter mr-2"></i>
                    Filter History
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Date Range</Form.Label>
                        <Form.Control
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4} className="d-flex align-items-end">
                      <Button variant="primary" className="mr-2" onClick={handleSearch}>
                        <i className="fas fa-search mr-1"></i>
                        Search
                      </Button>
                      <Button variant="success" onClick={handleExportHistory}>
                        <i className="fas fa-download mr-1"></i>
                        Export
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* History Table */}
          <Row>
            <Col lg={12}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-history mr-2"></i>
                    Location History
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Location</th>
                        <th>Hours Worked</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {locationHistory.map((record) => (
                        <tr key={record.id}>
                          <td>
                            <strong>{new Date(record.date).toLocaleDateString()}</strong>
                          </td>
                          <td>{record.checkIn}</td>
                          <td>{record.checkOut}</td>
                          <td>{record.location}</td>
                          <td>{record.hours} hours</td>
                          <td>{getStatusBadge(record.status)}</td>
                          <td>
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleViewRecord(record)}
                            >
                              <i className="fas fa-eye"></i>
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

      {/* View Record Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-eye mr-2"></i>
            Location Record Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRecord && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Date:</strong> {new Date(selectedRecord.date).toLocaleDateString()}
                </Col>
                <Col md={6}>
                  <strong>Status:</strong> {getStatusBadge(selectedRecord.status)}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Check In Time:</strong> {selectedRecord.checkIn}
                </Col>
                <Col md={6}>
                  <strong>Check Out Time:</strong> {selectedRecord.checkOut}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Location:</strong> {selectedRecord.location}
                </Col>
                <Col md={6}>
                  <strong>Hours Worked:</strong> {selectedRecord.hours} hours
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <strong>Work Summary:</strong>
                  <div className="mt-2 p-3 bg-light rounded">
                    <p className="mb-1">
                      <i className="fas fa-clock mr-2"></i>
                      Total work time: {selectedRecord.hours} hours
                    </p>
                    <p className="mb-1">
                      <i className="fas fa-map-marker-alt mr-2"></i>
                      Work location: {selectedRecord.location}
                    </p>
                    <p className="mb-0">
                      <i className="fas fa-calendar mr-2"></i>
                      Work date: {new Date(selectedRecord.date).toLocaleDateString()}
                    </p>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
          <Button variant="success" onClick={() => {
            setShowViewModal(false)
            handleExportHistory()
          }}>
            <i className="fas fa-download mr-1"></i>
            Export This Record
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default EmployeeGpsHistory
