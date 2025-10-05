import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useMockDataStore } from '../../store/mockDataStore'

const CeoAddEmployee = () => {
  const { addEmployee } = useMockDataStore()
  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  const onSubmit = (data) => {
    const newEmployee = {
      ...data,
      id: Date.now(),
      status: 'active',
      hire_date: new Date().toISOString().split('T')[0],
      profile_pic: '/images/default-avatar.png'
    }
    
    addEmployee(newEmployee)
    toast.success('Employee added successfully!')
    reset()
  }

  return (
    <div className="content">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Add New Employee</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="name">Full Name *</label>
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
                    </div>
                    
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
                  </div>

                  <div className="row">
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
                    
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="position">Position *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.position ? 'is-invalid' : ''}`}
                          id="position"
                          {...register('position', { required: 'Position is required' })}
                        />
                        {errors.position && (
                          <div className="invalid-feedback">{errors.position.message}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="department">Department *</label>
                        <select
                          className={`form-control ${errors.department ? 'is-invalid' : ''}`}
                          id="department"
                          {...register('department', { required: 'Department is required' })}
                        >
                          <option value="">Select Department</option>
                          <option value="Engineering">Engineering</option>
                          <option value="Sales">Sales</option>
                          <option value="Marketing">Marketing</option>
                          <option value="HR">HR</option>
                          <option value="Finance">Finance</option>
                        </select>
                        {errors.department && (
                          <div className="invalid-feedback">{errors.department.message}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="division">Division *</label>
                        <select
                          className={`form-control ${errors.division ? 'is-invalid' : ''}`}
                          id="division"
                          {...register('division', { required: 'Division is required' })}
                        >
                          <option value="">Select Division</option>
                          <option value="Technology">Technology</option>
                          <option value="Business">Business</option>
                          <option value="Support">Support</option>
                        </select>
                        {errors.division && (
                          <div className="invalid-feedback">{errors.division.message}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="salary">Salary</label>
                        <input
                          type="number"
                          className="form-control"
                          id="salary"
                          {...register('salary', { min: 0 })}
                        />
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="manager_id">Manager</label>
                        <select
                          className="form-control"
                          id="manager_id"
                          {...register('manager_id')}
                        >
                          <option value="">Select Manager</option>
                          <option value="2">Jane Smith</option>
                          <option value="4">Sarah Wilson</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <button type="submit" className="btn btn-primary">
                      <i className="fas fa-save mr-2"></i>
                      Add Employee
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
        </div>
      </div>
    </div>
  )
}

export default CeoAddEmployee
