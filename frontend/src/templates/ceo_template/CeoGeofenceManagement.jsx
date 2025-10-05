import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useMockDataStore } from '../../store/mockDataStore'
import { MapContainer, TileLayer, Circle, Popup, Marker } from 'react-leaflet'
import L from 'leaflet'

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const CeoGeofenceManagement = () => {
  const { employees, locations } = useMockDataStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedGeofence, setSelectedGeofence] = useState(null)
  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194])
  const [mapZoom, setMapZoom] = useState(13)
  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  // Mock geofence data
  const [geofences, setGeofences] = useState([
    {
      id: 1,
      name: 'Office Building',
      center: [37.7749, -122.4194],
      radius: 100,
      color: 'blue',
      type: 'office',
      description: 'Main office building',
      alert_enabled: true,
      created_date: '2024-01-01'
    },
    {
      id: 2,
      name: 'Client Site A',
      center: [37.7849, -122.4094],
      radius: 50,
      color: 'green',
      type: 'client',
      description: 'Client site for project A',
      alert_enabled: true,
      created_date: '2024-01-15'
    },
    {
      id: 3,
      name: 'Restricted Area',
      center: [37.7649, -122.4294],
      radius: 200,
      color: 'red',
      type: 'restricted',
      description: 'High security area',
      alert_enabled: true,
      created_date: '2024-01-20'
    }
  ])

  const onSubmit = (data) => {
    const newGeofence = {
      ...data,
      id: Date.now(),
      center: [parseFloat(data.latitude), parseFloat(data.longitude)],
      radius: parseInt(data.radius),
      created_date: new Date().toISOString().split('T')[0]
    }
    
    setGeofences([...geofences, newGeofence])
    toast.success('Geofence added successfully!')
    reset()
    setShowAddForm(false)
  }

  const handleDeleteGeofence = (geofenceId) => {
    if (window.confirm('Are you sure you want to delete this geofence?')) {
      setGeofences(geofences.filter(g => g.id !== geofenceId))
      toast.success('Geofence deleted successfully!')
    }
  }

  const handleEditGeofence = (geofence) => {
    setSelectedGeofence(geofence)
    setMapCenter(geofence.center)
    setMapZoom(15)
    toast.info(`Edit functionality for ${geofence.name} will be implemented`)
  }

  const getGeofenceColor = (type) => {
    switch (type) {
      case 'office': return 'blue'
      case 'client': return 'green'
      case 'restricted': return 'red'
      case 'custom': return 'purple'
      default: return 'gray'
    }
  }

  // Calculate employees in each geofence
  const getEmployeesInGeofence = (geofence) => {
    return locations.filter(location => {
      const distance = calculateDistance(
        geofence.center[0], geofence.center[1],
        location.lat, location.lng
      )
      return distance <= (geofence.radius / 1000) // Convert radius to km
    }).length
  }

  // Calculate distance between two points
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371 // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  return (
    <div className="content">
      <div className="container-fluid">
        {/* Statistics Cards */}
        <div className="row">
          <div className="col-lg-3 col-6">
            <div className="small-box bg-info">
              <div className="inner">
                <h3>{geofences.length}</h3>
                <p>Total Geofences</p>
              </div>
              <div className="icon">
                <i className="fas fa-draw-polygon"></i>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-6">
            <div className="small-box bg-success">
              <div className="inner">
                <h3>{geofences.filter(g => g.alert_enabled).length}</h3>
                <p>Active Alerts</p>
              </div>
              <div className="icon">
                <i className="fas fa-bell"></i>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-6">
            <div className="small-box bg-warning">
              <div className="inner">
                <h3>{geofences.filter(g => g.type === 'office').length}</h3>
                <p>Office Areas</p>
              </div>
              <div className="icon">
                <i className="fas fa-building"></i>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-6">
            <div className="small-box bg-danger">
              <div className="inner">
                <h3>{geofences.filter(g => g.type === 'restricted').length}</h3>
                <p>Restricted Areas</p>
              </div>
              <div className="icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Map and Geofence Management */}
        <div className="row">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Geofence Map</h3>
                <div className="card-tools">
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => setShowAddForm(!showAddForm)}
                  >
                    <i className="fas fa-plus mr-1"></i>
                    Add Geofence
                  </button>
                </div>
              </div>
              <div className="card-body p-0">
                <div style={{ height: '500px' }}>
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
                        eventHandlers={{
                          click: () => handleEditGeofence(geofence)
                        }}
                      >
                        <Popup>
                          <div>
                            <strong>{geofence.name}</strong><br />
                            Type: {geofence.type}<br />
                            Radius: {geofence.radius}m<br />
                            Employees: {getEmployeesInGeofence(geofence)}<br />
                            <small>{geofence.description}</small>
                          </div>
                        </Popup>
                      </Circle>
                    ))}
                  </MapContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            {/* Add Geofence Form */}
            {showAddForm && (
              <div className="card mb-3">
                <div className="card-header">
                  <h4 className="card-title">Add New Geofence</h4>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                      <label htmlFor="name">Geofence Name *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        id="name"
                        {...register('name', { required: 'Name is required' })}
                      />
                      {errors.name && (
                        <div className="invalid-feedback">{errors.name.message}</div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="type">Type *</label>
                      <select
                        className={`form-control ${errors.type ? 'is-invalid' : ''}`}
                        id="type"
                        {...register('type', { required: 'Type is required' })}
                      >
                        <option value="">Select Type</option>
                        <option value="office">Office</option>
                        <option value="client">Client Site</option>
                        <option value="restricted">Restricted Area</option>
                        <option value="custom">Custom</option>
                      </select>
                      {errors.type && (
                        <div className="invalid-feedback">{errors.type.message}</div>
                      )}
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="latitude">Latitude *</label>
                          <input
                            type="number"
                            step="any"
                            className={`form-control ${errors.latitude ? 'is-invalid' : ''}`}
                            id="latitude"
                            {...register('latitude', { required: 'Latitude is required' })}
                          />
                          {errors.latitude && (
                            <div className="invalid-feedback">{errors.latitude.message}</div>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="longitude">Longitude *</label>
                          <input
                            type="number"
                            step="any"
                            className={`form-control ${errors.longitude ? 'is-invalid' : ''}`}
                            id="longitude"
                            {...register('longitude', { required: 'Longitude is required' })}
                          />
                          {errors.longitude && (
                            <div className="invalid-feedback">{errors.longitude.message}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="radius">Radius (meters) *</label>
                      <input
                        type="number"
                        className={`form-control ${errors.radius ? 'is-invalid' : ''}`}
                        id="radius"
                        {...register('radius', { required: 'Radius is required', min: 10 })}
                      />
                      {errors.radius && (
                        <div className="invalid-feedback">{errors.radius.message}</div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="description">Description</label>
                      <textarea
                        className="form-control"
                        id="description"
                        rows="2"
                        {...register('description')}
                      />
                    </div>

                    <div className="form-group">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="alert_enabled"
                          defaultChecked
                          {...register('alert_enabled')}
                        />
                        <label className="form-check-label" htmlFor="alert_enabled">
                          Enable Alerts
                        </label>
                      </div>
                    </div>

                    <div className="form-group">
                      <button type="submit" className="btn btn-primary">
                        <i className="fas fa-save mr-2"></i>
                        Add Geofence
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-secondary ml-2" 
                        onClick={() => {
                          reset()
                          setShowAddForm(false)
                        }}
                      >
                        <i className="fas fa-times mr-2"></i>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Geofence List */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Geofence List</h3>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  {geofences.map(geofence => (
                    <div
                      key={geofence.id}
                      className={`list-group-item list-group-item-action ${selectedGeofence?.id === geofence.id ? 'active' : ''}`}
                      onClick={() => handleEditGeofence(geofence)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{geofence.name}</h6>
                        <span className={`badge badge-${getGeofenceColor(geofence.type)}`}>
                          {geofence.type}
                        </span>
                      </div>
                      <p className="mb-1">{geofence.description}</p>
                      <div className="d-flex justify-content-between">
                        <small>Radius: {geofence.radius}m</small>
                        <small>Employees: {getEmployeesInGeofence(geofence)}</small>
                      </div>
                      <div className="btn-group btn-group-sm mt-2">
                        <button 
                          className="btn btn-warning btn-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditGeofence(geofence)
                          }}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteGeofence(geofence.id)
                          }}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CeoGeofenceManagement
