import React, { useState } from 'react'
import { Card, Row, Col, Button, Alert, Badge, Modal } from 'react-bootstrap'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const EmployeeGpsDashboard = () => {
  const navigate = useNavigate()
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 40.7128,
    longitude: -74.0060,
    address: 'Office Building A, New York, NY'
  })
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [checkInTime, setCheckInTime] = useState('')
  const [workHours, setWorkHours] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckIn = () => {
    // Immediately update UI state for better responsiveness
    setIsCheckedIn(true)
    setCheckInTime(new Date().toLocaleTimeString())
    setIsLoading(true)
    
    // Show immediate feedback
    toast.success('Checking in...')
    
    // Get location in background
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCurrentLocation({
          latitude,
          longitude,
          address: 'Current Location'
        })
        setIsLoading(false)
        toast.success('Checked in successfully!')
      },
      (error) => {
        setIsLoading(false)
        toast.error('Unable to get your location. Please check permissions.')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  }

  const handleCheckOut = () => {
    // Immediately update UI state
    setIsCheckedIn(false)
    setCheckInTime('')
    setWorkHours(0)
    toast.success('Checked out successfully!')
  }

  const handleUpdateLocation = () => {
    setIsLoading(true)
    toast.info('Updating location...')
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCurrentLocation({
          latitude,
          longitude,
          address: 'Updated Location'
        })
        setIsLoading(false)
        toast.success('Location updated successfully!')
      },
      (error) => {
        setIsLoading(false)
        toast.error('Unable to update location. Please check permissions.')
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 300000
      }
    )
  }

  const handleViewHistory = () => {
    toast.info('Opening GPS History...')
    navigate('/employee/gps-history')
  }

  const handleShareLocation = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Location',
        text: `I'm currently at: ${currentLocation.address}`,
        url: `https://maps.google.com/?q=${currentLocation.latitude},${currentLocation.longitude}`
      }).then(() => {
        toast.success('Location shared successfully!')
      }).catch(() => {
        toast.error('Failed to share location')
      })
    } else {
      // Fallback for browsers that don't support Web Share API
      const shareText = `I'm currently at: ${currentLocation.address}\nCoordinates: ${currentLocation.latitude}, ${currentLocation.longitude}`
      navigator.clipboard.writeText(shareText).then(() => {
        toast.success('Location copied to clipboard!')
      }).catch(() => {
        toast.error('Failed to copy location')
      })
    }
  }

  return (
    <div>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">GPS Dashboard</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="#">Employee</a></li>
                <li className="breadcrumb-item active">GPS Dashboard</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          {/* Status Alert */}
          <Row className="mb-4">
            <Col lg={12}>
              <Alert variant={isCheckedIn ? 'success' : 'warning'}>
                <h4 className="alert-heading">
                  <i className={`fas fa-${isCheckedIn ? 'check-circle' : 'clock'} mr-2`}></i>
                  {isLoading ? 'Processing...' : (isCheckedIn ? 'Currently Checked In' : 'Not Checked In')}
                </h4>
                <p className="mb-0">
                  {isLoading ? 'Please wait while we process your request...' : 
                   (isCheckedIn ? `Check-in time: ${checkInTime}` : 'Please check in to start tracking your work hours')}
                </p>
              </Alert>
            </Col>
          </Row>

          {/* Quick Actions */}
          <Row className="mb-4">
            <Col lg={12}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-bolt mr-2"></i>
                    Quick Actions
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={3}>
                      <Button 
                        variant={isCheckedIn ? 'danger' : 'success'} 
                        size="lg" 
                        block 
                        onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
                        disabled={isLoading}
                      >
                        <i className={`fas fa-${isCheckedIn ? 'sign-out-alt' : 'sign-in-alt'} mr-2`}></i>
                        {isLoading ? 'Processing...' : (isCheckedIn ? 'Check Out' : 'Check In')}
                      </Button>
                    </Col>
                    <Col md={3}>
                      <Button 
                        variant="primary" 
                        size="lg" 
                        block 
                        onClick={handleUpdateLocation}
                        disabled={isLoading}
                      >
                        <i className="fas fa-map-marker-alt mr-2"></i>
                        {isLoading ? 'Updating...' : 'Update Location'}
                      </Button>
                    </Col>
                    <Col md={3}>
                      <Button 
                        variant="info" 
                        size="lg" 
                        block 
                        onClick={handleViewHistory}
                      >
                        <i className="fas fa-history mr-2"></i>
                        View History
                      </Button>
                    </Col>
                    <Col md={3}>
                      <Button 
                        variant="warning" 
                        size="lg" 
                        block 
                        onClick={handleShareLocation}
                      >
                        <i className="fas fa-share mr-2"></i>
                        Share Location
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Current Location and Map */}
          <Row className="mb-4">
            <Col lg={8}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-map mr-2"></i>
                    Current Location
                  </h3>
                </Card.Header>
                <Card.Body>
                  <div style={{ height: '400px', width: '100%' }}>
                    <MapContainer
                      center={[currentLocation.latitude, currentLocation.longitude]}
                      zoom={15}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Marker position={[currentLocation.latitude, currentLocation.longitude]}>
                        <Popup>
                          <div>
                            <h6>Your Location</h6>
                            <p><strong>Address:</strong> {currentLocation.address}</p>
                            <p><strong>Coordinates:</strong> {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}</p>
                            <p><strong>Status:</strong> {isCheckedIn ? 'Checked In' : 'Not Checked In'}</p>
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-info-circle mr-2"></i>
                    Location Details
                  </h3>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <h6>Current Address</h6>
                    <p className="text-muted">{currentLocation.address}</p>
                  </div>
                  <div className="mb-3">
                    <h6>Coordinates</h6>
                    <p className="text-muted">
                      Lat: {currentLocation.latitude.toFixed(6)}<br />
                      Lng: {currentLocation.longitude.toFixed(6)}
                    </p>
                  </div>
                  <div className="mb-3">
                    <h6>Status</h6>
                    <Badge bg={isCheckedIn ? 'success' : 'warning'}>
                      {isCheckedIn ? 'Checked In' : 'Not Checked In'}
                    </Badge>
                  </div>
                  <div className="mb-3">
                    <h6>Check-in Time</h6>
                    <p className="text-muted">{isCheckedIn ? checkInTime : 'Not checked in'}</p>
                  </div>
                  <div className="mb-3">
                    <h6>Work Hours Today</h6>
                    <p className="text-muted">{workHours} hours</p>
                  </div>
                </Card.Body>
              </Card>

              {/* Recent Locations */}
              <Card className="mt-3">
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-history mr-2"></i>
                    Recent Locations
                  </h3>
                </Card.Header>
                <Card.Body>
                  <div className="timeline">
                    <div>
                      <i className="fas fa-map-marker-alt bg-primary"></i>
                      <div className="timeline-item">
                        <span className="time">2 hours ago</span>
                        <h3 className="timeline-header">Office Building A</h3>
                        <div className="timeline-body">
                          Working on project documentation
                        </div>
                      </div>
                    </div>
                    <div>
                      <i className="fas fa-map-marker-alt bg-success"></i>
                      <div className="timeline-item">
                        <span className="time">4 hours ago</span>
                        <h3 className="timeline-header">Client Site B</h3>
                        <div className="timeline-body">
                          Client meeting and requirements gathering
                        </div>
                      </div>
                    </div>
                    <div>
                      <i className="fas fa-map-marker-alt bg-info"></i>
                      <div className="timeline-item">
                        <span className="time">6 hours ago</span>
                        <h3 className="timeline-header">Office Building A</h3>
                        <div className="timeline-body">
                          Morning standup meeting
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Work Hours Summary */}
          <Row>
            <Col lg={12}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-clock mr-2"></i>
                    Today's Work Summary
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={3}>
                      <div className="text-center">
                        <h4 className="text-primary">{workHours}</h4>
                        <p className="mb-0">Hours Worked</p>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="text-center">
                        <h4 className="text-success">1.5</h4>
                        <p className="mb-0">Overtime Hours</p>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="text-center">
                        <h4 className="text-info">3</h4>
                        <p className="mb-0">Location Updates</p>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="text-center">
                        <h4 className="text-warning">95%</h4>
                        <p className="mb-0">Productivity Score</p>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  )
}

export default EmployeeGpsDashboard
