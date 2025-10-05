import React, { useState } from 'react'
import { Card, Row, Col, Table, Badge, Button, Alert, ProgressBar } from 'react-bootstrap'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { toast } from 'react-toastify'

const EmployeeSalary = () => {
  const [selectedYear, setSelectedYear] = useState('2024')

  // Mock salary data
  const currentSalary = {
    basic: 75000,
    allowances: 15000,
    bonuses: 5000,
    deductions: 2000,
    net: 93000,
    currency: 'USD'
  }

  const monthlySalary = [
    { month: 'Jan', amount: 93000, bonus: 2000 },
    { month: 'Feb', amount: 93000, bonus: 1500 },
    { month: 'Mar', amount: 93000, bonus: 3000 },
    { month: 'Apr', amount: 93000, bonus: 1000 },
    { month: 'May', amount: 93000, bonus: 2500 },
    { month: 'Jun', amount: 93000, bonus: 4000 },
    { month: 'Jul', amount: 93000, bonus: 1800 },
    { month: 'Aug', amount: 93000, bonus: 2200 },
    { month: 'Sep', amount: 93000, bonus: 3500 },
    { month: 'Oct', amount: 93000, bonus: 1200 },
    { month: 'Nov', amount: 93000, bonus: 2800 },
    { month: 'Dec', amount: 93000, bonus: 5000 }
  ]

  const yearlyComparison = [
    { year: '2022', amount: 85000 },
    { year: '2023', amount: 89000 },
    { year: '2024', amount: 93000 }
  ]

  const salaryBreakdown = [
    { component: 'Basic Salary', amount: currentSalary.basic, percentage: 80.6 },
    { component: 'Housing Allowance', amount: 8000, percentage: 8.6 },
    { component: 'Transport Allowance', amount: 3000, percentage: 3.2 },
    { component: 'Meal Allowance', amount: 2000, percentage: 2.2 },
    { component: 'Medical Allowance', amount: 2000, percentage: 2.2 },
    { component: 'Performance Bonus', amount: currentSalary.bonuses, percentage: 5.4 },
    { component: 'Tax Deduction', amount: -15000, percentage: -16.1 },
    { component: 'Insurance Deduction', amount: -2000, percentage: -2.2 },
    { component: 'Retirement Fund', amount: -3000, percentage: -3.2 }
  ]

  const payslips = [
    { id: 1, month: 'December 2024', amount: 98000, status: 'paid', downloadUrl: '#' },
    { id: 2, month: 'November 2024', amount: 95800, status: 'paid', downloadUrl: '#' },
    { id: 3, month: 'October 2024', amount: 94200, status: 'paid', downloadUrl: '#' },
    { id: 4, month: 'September 2024', amount: 96500, status: 'paid', downloadUrl: '#' },
    { id: 5, month: 'August 2024', amount: 95200, status: 'paid', downloadUrl: '#' }
  ]

  const handleDownloadPayslip = (payslip) => {
    toast.info(`Downloading payslip for ${payslip.month}...`)
    setTimeout(() => {
      toast.success('Payslip downloaded successfully!')
    }, 1500)
  }

  const handleRequestSalaryReview = () => {
    toast.info('Salary review request submitted to HR...')
    setTimeout(() => {
      toast.success('Request submitted successfully!')
    }, 2000)
  }

  const handleSalaryInquiry = () => {
    toast.info('Redirecting to salary inquiry form...')
    setTimeout(() => {
      toast.success('Salary inquiry form opened!')
    }, 1000)
  }

  const handleGenerateReport = () => {
    toast.info('Generating salary report...')
    setTimeout(() => {
      toast.success('Salary report generated and downloaded!')
    }, 2000)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currentSalary.currency
    }).format(amount)
  }

  return (
    <div>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Salary Information</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="#">Employee</a></li>
                <li className="breadcrumb-item active">Salary</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          {/* Current Salary Overview */}
          <Row className="mb-4">
            <Col lg={12}>
              <Alert variant="success">
                <h4 className="alert-heading">
                  <i className="fas fa-dollar-sign mr-2"></i>
                  Current Annual Salary: {formatCurrency(currentSalary.net)}
                </h4>
                <p className="mb-0">
                  Last updated: December 2024 | Next review: March 2025
                </p>
              </Alert>
            </Col>
          </Row>

          {/* Salary Statistics */}
          <Row className="mb-4">
            <Col lg={3} md={6}>
              <Card className="bg-primary text-white">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4>{formatCurrency(currentSalary.basic)}</h4>
                      <p className="mb-0">Basic Salary</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-money-bill-wave fa-2x"></i>
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
                      <h4>{formatCurrency(currentSalary.allowances)}</h4>
                      <p className="mb-0">Allowances</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-plus-circle fa-2x"></i>
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
                      <h4>{formatCurrency(currentSalary.bonuses)}</h4>
                      <p className="mb-0">Bonuses</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-gift fa-2x"></i>
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
                      <h4>{formatCurrency(currentSalary.net)}</h4>
                      <p className="mb-0">Net Salary</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-calculator fa-2x"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Charts */}
          <Row className="mb-4">
            <Col lg={8}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-chart-bar mr-2"></i>
                    Monthly Salary Trend ({selectedYear})
                  </h3>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlySalary}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Bar dataKey="amount" fill="#007bff" name="Base Salary" />
                      <Bar dataKey="bonus" fill="#28a745" name="Bonus" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-chart-line mr-2"></i>
                    Yearly Growth
                  </h3>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={yearlyComparison}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Line type="monotone" dataKey="amount" stroke="#28a745" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Salary Breakdown */}
          <Row className="mb-4">
            <Col lg={12}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-list mr-2"></i>
                    Detailed Salary Breakdown
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>Component</th>
                        <th>Amount</th>
                        <th>Percentage</th>
                        <th>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salaryBreakdown.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{item.component}</strong>
                          </td>
                          <td>
                            <span className={item.amount < 0 ? 'text-danger' : 'text-success'}>
                              {formatCurrency(item.amount)}
                            </span>
                          </td>
                          <td>
                            <ProgressBar 
                              now={Math.abs(item.percentage)} 
                              variant={item.amount < 0 ? 'danger' : 'success'}
                              style={{ width: '100px' }}
                            />
                            <small className="ml-2">{item.percentage}%</small>
                          </td>
                          <td>
                            <Badge bg={item.amount < 0 ? 'danger' : 'success'}>
                              {item.amount < 0 ? 'Deduction' : 'Addition'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Payslips and Actions */}
          <Row>
            <Col lg={8}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-file-invoice mr-2"></i>
                    Recent Payslips
                  </h3>
                </Card.Header>
                <Card.Body>
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payslips.map((payslip) => (
                        <tr key={payslip.id}>
                          <td>
                            <strong>{payslip.month}</strong>
                          </td>
                          <td>{formatCurrency(payslip.amount)}</td>
                          <td>
                            <Badge bg="success">Paid</Badge>
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleDownloadPayslip(payslip)}
                            >
                              <i className="fas fa-download mr-1"></i>
                              Download
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4}>
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-cogs mr-2"></i>
                    Salary Actions
                  </h3>
                </Card.Header>
                <Card.Body>
                  <div className="d-grid gap-2">
                    <Button variant="primary" onClick={handleRequestSalaryReview}>
                      <i className="fas fa-chart-line mr-2"></i>
                      Request Salary Review
                    </Button>
                    <Button variant="info" onClick={handleSalaryInquiry}>
                      <i className="fas fa-question-circle mr-2"></i>
                      Salary Inquiry
                    </Button>
                    <Button variant="success" onClick={handleGenerateReport}>
                      <i className="fas fa-file-alt mr-2"></i>
                      Generate Report
                    </Button>
                  </div>
                </Card.Body>
              </Card>

              {/* Salary Goals */}
              <Card className="mt-3">
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-target mr-2"></i>
                    Salary Goals
                  </h3>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <h6>Target Annual Salary</h6>
                    <h4 className="text-primary">{formatCurrency(100000)}</h4>
                    <ProgressBar 
                      now={(currentSalary.net / 100000) * 100} 
                      variant="primary"
                      className="mb-2"
                    />
                    <small>93% of target achieved</small>
                  </div>
                  <div className="mb-3">
                    <h6>Next Review Date</h6>
                    <p className="text-muted">March 15, 2025</p>
                  </div>
                  <div>
                    <h6>Performance Rating</h6>
                    <Badge bg="success" className="fs-6">Excellent</Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  )
}

export default EmployeeSalary
