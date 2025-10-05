import React, { useState } from 'react'
import { useMockDataStore } from '../../store/mockDataStore'
import { toast } from 'react-toastify'
import { Modal, Button, Form, Row, Col } from 'react-bootstrap'

const CeoManageManager = () => {
  const { employees, updateEmployee, deleteEmployee } = useMockDataStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedManager, setSelectedManager] = useState(null)
  const [editForm, setEditForm] = useState({})

  // Filter managers (user_type === '2')
  const managers = employees.filter(emp => emp.user_type === '2')
  
  const filteredManagers = managers.filter(manager => {
    const matchesSearch = manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         manager.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = !filterDepartment || manager.department === filterDepartment
    return matchesSearch && matchesDepartment
  })

  const handleStatusChange = (managerId, newStatus) => {
    updateEmployee(managerId, { status: newStatus })
    toast.success(`Manager status updated to ${newStatus}`)
  }

  const handleEditManager = (manager) => {
    setSelectedManager(manager)
    setEditForm({
      name: manager.name,
      email: manager.email,
      phone: manager.phone,
      position: manager.position,
      department: manager.department,
      division: manager.division,
      salary: manager.salary
    })
    setShowEditModal(true)
  }

  const handleDeleteManager = (manager) => {
    setSelectedManager(manager)
    setShowDeleteModal(true)
  }

  const handleSaveEdit = () => {
    if (selectedManager) {
      updateEmployee(selectedManager.id, editForm)
      toast.success('Manager updated successfully!')
      setShowEditModal(false)
    }
  }

  const handleConfirmDelete = () => {
    if (selectedManager) {
      deleteEmployee(selectedManager.id)
      toast.success('Manager deleted successfully!')
      setShowDeleteModal(false)
    }
  }

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const departments = [...new Set(managers.map(mgr => mgr.department))]

  return (
    <div className="content">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Manage Managers</h3>
                <div className="card-tools">
                  <a href="#/ceo/add-manager" className="btn btn-primary btn-sm">
                    <i className="fas fa-plus mr-1"></i>
                    Add Manager
                  </a>
                </div>
              </div>
              <div className="card-body">
                {/* Filters */}
                <div className="row mb-3">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="search">Search Managers</label>
                      <input
                        type="text"
                        className="form-control"
                        id="search"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="department">Filter by Department</label>
                      <select
                        className="form-control"
                        id="department"
                        value={filterDepartment}
                        onChange={(e) => setFilterDepartment(e.target.value)}
                      >
                        <option value="">All Departments</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Desktop Table */}
                <div className="desktop-table">
                  <div className="table-responsive">
                    <table className="table table-bordered table-striped">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Position</th>
                          <th>Department</th>
                          <th>Division</th>
                          <th>Salary</th>
                          <th>Team Size</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredManagers.map(manager => (
                          <tr key={manager.id}>
                            <td>{manager.id}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <img 
                                  src={manager.profile_pic} 
                                  alt={manager.name}
                                  className="img-circle elevation-2 mr-2"
                                  style={{width: '32px', height: '32px'}}
                                />
                                {manager.name}
                              </div>
                            </td>
                            <td>{manager.email}</td>
                            <td>{manager.phone}</td>
                            <td>{manager.position}</td>
                            <td>{manager.department}</td>
                            <td>{manager.division}</td>
                            <td>${manager.salary?.toLocaleString()}</td>
                            <td>
                              <span className="badge badge-info">
                                {manager.employees_count || 0} employees
                              </span>
                            </td>
                            <td>
                              <span className={`badge badge-${manager.status === 'active' ? 'success' : 'danger'}`}>
                                {manager.status}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button 
                                  className="btn btn-info btn-sm"
                                  onClick={() => handleEditManager(manager)}
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button 
                                  className={`btn btn-sm ${manager.status === 'active' ? 'btn-warning' : 'btn-success'}`}
                                  onClick={() => handleStatusChange(manager.id, manager.status === 'active' ? 'inactive' : 'active')}
                                >
                                  <i className={`fas fa-${manager.status === 'active' ? 'pause' : 'play'}`}></i>
                                </button>
                                <button 
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleDeleteManager(manager)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Grid */}
                <div className="mobile-grid">
                  <div className="job-card-grid">
                    {filteredManagers.map(manager => (
                      <div key={manager.id} className="job-card">
                        <div className="job-card-header">
                          <div>
                            <h5 className="job-card-title">{manager.name}</h5>
                            <div className="job-card-number">ID: {manager.id}</div>
                          </div>
                          <span className={`badge badge-${manager.status === 'active' ? 'success' : 'danger'}`}>
                            {manager.status}
                          </span>
                        </div>
                        
                        <div className="job-card-meta">
                          <div className="meta-item">
                            <div className="meta-label">Email</div>
                            <div className="meta-value">{manager.email}</div>
                          </div>
                          <div className="meta-item">
                            <div className="meta-label">Phone</div>
                            <div className="meta-value">{manager.phone}</div>
                          </div>
                          <div className="meta-item">
                            <div className="meta-label">Position</div>
                            <div className="meta-value">{manager.position}</div>
                          </div>
                          <div className="meta-item">
                            <div className="meta-label">Department</div>
                            <div className="meta-value">{manager.department}</div>
                          </div>
                          <div className="meta-item">
                            <div className="meta-label">Division</div>
                            <div className="meta-value">{manager.division}</div>
                          </div>
                          <div className="meta-item">
                            <div className="meta-label">Salary</div>
                            <div className="meta-value">${manager.salary?.toLocaleString()}</div>
                          </div>
                          <div className="meta-item">
                            <div className="meta-label">Team Size</div>
                            <div className="meta-value">
                              <span className="badge badge-info">
                                {manager.employees_count || 0} employees
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="job-card-actions">
                          <div className="btn-group">
                            <button 
                              className="btn btn-info btn-sm"
                              onClick={() => handleEditManager(manager)}
                            >
                              <i className="fas fa-edit mr-1"></i>
                              Edit
                            </button>
                            <button 
                              className={`btn btn-sm ${manager.status === 'active' ? 'btn-warning' : 'btn-success'}`}
                              onClick={() => handleStatusChange(manager.id, manager.status === 'active' ? 'inactive' : 'active')}
                            >
                              <i className={`fas fa-${manager.status === 'active' ? 'pause' : 'play'} mr-1`}></i>
                              {manager.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteManager(manager)}
                            >
                              <i className="fas fa-trash mr-1"></i>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {filteredManagers.length === 0 && (
                  <div className="text-center py-4">
                    <i className="fas fa-users fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No managers found</h5>
                    <p className="text-muted">Try adjusting your search criteria</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Manager Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-edit mr-2"></i>
            Edit Manager - {selectedManager?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    value={editForm.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Position</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.position || ''}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Department</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.department || ''}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Division</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.division || ''}
                    onChange={(e) => handleInputChange('division', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Salary</Form.Label>
                  <Form.Control
                    type="number"
                    value={editForm.salary || ''}
                    onChange={(e) => handleInputChange('salary', parseInt(e.target.value))}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveEdit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Manager Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-exclamation-triangle mr-2 text-danger"></i>
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete <strong>{selectedManager?.name}</strong>?</p>
          <p className="text-danger">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete Manager
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default CeoManageManager