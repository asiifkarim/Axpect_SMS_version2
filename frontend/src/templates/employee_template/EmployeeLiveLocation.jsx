import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Button, Alert, Badge } from 'react-bootstrap'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const EmployeeLiveLocation = () => {
  const navigate = useNavigate()
  const [currentLocation, setCurrentLocation] = useState(null)
  const [isTracking, setIsTracking] = useState(false)
  const [trackingHistory, setTrackingHistory] = useState([])

  useEffect(() => {
    let interval
    if (isTracking) {
      interval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            const newLocation = {
              latitude,
              longitude,
              timestamp: new Date().toLocaleTimeString()
            }
            setCurrentLocation(newLocation)
            setTrackingHistory(prev => [newLocation, ...prev.slice(0, 9)])
          },
          (error) => {
            toast.error('Unable to get location')
          }
        )
      }, 30000) // Update every 30 seconds
    }
    return () => clearInterval(interval)
  }, [isTracking])

  const startTracking = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCurrentLocation({ latitude, longitude, timestamp: new Date().toLocaleTimeString() })
        setIsTracking(true)
        toast.success('Live tracking started')
      },
      (error) => {
        toast.error('Unable to start tracking. Please check permissions.')
      }
    )
  }

  const stopTracking = () => {
    setIsTracking(false)
    toast.success('Live tracking stopped')
  }

  const shareLocation = () => {
    if (currentLocation) {
      const shareText = `My current location: ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`
      if (navigator.share) {
        navigator.share({ text: shareText })
      } else {
        navigator.clipboard.writeText(shareText)
        toast.success('Location copied to clipboard')
      }
    }
  }

  const handleViewHistory = () => {
    toast.info('Redirecting to GPS History...')
    setTimeout(() => {
      navigate('/employee/gps-history')
    }, 1000)
  }

  const handleSettings = () => {
    toast.info('Opening location settings...')
    setTimeout(() => {
      toast.success('Location settings opened!')
    }, 1000)
  }

  return (
    <div>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Live Location</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="#">Employee</a></li>
                <li className="breadcrumb-item active">Live Location</li>
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
              <Alert variant={isTracking ? 'success' : 'warning'}>
                <h4 className="alert-heading">
                  <i className={`fas fa-${isTracking ? 'play-circle' : 'pause-circle'} mr-2`}></i>
                  {isTracking ? 'Live Tracking Active' : 'Tracking Not Active'}
                </h4>
                <p className="mb-0">
                  {isTracking ? 'Your location is being tracked every 30 seconds' : 'Start tracking to share your live location'}
                </p>
              </Alert>
            </Col>
          </Row>

          {/* Controls */}
          <Row className="mb-4">
            <Col lg={12}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-cogs mr-2"></i>
                    Tracking Controls
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={3}>
                      <Button
                        variant={isTracking ? 'danger' : 'success'}
                        size="lg"
                        block
                        onClick={isTracking ? stopTracking : startTracking}
                      >
                        <i className={`fas fa-${isTracking ? 'stop' : 'play'} mr-2`}></i>
                        {isTracking ? 'Stop Tracking' : 'Start Tracking'}
                      </Button>
                    </Col>
                    <Col md={3}>
                      <Button
                        variant="primary"
                        size="lg"
                        block
                        onClick={shareLocation}
                        disabled={!currentLocation}
                      >
                        <i className="fas fa-share mr-2"></i>
                        Share Location
                      </Button>
                    </Col>
                    <Col md={3}>
                      <Button variant="info" size="lg" block onClick={handleViewHistory}>
                        <i className="fas fa-history mr-2"></i>
                        View History
                      </Button>
                    </Col>
                    <Col md={3}>
                      <Button variant="warning" size="lg" block onClick={handleSettings}>
                        <i className="fas fa-settings mr-2"></i>
                        Settings
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Map and Location Info */}
          <Row>
            <Col lg={8}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-map mr-2"></i>
                    Live Location Map
                  </h3>
                </Card.Header>
                <Card.Body>
                  {currentLocation ? (
                    <div style={{ height: '500px', width: '100%' }}>
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
                              <h6>Live Location</h6>
                              <p><strong>Time:</strong> {currentLocation.timestamp}</p>
                              <p><strong>Status:</strong> {isTracking ? 'Tracking Active' : 'Tracking Stopped'}</p>
                            </div>
                          </Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <i className="fas fa-map-marked-alt fa-3x text-muted mb-3"></i>
                      <h5>No Location Available</h5>
                      <p className="text-muted">Start tracking to see your location on the map</p>
                    </div>
                  )}
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
                  {currentLocation ? (
                    <div>
                      <div className="mb-3">
                        <h6>Current Coordinates</h6>
                        <p className="text-muted">
                          Lat: {currentLocation.latitude.toFixed(6)}<br />
                          Lng: {currentLocation.longitude.toFixed(6)}
                        </p>
                      </div>
                      <div className="mb-3">
                        <h6>Last Updated</h6>
                        <p className="text-muted">{currentLocation.timestamp}</p>
                      </div>
                      <div className="mb-3">
                        <h6>Tracking Status</h6>
                        <Badge bg={isTracking ? 'success' : 'warning'}>
                          {isTracking ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <i className="fas fa-location-slash fa-2x text-muted mb-3"></i>
                      <p className="text-muted">No location data available</p>
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* Recent Updates */}
              <Card className="mt-3">
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-clock mr-2"></i>
                    Recent Updates
                  </h3>
                </Card.Header>
                <Card.Body>
                  {trackingHistory.length > 0 ? (
                    <div className="timeline">
                      {trackingHistory.slice(0, 5).map((location, index) => (
                        <div key={index} className="timeline-item">
                          <i className="fas fa-map-marker-alt bg-primary"></i>
                          <div className="timeline-item-content">
                            <h4 className="timeline-header">
                              Location Update
                            </h4>
                            <div className="timeline-body">
                              <small className="text-muted">
                                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                              </small>
                            </div>
                            <div className="timeline-footer">
                              <small className="text-muted">
                                <i className="fas fa-clock mr-1"></i>
                                {location.timestamp}
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center">
                      <i className="fas fa-history fa-2x text-muted mb-3"></i>
                      <p className="text-muted">No tracking history yet</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  )
}

export default EmployeeLiveLocation
