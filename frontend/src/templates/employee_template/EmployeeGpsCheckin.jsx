import React, { useState } from 'react'
import { Card, Row, Col, Button, Alert, Badge } from 'react-bootstrap'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { toast } from 'react-toastify'

const EmployeeGpsCheckin = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [checkInTime, setCheckInTime] = useState(null)

  const handleCheckIn = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCurrentLocation({ latitude, longitude })
        setIsCheckedIn(true)
        setCheckInTime(new Date().toLocaleTimeString())
        toast.success('Checked in successfully!')
      },
      (error) => {
        toast.error('Unable to get your location. Please check permissions.')
      }
    )
  }

  const handleCheckOut = () => {
    setIsCheckedIn(false)
    setCurrentLocation(null)
    setCheckInTime(null)
    toast.success('Checked out successfully!')
  }

  return (
    <div>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">GPS Check-in</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="#">Employee</a></li>
                <li className="breadcrumb-item active">GPS Check-in</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <Row>
            <Col lg={12}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-map-marker-alt mr-2"></i>
                    Location Check-in
                  </h3>
                </Card.Header>
                <Card.Body className="text-center">
                  <Alert variant={isCheckedIn ? 'success' : 'info'}>
                    <h4 className="alert-heading">
                      {isCheckedIn ? 'Currently Checked In' : 'Ready to Check In'}
                    </h4>
                    {isCheckedIn && checkInTime && (
                      <p className="mb-0">Check-in time: {checkInTime}</p>
                    )}
                  </Alert>
                  
                  <div className="mb-4">
                    <Button
                      variant={isCheckedIn ? 'danger' : 'success'}
                      size="lg"
                      onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
                    >
                      <i className={`fas fa-${isCheckedIn ? 'sign-out-alt' : 'sign-in-alt'} mr-2`}></i>
                      {isCheckedIn ? 'Check Out' : 'Check In'}
                    </Button>
                  </div>

                  {currentLocation && (
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
                              <p>Checked in at: {checkInTime}</p>
                            </div>
                          </Popup>
                        </Marker>
                      </MapContainer>
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

export default EmployeeGpsCheckin
