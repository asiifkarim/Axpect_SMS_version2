import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import { useMockDataStore } from '../../store/mockDataStore'
import L from 'leaflet'

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const CeoGpsDashboard = () => {
  const { gpsTracks, employees } = useMockDataStore()
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194])
  const [mapZoom, setMapZoom] = useState(13)

  // Mock geofence data
  const geofences = [
    {
      id: 1,
      name: 'Office Building',
      center: [37.7749, -122.4194],
      radius: 100,
      color: 'blue'
    },
    {
      id: 2,
      name: 'Client Site A',
      center: [37.7849, -122.4094],
      radius: 50,
      color: 'green'
    }
  ]

  // Get current locations for employees
  const currentLocations = employees.map(employee => {
    const track = gpsTracks.find(t => t.employee_id === employee.id)
    return {
      ...employee,
      latitude: track?.latitude || 37.7749 + (Math.random() - 0.5) * 0.01,
      longitude: track?.longitude || -122.4194 + (Math.random() - 0.5) * 0.01,
      lastSeen: track?.timestamp || new Date().toISOString()
    }
  })

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee)
    setMapCenter([employee.latitude, employee.longitude])
    setMapZoom(15)
  }

  return (
    <div className="content">
      <div className="container-fluid">
        {/* Statistics Cards */}
        <div className="row">
          <div className="col-lg-3 col-6">
            <div className="small-box bg-info">
              <div className="inner">
                <h3>{currentLocations.length}</h3>
                <p>Active Employees</p>
              </div>
              <div className="icon">
                <i className="fas fa-users"></i>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-6">
            <div className="small-box bg-success">
              <div className="inner">
                <h3>{geofences.length}</h3>
                <p>Geofenced Areas</p>
              </div>
              <div className="icon">
                <i className="fas fa-map-pin"></i>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-6">
            <div className="small-box bg-warning">
              <div className="inner">
                <h3>2</h3>
                <p>Outside Geofence</p>
              </div>
              <div className="icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-6">
            <div className="small-box bg-danger">
              <div className="inner">
                <h3>1</h3>
                <p>Offline</p>
              </div>
              <div className="icon">
                <i className="fas fa-power-off"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Map */}
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Live Employee Locations</h3>
                <div className="card-tools">
                  <button type="button" className="btn btn-tool" data-card-widget="collapse">
                    <i className="fas fa-minus"></i>
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div style={{ height: '500px', width: '100%' }}>
                  <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    style={{ height: '100%', width: '100%' }}
                    key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    {/* Geofences */}
                    {geofences.map(geofence => (
                      <Circle
                        key={geofence.id}
                        center={geofence.center}
                        radius={geofence.radius}
                        pathOptions={{
                          color: geofence.color,
                          fillColor: geofence.color,
                          fillOpacity: 0.2
                        }}
                      >
                        <Popup>
                          <strong>{geofence.name}</strong><br />
                          Radius: {geofence.radius}m
                        </Popup>
                      </Circle>
                    ))}
                    
                    {/* Employee Markers */}
                    {currentLocations.map(employee => (
                      <Marker
                        key={employee.id}
                        position={[employee.latitude, employee.longitude]}
                        eventHandlers={{
                          click: () => handleEmployeeSelect(employee)
                        }}
                      >
                        <Popup>
                          <div>
                            <strong>{employee.name}</strong><br />
                            Position: {employee.position}<br />
                            Department: {employee.department}<br />
                            Last Seen: {new Date(employee.lastSeen).toLocaleString()}
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Employee List */}
          <div className="col-md-4">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Employee Status</h3>
              </div>
              <div className="card-body">
                <div className="list-group">
                  {currentLocations.map(employee => (
                    <div
                      key={employee.id}
                      className={`list-group-item list-group-item-action ${
                        selectedEmployee?.id === employee.id ? 'active' : ''
                      }`}
                      onClick={() => handleEmployeeSelect(employee)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">{employee.name}</h5>
                        <small>
                          <span className={`badge badge-${
                            employee.status === 'active' ? 'success' : 'danger'
                          }`}>
                            {employee.status}
                          </span>
                        </small>
                      </div>
                      <p className="mb-1">{employee.position}</p>
                      <small>
                        <i className="fas fa-map-marker-alt mr-1"></i>
                        {employee.latitude.toFixed(4)}, {employee.longitude.toFixed(4)}
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Geofence Legend */}
            <div className="card mt-3">
              <div className="card-header">
                <h3 className="card-title">Geofenced Areas</h3>
              </div>
              <div className="card-body">
                {geofences.map(geofence => (
                  <div key={geofence.id} className="d-flex align-items-center mb-2">
                    <div
                      className="mr-2"
                      style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: geofence.color,
                        borderRadius: '50%',
                        opacity: 0.3
                      }}
                    ></div>
                    <span>{geofence.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CeoGpsDashboard
