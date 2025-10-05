import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useMockDataStore } from '../../store/mockDataStore'

const CeoAddDivision = () => {
  const { divisions, departments } = useMockDataStore()
  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  const onSubmit = (data) => {
    const newDivision = {
      ...data,
      id: Date.now(),
      departments_count: 0,
      employees_count: 0,
      created_date: new Date().toISOString().split('T')[0]
    }
    
    // Add to divisions store (we'll need to add this to mockDataStore)
    toast.success('Division added successfully!')
    reset()
  }

  return (
    <div className="content">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Add New Division</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="name">Division Name *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                          id="name"
                          placeholder="e.g., Technology, Business, Support"
                          {...register('name', { required: 'Division name is required' })}
                        />
                        {errors.name && (
                          <div className="invalid-feedback">{errors.name.message}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="code">Division Code</label>
                        <input
                          type="text"
                          className="form-control"
                          id="code"
                          placeholder="e.g., TECH, BIZ, SUPP"
                          {...register('code')}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                          className="form-control"
                          id="description"
                          rows="3"
                          placeholder="Brief description of the division..."
                          {...register('description')}
                        />
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="head">Division Head</label>
                        <input
                          type="text"
                          className="form-control"
                          id="head"
                          placeholder="Name of division head"
                          {...register('head')}
                        />
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
                    <button type="submit" className="btn btn-primary">
                      <i className="fas fa-save mr-2"></i>
                      Add Division
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
                <h3 className="card-title">Existing Divisions</h3>
              </div>
              <div className="card-body">
                <div className="list-group">
                  {divisions.map(division => (
                    <div key={division.id} className="list-group-item">
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{division.name}</h6>
                        <span className="badge badge-primary">{division.departments_count}</span>
                      </div>
                      <p className="mb-1 text-muted">{division.employees_count} employees</p>
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

export default CeoAddDivision
