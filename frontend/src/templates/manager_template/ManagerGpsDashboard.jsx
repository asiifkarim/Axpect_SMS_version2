import React, { useState } from 'react'
import { Card, Row, Col, Table, Badge, Button, Form } from 'react-bootstrap'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { toast } from 'react-toastify'

const ManagerGpsDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedEmployee, setSelectedEmployee] = useState('all')

  // Mock GPS data
  const gpsData = [
    {
      id: 1,
      employee_name: 'John Doe',
      location: 'Office Building A',
      latitude: 40.7128,
      longitude: -74.0060,
      check_in: '09:00 AM',
      check_out: '05:30 PM',
      status: 'present',
      last_update: '2 minutes ago'
    },
    {
      id: 2,
      employee_name: 'Jane Smith',
      location: 'Client Site B',
      latitude: 40.7589,
      longitude: -73.9851,
      check_in: '08:45 AM',
      check_out: null,
      status: 'working',
      last_update: '5 minutes ago'
    },
    {
      id: 3,
      employee_name: 'Mike Johnson',
      location: 'Office Building A',
      latitude: 40.7128,
      longitude: -74.0060,
      check_in: '09:15 AM',
      check_out: null,
      status: 'working',
      last_update: '1 minute ago'
    }
  ]

  const getStatusBadge = (status) => {
    switch (status) {
      case 'present':
        return <Badge bg="success">Present</Badge>
      case 'working':
        return <Badge bg="primary">Working</Badge>
      case 'absent':
        return <Badge bg="danger">Absent</Badge>
      default:
        return <Badge bg="secondary">{status}</Badge>
    }
  }

  const filteredData = gpsData.filter(employee => {
    if (selectedEmployee !== 'all' && employee.employee_name !== selectedEmployee) {
      return false
    }
    return true
  })

  const center = [40.7128, -74.0060] // Default center (Office Building A)

  return (
    <div>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Team GPS Dashboard</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="#">Manager</a></li>
                <li className="breadcrumb-item active">GPS Dashboard</li>
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
                      <h4>{gpsData.length}</h4>
                      <p className="mb-0">Total Team Members</p>
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
                      <h4>{gpsData.filter(emp => emp.status === 'present' || emp.status === 'working').length}</h4>
                      <p className="mb-0">Currently Working</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-map-marker-alt fa-2x"></i>
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
                      <h4>{gpsData.filter(emp => emp.check_out === null).length}</h4>
                      <p className="mb-0">Still Working</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-clock fa-2x"></i>
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
                      <h4>95%</h4>
                      <p className="mb-0">Attendance Rate</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-chart-line fa-2x"></i>
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
                    Filters
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
                        <Form.Label>Employee</Form.Label>
                        <Form.Select
                          value={selectedEmployee}
                          onChange={(e) => setSelectedEmployee(e.target.value)}
                        >
                          <option value="all">All Employees</option>
                          {gpsData.map(emp => (
                            <option key={emp.id} value={emp.employee_name}>
                              {emp.employee_name}
                            </option>
                          ))}
                        </Form.Select>
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

          {/* Map and Table */}
          <Row>
            <Col lg={8}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-map mr-2"></i>
                    Team Locations Map
                  </h3>
                </Card.Header>
                <Card.Body>
                  <div style={{ height: '400px', width: '100%' }}>
                    <MapContainer
                      center={center}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      {filteredData.map((employee) => (
                        <Marker
                          key={employee.id}
                          position={[employee.latitude, employee.longitude]}
                        >
                          <Popup>
                            <div>
                              <h6>{employee.employee_name}</h6>
                              <p><strong>Location:</strong> {employee.location}</p>
                              <p><strong>Check-in:</strong> {employee.check_in}</p>
                              <p><strong>Status:</strong> {employee.status}</p>
                              <p><strong>Last Update:</strong> {employee.last_update}</p>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-list mr-2"></i>
                    Team Status
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Table responsive size="sm">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Status</th>
                        <th>Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((employee) => (
                        <tr key={employee.id}>
                          <td>{employee.employee_name}</td>
                          <td>{getStatusBadge(employee.status)}</td>
                          <td>
                            <small>{employee.location}</small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Detailed Table */}
          <Row className="mt-4">
            <Col lg={12}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-table mr-2"></i>
                    Detailed GPS Records
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Location</th>
                        <th>Check-in</th>
                        <th>Check-out</th>
                        <th>Status</th>
                        <th>Last Update</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((employee) => (
                        <tr key={employee.id}>
                          <td>{employee.employee_name}</td>
                          <td>{employee.location}</td>
                          <td>{employee.check_in}</td>
                          <td>{employee.check_out || 'Still Working'}</td>
                          <td>{getStatusBadge(employee.status)}</td>
                          <td>{employee.last_update}</td>
                          <td>
                            <Button variant="outline-primary" size="sm">
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
    </div>
  )
}

export default ManagerGpsDashboard
