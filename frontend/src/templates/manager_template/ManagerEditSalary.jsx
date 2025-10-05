import React, { useState } from 'react'
import { Card, Form, Button, Row, Col, Table, Badge, Modal } from 'react-bootstrap'
import { toast } from 'react-toastify'

const ManagerEditSalary = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSalary, setSelectedSalary] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [formData, setFormData] = useState({
    basic_salary: '',
    allowances: '',
    deductions: '',
    effective_date: '',
    notes: ''
  })

  // Mock salary data
  const salaryData = [
    {
      id: 1,
      employee_name: 'John Doe',
      basic_salary: 50000,
      allowances: 5000,
      deductions: 2000,
      net_salary: 53000,
      effective_date: '2024-01-01',
      status: 'active'
    },
    {
      id: 2,
      employee_name: 'Jane Smith',
      basic_salary: 45000,
      allowances: 4000,
      deductions: 1800,
      net_salary: 47200,
      effective_date: '2024-01-01',
      status: 'active'
    },
    {
      id: 3,
      employee_name: 'Mike Johnson',
      basic_salary: 40000,
      allowances: 3000,
      deductions: 1500,
      net_salary: 41500,
      effective_date: '2024-01-01',
      status: 'active'
    }
  ]

  const filteredData = salaryData.filter(salary =>
    salary.employee_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (salary) => {
    setSelectedSalary(salary)
    setFormData({
      basic_salary: salary.basic_salary,
      allowances: salary.allowances,
      deductions: salary.deductions,
      effective_date: salary.effective_date,
      notes: ''
    })
    setShowEditModal(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleUpdate = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Salary record updated successfully!')
      setShowEditModal(false)
    } catch (error) {
      toast.error('Failed to update salary record')
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge bg="success">Active</Badge>
      case 'inactive':
        return <Badge bg="secondary">Inactive</Badge>
      default:
        return <Badge bg="info">{status}</Badge>
    }
  }

  return (
    <div>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Edit Salary</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="#">Manager</a></li>
                <li className="breadcrumb-item active">Edit Salary</li>
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
                    <i className="fas fa-edit mr-2"></i>
                    Salary Records Management
                  </h3>
                  <div className="card-tools">
                    <div className="input-group input-group-sm" style={{ width: 250 }}>
                      <Form.Control
                        type="text"
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <div className="input-group-append">
                        <Button variant="outline-secondary">
                          <i className="fas fa-search"></i>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Basic Salary</th>
                        <th>Allowances</th>
                        <th>Deductions</th>
                        <th>Net Salary</th>
                        <th>Effective Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((salary) => (
                        <tr key={salary.id}>
                          <td>{salary.employee_name}</td>
                          <td>${salary.basic_salary.toLocaleString()}</td>
                          <td>${salary.allowances.toLocaleString()}</td>
                          <td>${salary.deductions.toLocaleString()}</td>
                          <td><strong>${salary.net_salary.toLocaleString()}</strong></td>
                          <td>{salary.effective_date}</td>
                          <td>{getStatusBadge(salary.status)}</td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEdit(salary)}
                            >
                              <i className="fas fa-edit"></i> Edit
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

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-edit mr-2"></i>
            Edit Salary - {selectedSalary?.employee_name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Basic Salary</Form.Label>
                  <Form.Control
                    type="number"
                    name="basic_salary"
                    value={formData.basic_salary}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Allowances</Form.Label>
                  <Form.Control
                    type="number"
                    name="allowances"
                    value={formData.allowances}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Deductions</Form.Label>
                  <Form.Control
                    type="number"
                    name="deductions"
                    value={formData.deductions}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Effective Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="effective_date"
                    value={formData.effective_date}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Enter any additional notes"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Update Salary
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default ManagerEditSalary
