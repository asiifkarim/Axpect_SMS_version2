import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useUserStore } from '../../store/userStore'

const CeoViewProfile = () => {
  const { user, setUser } = useUserStore()
  const [isEditing, setIsEditing] = useState(false)
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      position: 'CEO/Admin',
      department: 'Executive',
      division: 'Management'
    }
  })

  const onSubmit = (data) => {
    const updatedUser = {
      ...user,
      ...data,
      updated_at: new Date().toISOString()
    }
    
    setUser(updatedUser)
    toast.success('Profile updated successfully!')
    setIsEditing(false)
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
  }

  return (
    <div className="content">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-4">
            {/* Profile Card */}
            <div className="card card-primary card-outline">
              <div className="card-body box-profile">
                <div className="text-center">
                  <img 
                    className="profile-user-img img-fluid img-circle" 
                    src={user?.profile_pic || '/images/default-avatar.png'} 
                    alt="User profile picture"
                  />
                </div>

                <h3 className="profile-username text-center">{user?.name}</h3>

                <p className="text-muted text-center">{user?.position || 'CEO/Admin'}</p>

                <ul className="list-group list-group-unbordered mb-3">
                  <li className="list-group-item">
                    <b>Email</b> <a className="float-right">{user?.email}</a>
                  </li>
                  <li className="list-group-item">
                    <b>Phone</b> <a className="float-right">{user?.phone || 'Not provided'}</a>
                  </li>
                  <li className="list-group-item">
                    <b>Department</b> <a className="float-right">{user?.department || 'Executive'}</a>
                  </li>
                  <li className="list-group-item">
                    <b>Division</b> <a className="float-right">{user?.division || 'Management'}</a>
                  </li>
                </ul>

                <button 
                  className="btn btn-primary btn-block"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <i className="fas fa-edit mr-2"></i>
                  {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </button>
              </div>
            </div>

            {/* About Me Card */}
            <div className="card card-primary">
              <div className="card-header">
                <h3 className="card-title">About Me</h3>
              </div>
              <div className="card-body">
                <strong><i className="fas fa-book mr-1"></i> Role</strong>
                <p className="text-muted">Chief Executive Officer</p>
                <hr />

                <strong><i className="fas fa-map-marker-alt mr-1"></i> Location</strong>
                <p className="text-muted">Axpect Technologies HQ</p>
                <hr />

                <strong><i className="fas fa-pencil-alt mr-1"></i> Responsibilities</strong>
                <p className="text-muted">
                  Strategic planning, executive management, organizational oversight, 
                  and decision-making for the entire organization.
                </p>
                <hr />

                <strong><i className="fas fa-calendar mr-1"></i> Member Since</strong>
                <p className="text-muted">{new Date().getFullYear()}</p>
              </div>
            </div>
          </div>

          <div className="col-md-8">
            {/* Profile Edit Form */}
            {isEditing ? (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Edit Profile</h3>
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
                          <label htmlFor="position">Position</label>
                          <input
                            type="text"
                            className="form-control"
                            id="position"
                            value="CEO/Admin"
                            disabled
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="department">Department</label>
                          <input
                            type="text"
                            className="form-control"
                            id="department"
                            value="Executive"
                            disabled
                          />
                        </div>
                      </div>
                      
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="division">Division</label>
                          <input
                            type="text"
                            className="form-control"
                            id="division"
                            value="Management"
                            disabled
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <button type="submit" className="btn btn-primary">
                        <i className="fas fa-save mr-2"></i>
                        Save Changes
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-secondary ml-2" 
                        onClick={handleCancel}
                      >
                        <i className="fas fa-times mr-2"></i>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              /* Profile Information Display */
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Profile Information</h3>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="info-box">
                        <span className="info-box-icon bg-info">
                          <i className="fas fa-user"></i>
                        </span>
                        <div className="info-box-content">
                          <span className="info-box-text">Full Name</span>
                          <span className="info-box-number">{user?.name}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="info-box">
                        <span className="info-box-icon bg-success">
                          <i className="fas fa-envelope"></i>
                        </span>
                        <div className="info-box-content">
                          <span className="info-box-text">Email</span>
                          <span className="info-box-number">{user?.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="info-box">
                        <span className="info-box-icon bg-warning">
                          <i className="fas fa-phone"></i>
                        </span>
                        <div className="info-box-content">
                          <span className="info-box-text">Phone</span>
                          <span className="info-box-number">{user?.phone || 'Not provided'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="info-box">
                        <span className="info-box-icon bg-danger">
                          <i className="fas fa-briefcase"></i>
                        </span>
                        <div className="info-box-content">
                          <span className="info-box-text">Position</span>
                          <span className="info-box-number">CEO/Admin</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="info-box">
                        <span className="info-box-icon bg-primary">
                          <i className="fas fa-building"></i>
                        </span>
                        <div className="info-box-content">
                          <span className="info-box-text">Department</span>
                          <span className="info-box-number">Executive</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="info-box">
                        <span className="info-box-icon bg-secondary">
                          <i className="fas fa-sitemap"></i>
                        </span>
                        <div className="info-box-content">
                          <span className="info-box-text">Division</span>
                          <span className="info-box-number">Management</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Timeline */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Recent Activity</h3>
              </div>
              <div className="card-body">
                <div className="timeline">
                  <div className="time-label">
                    <span className="bg-red">Today</span>
                  </div>
                  
                  <div>
                    <i className="fas fa-user bg-blue"></i>
                    <div className="timeline-item">
                      <span className="time"><i className="fas fa-clock"></i> 12:05</span>
                      <h3 className="timeline-header">Profile Updated</h3>
                      <div className="timeline-body">
                        Your profile information has been updated successfully.
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <i className="fas fa-users bg-green"></i>
                    <div className="timeline-item">
                      <span className="time"><i className="fas fa-clock"></i> 10:30</span>
                      <h3 className="timeline-header">Employee Added</h3>
                      <div className="timeline-body">
                        New employee John Doe has been added to the Engineering department.
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <i className="fas fa-map-marker-alt bg-yellow"></i>
                    <div className="timeline-item">
                      <span className="time"><i className="fas fa-clock"></i> 09:15</span>
                      <h3 className="timeline-header">GPS Dashboard Accessed</h3>
                      <div className="timeline-body">
                        You viewed the GPS tracking dashboard to monitor employee locations.
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <i className="fas fa-clock bg-gray"></i>
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

export default CeoViewProfile
