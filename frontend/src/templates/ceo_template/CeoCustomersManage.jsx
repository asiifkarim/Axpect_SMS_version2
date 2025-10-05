import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { Modal, Button, Form, Row, Col } from 'react-bootstrap'
import { useMockDataStore } from '../../store/mockDataStore'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const CeoCustomersManage = () => {
  const { customers, orders, addCustomer, updateCustomer } = useMockDataStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterIndustry, setFilterIndustry] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [editForm, setEditForm] = useState({})
  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesIndustry = !filterIndustry || customer.industry === filterIndustry
    return matchesSearch && matchesIndustry
  })

  // Calculate statistics
  const totalCustomers = customers.length
  const activeCustomers = customers.filter(customer => customer.status === 'active').length
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0)

  // Chart data
  const industryData = customers.reduce((acc, customer) => {
    const industry = customer.industry
    acc[industry] = (acc[industry] || 0) + 1
    return acc
  }, {})

  const chartData = Object.entries(industryData).map(([industry, count]) => ({
    industry,
    customers: count
  }))

  const onSubmit = (data) => {
    const newCustomer = {
      ...data,
      id: Date.now(),
      status: 'active',
      created_date: new Date().toISOString().split('T')[0],
      last_contact: new Date().toISOString().split('T')[0],
      total_orders: 0,
      total_value: 0
    }
    
    addCustomer(newCustomer)
    toast.success('Customer added successfully!')
    reset()
    setShowAddForm(false)
  }

  const handleStatusChange = (customerId, newStatus) => {
    updateCustomer(customerId, { status: newStatus })
    toast.success(`Customer status updated to ${newStatus}`)
  }

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer)
    setShowViewModal(true)
  }

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer)
    setEditForm({
      name: customer.name,
      company: customer.company,
      email: customer.email,
      phone: customer.phone,
      industry: customer.industry,
      address: customer.address,
      status: customer.status
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = () => {
    if (selectedCustomer) {
      updateCustomer(selectedCustomer.id, editForm)
      toast.success('Customer updated successfully!')
      setShowEditModal(false)
      setSelectedCustomer(null)
      setEditForm({})
    }
  }

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const industries = [...new Set(customers.map(customer => customer.industry))]

  return (
    <div className="content">
      <div className="container-fluid">
        {/* Statistics Cards */}
        <div className="row">
          <div className="col-lg-3 col-6">
            <div className="small-box bg-info">
              <div className="inner">
                <h3>{totalCustomers}</h3>
                <p>Total Customers</p>
              </div>
              <div className="icon">
                <i className="fas fa-users"></i>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-6">
            <div className="small-box bg-success">
              <div className="inner">
                <h3>{activeCustomers}</h3>
                <p>Active Customers</p>
              </div>
              <div className="icon">
                <i className="fas fa-user-check"></i>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-6">
            <div className="small-box bg-warning">
              <div className="inner">
                <h3>{totalOrders}</h3>
                <p>Total Orders</p>
              </div>
              <div className="icon">
                <i className="fas fa-shopping-cart"></i>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-6">
            <div className="small-box bg-danger">
              <div className="inner">
                <h3>${totalRevenue.toLocaleString()}</h3>
                <p>Total Revenue</p>
              </div>
              <div className="icon">
                <i className="fas fa-dollar-sign"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Customers by Industry</h3>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="industry" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="customers" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Management */}
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Customer Management</h3>
                <div className="card-tools">
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => setShowAddForm(!showAddForm)}
                  >
                    <i className="fas fa-plus mr-1"></i>
                    Add Customer
                  </button>
                </div>
              </div>
              <div className="card-body">
                {/* Add Customer Form */}
                {showAddForm && (
                  <div className="card mb-4">
                    <div className="card-header">
                      <h4 className="card-title">Add New Customer</h4>
                    </div>
                    <div className="card-body">
                      <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="name">Customer Name *</label>
                              <input
                                type="text"
                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                id="name"
                                {...register('name', { required: 'Customer name is required' })}
                              />
                              {errors.name && (
                                <div className="invalid-feedback">{errors.name.message}</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="company">Company *</label>
                              <input
                                type="text"
                                className={`form-control ${errors.company ? 'is-invalid' : ''}`}
                                id="company"
                                {...register('company', { required: 'Company is required' })}
                              />
                              {errors.company && (
                                <div className="invalid-feedback">{errors.company.message}</div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="email">Email Address *</label>
                              <input
                                type="email"
                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                id="email"
                                {...register('email', { 
                                  required: 'Email is required',
                                  pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address'
                                  }
                                })}
                              />
                              {errors.email && (
                                <div className="invalid-feedback">{errors.email.message}</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="phone">Phone Number</label>
                              <input
                                type="tel"
                                className="form-control"
                                id="phone"
                                {...register('phone')}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="industry">Industry *</label>
                              <select
                                className={`form-control ${errors.industry ? 'is-invalid' : ''}`}
                                id="industry"
                                {...register('industry', { required: 'Industry is required' })}
                              >
                                <option value="">Select Industry</option>
                                <option value="Technology">Technology</option>
                                <option value="Manufacturing">Manufacturing</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="Finance">Finance</option>
                                <option value="Retail">Retail</option>
                                <option value="Education">Education</option>
                                <option value="Other">Other</option>
                              </select>
                              {errors.industry && (
                                <div className="invalid-feedback">{errors.industry.message}</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="address">Address</label>
                              <textarea
                                className="form-control"
                                id="address"
                                rows="3"
                                {...register('address')}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="form-group">
                          <button type="submit" className="btn btn-primary">
                            <i className="fas fa-save mr-2"></i>
                            Add Customer
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

                {/* Filters */}
                <div className="row mb-3">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="search">Search Customers</label>
                      <input
                        type="text"
                        className="form-control"
                        id="search"
                        placeholder="Search by name, company, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="industry">Filter by Industry</label>
                      <select
                        className="form-control"
                        id="industry"
                        value={filterIndustry}
                        onChange={(e) => setFilterIndustry(e.target.value)}
                      >
                        <option value="">All Industries</option>
                        {industries.map(industry => (
                          <option key={industry} value={industry}>{industry}</option>
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
                          <th>Company</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Industry</th>
                          <th>Orders</th>
                          <th>Revenue</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCustomers.map(customer => (
                          <tr key={customer.id}>
                            <td>{customer.id}</td>
                            <td>{customer.name}</td>
                            <td>{customer.company}</td>
                            <td>{customer.email}</td>
                            <td>{customer.phone}</td>
                            <td>
                              <span className="badge badge-info">{customer.industry}</span>
                            </td>
                            <td>
                              <span className="badge badge-primary">{customer.total_orders}</span>
                            </td>
                            <td>${customer.total_value?.toLocaleString()}</td>
                            <td>
                              <span className={`badge badge-${customer.status === 'active' ? 'success' : 'danger'}`}>
                                {customer.status}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button 
                                  className="btn btn-info btn-sm"
                                  onClick={() => handleViewCustomer(customer)}
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button 
                                  className="btn btn-warning btn-sm"
                                  onClick={() => handleEditCustomer(customer)}
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button 
                                  className={`btn btn-sm ${customer.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                                  onClick={() => handleStatusChange(customer.id, customer.status === 'active' ? 'inactive' : 'active')}
                                >
                                  <i className={`fas fa-${customer.status === 'active' ? 'pause' : 'play'}`}></i>
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
                    {filteredCustomers.map(customer => (
                      <div key={customer.id} className="job-card">
                        <div className="job-card-header">
                          <div>
                            <h5 className="job-card-title">{customer.name}</h5>
                            <div className="job-card-number">{customer.company}</div>
                          </div>
                          <span className={`badge badge-${customer.status === 'active' ? 'success' : 'danger'}`}>
                            {customer.status}
                          </span>
                        </div>
                        
                        <div className="job-card-meta">
                          <div className="meta-item">
                            <div className="meta-label">Email</div>
                            <div className="meta-value">{customer.email}</div>
                          </div>
                          <div className="meta-item">
                            <div className="meta-label">Phone</div>
                            <div className="meta-value">{customer.phone}</div>
                          </div>
                          <div className="meta-item">
                            <div className="meta-label">Industry</div>
                            <div className="meta-value">
                              <span className="badge badge-info">{customer.industry}</span>
                            </div>
                          </div>
                          <div className="meta-item">
                            <div className="meta-label">Orders</div>
                            <div className="meta-value">
                              <span className="badge badge-primary">{customer.total_orders}</span>
                            </div>
                          </div>
                          <div className="meta-item">
                            <div className="meta-label">Revenue</div>
                            <div className="meta-value">${customer.total_value?.toLocaleString()}</div>
                          </div>
                        </div>
                        
                        <div className="job-card-actions">
                          <div className="btn-group">
                            <button 
                              className="btn btn-info btn-sm"
                              onClick={() => handleViewCustomer(customer)}
                            >
                              <i className="fas fa-eye mr-1"></i>
                              View
                            </button>
                            <button 
                              className="btn btn-warning btn-sm"
                              onClick={() => handleEditCustomer(customer)}
                            >
                              <i className="fas fa-edit mr-1"></i>
                              Edit
                            </button>
                            <button 
                              className={`btn btn-sm ${customer.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                              onClick={() => handleStatusChange(customer.id, customer.status === 'active' ? 'inactive' : 'active')}
                            >
                              <i className={`fas fa-${customer.status === 'active' ? 'pause' : 'play'} mr-1`}></i>
                              {customer.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {filteredCustomers.length === 0 && (
                  <div className="text-center py-4">
                    <i className="fas fa-users fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No customers found</h5>
                    <p className="text-muted">Try adjusting your search criteria</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Customer Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-eye mr-2"></i>
            Customer Details - {selectedCustomer?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCustomer && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Name:</strong> {selectedCustomer.name}
                </Col>
                <Col md={6}>
                  <strong>Company:</strong> {selectedCustomer.company}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Email:</strong> {selectedCustomer.email}
                </Col>
                <Col md={6}>
                  <strong>Phone:</strong> {selectedCustomer.phone}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Industry:</strong> {selectedCustomer.industry}
                </Col>
                <Col md={6}>
                  <strong>Status:</strong> 
                  <span className={`badge ${selectedCustomer.status === 'active' ? 'badge-success' : 'badge-danger'} ml-2`}>
                    {selectedCustomer.status}
                  </span>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <strong>Address:</strong> {selectedCustomer.address}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Total Orders:</strong> {selectedCustomer.total_orders}
                </Col>
                <Col md={6}>
                  <strong>Total Value:</strong> ${selectedCustomer.total_value?.toLocaleString()}
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => {
            setShowViewModal(false)
            handleEditCustomer(selectedCustomer)
          }}>
            Edit Customer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Customer Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-edit mr-2"></i>
            Edit Customer - {selectedCustomer?.name}
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
                  <Form.Label>Company</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.company || ''}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
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
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Industry</Form.Label>
                  <Form.Control
                    as="select"
                    value={editForm.industry || ''}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                  >
                    <option value="">Select Industry</option>
                    {industries.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Control
                    as="select"
                    value={editForm.status || ''}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={editForm.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
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
    </div>
  )
}

export default CeoCustomersManage
