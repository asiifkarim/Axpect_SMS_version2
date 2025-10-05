import React, { useState } from 'react'
import { Card, Row, Col, Table, Badge, Button, Form, Modal } from 'react-bootstrap'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { toast } from 'react-toastify'

const ManagerEmployeeLocations = () => {
  const [selectedEmployee, setSelectedEmployee] = useState('all')
  const [showMapModal, setShowMapModal] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)

  // Mock employee location data
  const locationData = [
    {
      id: 1,
      employee_name: 'John Doe',
      current_location: 'Office Building A',
      latitude: 40.7128,
      longitude: -74.0060,
      check_in_time: '09:00 AM',
      last_seen: '2 minutes ago',
      status: 'working',
      work_type: 'Office Work'
    },
    {
      id: 2,
      employee_name: 'Jane Smith',
      current_location: 'Client Site B',
      latitude: 40.7589,
      longitude: -73.9851,
      check_in_time: '08:45 AM',
      last_seen: '5 minutes ago',
      status: 'working',
      work_type: 'Field Work'
    },
    {
      id: 3,
      employee_name: 'Mike Johnson',
      current_location: 'Office Building A',
      latitude: 40.7128,
      longitude: -74.0060,
      check_in_time: '09:15 AM',
      last_seen: '1 minute ago',
      status: 'working',
      work_type: 'Office Work'
    },
    {
      id: 4,
      employee_name: 'Sarah Wilson',
      current_location: 'Client Site C',
      latitude: 40.7831,
      longitude: -73.9712,
      check_in_time: '08:30 AM',
      last_seen: '3 minutes ago',
      status: 'working',
      work_type: 'Field Work'
    }
  ]

  const filteredData = locationData.filter(employee => {
    if (selectedEmployee !== 'all' && employee.employee_name !== selectedEmployee) {
      return false
    }
    return true
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'working':
        return <Badge bg="success">Working</Badge>
      case 'break':
        return <Badge bg="warning">On Break</Badge>
      case 'offline':
        return <Badge bg="danger">Offline</Badge>
      default:
        return <Badge bg="secondary">{status}</Badge>
    }
  }

  const getWorkTypeBadge = (workType) => {
    switch (workType) {
      case 'Office Work':
        return <Badge bg="primary">Office</Badge>
      case 'Field Work':
        return <Badge bg="info">Field</Badge>
      default:
        return <Badge bg="secondary">{workType}</Badge>
    }
  }

  const handleViewMap = (employee) => {
    setSelectedLocation(employee)
    setShowMapModal(true)
  }

  const handleRefreshLocations = () => {
    toast.info('Refreshing employee locations...')
    // In a real app, this would fetch fresh data from the server
    setTimeout(() => {
      toast.success('Locations refreshed successfully!')
    }, 1500)
  }

  const handleExportReport = () => {
    toast.info('Generating location report...')
    // In a real app, this would trigger a download
    setTimeout(() => {
      toast.success('Report exported successfully!')
    }, 2000)
  }

  const handleViewHistory = (employee) => {
    toast.info(`Loading location history for ${employee.employee_name}...`)
    // In a real app, this would open a history modal or navigate to history page
    setTimeout(() => {
      toast.success(`History loaded for ${employee.employee_name}`)
    }, 1000)
  }

  const center = [40.7128, -74.0060] // Default center

  return (
    <div>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Employee Locations</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="#">Manager</a></li>
                <li className="breadcrumb-item active">Employee Locations</li>
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
                      <h4>{locationData.length}</h4>
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
                      <h4>{locationData.filter(emp => emp.status === 'working').length}</h4>
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
              <Card className="bg-info text-white">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4>{locationData.filter(emp => emp.work_type === 'Field Work').length}</h4>
                      <p className="mb-0">Field Workers</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-hard-hat fa-2x"></i>
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
                      <h4>{locationData.filter(emp => emp.work_type === 'Office Work').length}</h4>
                      <p className="mb-0">Office Workers</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-building fa-2x"></i>
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
                    Filters & Controls
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Employee</Form.Label>
                        <Form.Select
                          value={selectedEmployee}
                          onChange={(e) => setSelectedEmployee(e.target.value)}
                        >
                          <option value="all">All Employees</option>
                          {locationData.map(emp => (
                            <option key={emp.id} value={emp.employee_name}>
                              {emp.employee_name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4} className="d-flex align-items-end">
                      <Button variant="primary" className="mr-2" onClick={handleRefreshLocations}>
                        <i className="fas fa-sync mr-1"></i>
                        Refresh Locations
                      </Button>
                      <Button variant="success" onClick={handleExportReport}>
                        <i className="fas fa-download mr-1"></i>
                        Export Report
                      </Button>
                    </Col>
                    <Col md={4} className="d-flex align-items-end">
                      <Button variant="info" onClick={() => setShowMapModal(true)}>
                        <i className="fas fa-map mr-1"></i>
                        View All on Map
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Location Table */}
          <Row>
            <Col lg={12}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-table mr-2"></i>
                    Employee Location Details
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Current Location</th>
                        <th>Work Type</th>
                        <th>Check-in Time</th>
                        <th>Status</th>
                        <th>Last Seen</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((employee) => (
                        <tr key={employee.id}>
                          <td>
                            <strong>{employee.employee_name}</strong>
                          </td>
                          <td>{employee.current_location}</td>
                          <td>{getWorkTypeBadge(employee.work_type)}</td>
                          <td>{employee.check_in_time}</td>
                          <td>{getStatusBadge(employee.status)}</td>
                          <td>{employee.last_seen}</td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleViewMap(employee)}
                              className="mr-1"
                            >
                              <i className="fas fa-map-marker-alt"></i>
                            </Button>
                            <Button 
                              variant="outline-info" 
                              size="sm"
                              onClick={() => handleViewHistory(employee)}
                            >
                              <i className="fas fa-history"></i>
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

      {/* Map Modal */}
      <Modal show={showMapModal} onHide={() => setShowMapModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-map mr-2"></i>
            {selectedLocation ? `${selectedLocation.employee_name}'s Location` : 'All Employee Locations'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ height: '500px', width: '100%' }}>
            <MapContainer
              center={selectedLocation ? [selectedLocation.latitude, selectedLocation.longitude] : center}
              zoom={selectedLocation ? 15 : 12}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {(selectedLocation ? [selectedLocation] : filteredData).map((employee) => (
                <Marker
                  key={employee.id}
                  position={[employee.latitude, employee.longitude]}
                >
                  <Popup>
                    <div>
                      <h6>{employee.employee_name}</h6>
                      <p><strong>Location:</strong> {employee.current_location}</p>
                      <p><strong>Work Type:</strong> {employee.work_type}</p>
                      <p><strong>Check-in:</strong> {employee.check_in_time}</p>
                      <p><strong>Status:</strong> {employee.status}</p>
                      <p><strong>Last Seen:</strong> {employee.last_seen}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMapModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default ManagerEmployeeLocations
