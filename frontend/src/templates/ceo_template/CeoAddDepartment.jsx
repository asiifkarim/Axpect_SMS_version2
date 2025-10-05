import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useMockDataStore } from '../../store/mockDataStore'

const CeoAddDepartment = () => {
  const { departments, divisions, employees } = useMockDataStore()
  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  const onSubmit = (data) => {
    const newDepartment = {
      ...data,
      id: Date.now(),
      employees_count: 0,
      created_date: new Date().toISOString().split('T')[0]
    }
    
    // Add to departments store (we'll need to add this to mockDataStore)
    toast.success('Department added successfully!')
    reset()
  }

  return (
    <div className="content">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Add New Department</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="name">Department Name *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                          id="name"
                          placeholder="e.g., Engineering, Sales, Marketing"
                          {...register('name', { required: 'Department name is required' })}
                        />
                        {errors.name && (
                          <div className="invalid-feedback">{errors.name.message}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="code">Department Code</label>
                        <input
                          type="text"
                          className="form-control"
                          id="code"
                          placeholder="e.g., ENG, SAL, MKT"
                          {...register('code')}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="division">Division *</label>
                        <select
                          className={`form-control ${errors.division ? 'is-invalid' : ''}`}
                          id="division"
                          {...register('division', { required: 'Division is required' })}
                        >
                          <option value="">Select Division</option>
                          {divisions.map(division => (
                            <option key={division.id} value={division.name}>
                              {division.name}
                            </option>
                          ))}
                        </select>
                        {errors.division && (
                          <div className="invalid-feedback">{errors.division.message}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="manager">Department Manager</label>
                        <select
                          className="form-control"
                          id="manager"
                          {...register('manager')}
                        >
                          <option value="">Select Manager</option>
                          {employees.filter(emp => emp.user_type === '2').map(manager => (
                            <option key={manager.id} value={manager.name}>
                              {manager.name} - {manager.position}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="budget">Annual Budget</label>
                        <input
                          type="number"
                          className="form-control"
                          id="budget"
                          placeholder="Annual budget allocation"
                          {...register('budget', { min: 0 })}
                        />
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="location">Location</label>
                        <input
                          type="text"
                          className="form-control"
                          id="location"
                          placeholder="Physical location or office"
                          {...register('location')}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                      className="form-control"
                      id="description"
                      rows="3"
                      placeholder="Brief description of the department..."
                      {...register('description')}
                    />
                  </div>

                  <div className="form-group">
                    <button type="submit" className="btn btn-primary">
                      <i className="fas fa-save mr-2"></i>
                      Add Department
                    </button>
                    <button type="button" className="btn btn-secondary ml-2" onClick={() => reset()}>
                      <i className="fas fa-undo mr-2"></i>
                      Reset
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Existing Departments</h3>
              </div>
              <div className="card-body">
                <div className="list-group">
                  {departments.map(department => (
                    <div key={department.id} className="list-group-item">
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{department.name}</h6>
                        <span className="badge badge-primary">{department.employees_count}</span>
                      </div>
                      <p className="mb-1 text-muted">{department.division}</p>
                      <small>Manager: {department.manager || 'Not assigned'}</small>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card mt-3">
              <div className="card-header">
                <h3 className="card-title">Department Statistics</h3>
              </div>
              <div className="card-body">
                <div className="info-box">
                  <span className="info-box-icon bg-info">
                    <i className="fas fa-building"></i>
                  </span>
                  <div className="info-box-content">
                    <span className="info-box-text">Total Departments</span>
                    <span className="info-box-number">{departments.length}</span>
                  </div>
                </div>
                
                <div className="info-box">
                  <span className="info-box-icon bg-success">
                    <i className="fas fa-users"></i>
                  </span>
                  <div className="info-box-content">
                    <span className="info-box-text">Total Employees</span>
                    <span className="info-box-number">
                      {departments.reduce((sum, dept) => sum + dept.employees_count, 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CeoAddDepartment