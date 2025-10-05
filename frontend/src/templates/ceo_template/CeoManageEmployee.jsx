import React, { useState } from 'react'
import { useMockDataStore } from '../../store/mockDataStore'
import { toast } from 'react-toastify'
import { Modal, Button, Form, Row, Col } from 'react-bootstrap'

const CeoManageEmployee = () => {
  const { employees, updateEmployee, deleteEmployee } = useMockDataStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [editForm, setEditForm] = useState({})

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = !filterDepartment || employee.department === filterDepartment
    return matchesSearch && matchesDepartment
  })

  const handleStatusChange = (employeeId, newStatus) => {
    updateEmployee(employeeId, { status: newStatus })
    toast.success(`Employee status updated to ${newStatus}`)
  }

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee)
    setEditForm({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
      department: employee.department,
      division: employee.division,
      salary: employee.salary
    })
    setShowEditModal(true)
  }

  const handleDeleteEmployee = (employee) => {
    setSelectedEmployee(employee)
    setShowDeleteModal(true)
  }

  const handleSaveEdit = () => {
    if (selectedEmployee) {
      updateEmployee(selectedEmployee.id, editForm)
      toast.success('Employee updated successfully!')
      setShowEditModal(false)
    }
  }

  const handleConfirmDelete = () => {
    if (selectedEmployee) {
      deleteEmployee(selectedEmployee.id)
      toast.success('Employee deleted successfully!')
      setShowDeleteModal(false)
    }
  }

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const departments = [...new Set(employees.map(emp => emp.department))]

  return (
    <div className="content">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Manage Employees</h3>
                <div className="card-tools">
                  <a href="#/ceo/add-employee" className="btn btn-primary btn-sm">
                    <i className="fas fa-plus mr-1"></i>
                    Add Employee
                  </a>
                </div>
              </div>
              <div className="card-body">
                {/* Filters */}
                <div className="row mb-3">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="search">Search Employees</label>
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
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEmployees.map(employee => (
                          <tr key={employee.id}>
                            <td>{employee.id}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <img 
                                  src={employee.profile_pic} 
                                  alt={employee.name}
                                  className="img-circle elevation-2 mr-2"
                                  style={{width: '32px', height: '32px'}}
                                />
                                {employee.name}
                              </div>
                            </td>
                            <td>{employee.email}</td>
                            <td>{employee.phone}</td>
                            <td>{employee.position}</td>
                            <td>{employee.department}</td>
                            <td>{employee.division}</td>
                            <td>${employee.salary?.toLocaleString()}</td>
                            <td>
                              <span className={`badge badge-${employee.status === 'active' ? 'success' : 'danger'}`}>
                                {employee.status}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button 
                                  className="btn btn-info btn-sm"
                                  onClick={() => handleEditEmployee(employee)}
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button 
                                  className={`btn btn-sm ${employee.status === 'active' ? 'btn-warning' : 'btn-success'}`}
                                  onClick={() => handleStatusChange(employee.id, employee.status === 'active' ? 'inactive' : 'active')}
                                >
                                  <i className={`fas fa-${employee.status === 'active' ? 'pause' : 'play'}`}></i>
                                </button>
                                <button 
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleDeleteEmployee(employee)}
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
                    {filteredEmployees.map(employee => (
                      <div key={employee.id} className="job-card">
                        <div className="job-card-header">
                          <div>
                            <h5 className="job-card-title">{employee.name}</h5>
                            <div className="job-card-number">ID: {employee.id}</div>
                          </div>
                          <span className={`badge badge-${employee.status === 'active' ? 'success' : 'danger'}`}>
                            {employee.status}
                          </span>
                        </div>
                        
                        <div className="job-card-meta">
                          <div className="meta-item">
                            <div className="meta-label">Email</div>
                            <div className="meta-value">{employee.email}</div>
                          </div>
                          <div className="meta-item">
                            <div className="meta-label">Phone</div>
                            <div className="meta-value">{employee.phone}</div>
                          </div>
                          <div className="meta-item">
                            <div className="meta-label">Position</div>
                            <div className="meta-value">{employee.position}</div>
                          </div>
                          <div className="meta-item">
                            <div className="meta-label">Department</div>
                            <div className="meta-value">{employee.department}</div>
                          </div>
                          <div className="meta-item">
                            <div className="meta-label">Division</div>
                            <div className="meta-value">{employee.division}</div>
                          </div>
                          <div className="meta-item">
                            <div className="meta-label">Salary</div>
                            <div className="meta-value">${employee.salary?.toLocaleString()}</div>
                          </div>
                        </div>
                        
                        <div className="job-card-actions">
                          <div className="btn-group">
                            <button 
                              className="btn btn-info btn-sm"
                              onClick={() => handleEditEmployee(employee)}
                            >
                              <i className="fas fa-edit mr-1"></i>
                              Edit
                            </button>
                            <button 
                              className={`btn btn-sm ${employee.status === 'active' ? 'btn-warning' : 'btn-success'}`}
                              onClick={() => handleStatusChange(employee.id, employee.status === 'active' ? 'inactive' : 'active')}
                            >
                              <i className={`fas fa-${employee.status === 'active' ? 'pause' : 'play'} mr-1`}></i>
                              {employee.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteEmployee(employee)}
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

                {filteredEmployees.length === 0 && (
                  <div className="text-center py-4">
                    <i className="fas fa-users fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No employees found</h5>
                    <p className="text-muted">Try adjusting your search criteria</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Employee Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-edit mr-2"></i>
            Edit Employee - {selectedEmployee?.name}
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

      {/* Delete Employee Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-exclamation-triangle mr-2 text-danger"></i>
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete <strong>{selectedEmployee?.name}</strong>?</p>
          <p className="text-danger">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete Employee
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default CeoManageEmployee
