import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useMockDataStore } from '../../store/mockDataStore'

const CeoAddManager = () => {
  const { addEmployee } = useMockDataStore() // Using same store for managers
  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  const onSubmit = (data) => {
    const newManager = {
      ...data,
      id: Date.now(),
      user_type: '2', // Manager type
      status: 'active',
      hire_date: new Date().toISOString().split('T')[0],
      profile_pic: '/images/default-avatar.png',
      employees_count: 0
    }
    
    addEmployee(newManager)
    toast.success('Manager added successfully!')
    reset()
  }

  return (
    <div className="content">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Add New Manager</h3>
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
                          placeholder="e.g., Team Lead, Department Manager"
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
                          placeholder="Annual salary"
                          {...register('salary', { min: 0 })}
                        />
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="max_employees">Max Team Size</label>
                        <input
                          type="number"
                          className="form-control"
                          id="max_employees"
                          placeholder="Maximum employees to manage"
                          {...register('max_employees', { min: 1, max: 50 })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <button type="submit" className="btn btn-primary">
                      <i className="fas fa-save mr-2"></i>
                      Add Manager
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

export default CeoAddManager