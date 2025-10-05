import React, { useState, useRef } from 'react'
import { useUserStore } from '../store/userStore'
import { toast } from 'react-toastify'
import DefaultAvatar from './DefaultAvatar'

const PremiumUserProfile = ({ user, role }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [profileImage, setProfileImage] = useState(user?.profile_pic || '/images/default-avatar.png')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)
  const { updateUserProfile } = useUserStore()

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    setIsUploading(true)

    try {
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file)
      setProfileImage(previewUrl)
      
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update user profile in store
      updateUserProfile({ profile_pic: previewUrl })
      
      toast.success('Profile picture updated successfully!')
    } catch (error) {
      toast.error('Failed to upload image. Please try again.')
      setProfileImage(user?.profile_pic || '/images/default-avatar.png')
    } finally {
      setIsUploading(false)
    }
  }

  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleSaveClick = () => {
    setIsEditing(false)
    toast.success('Profile updated successfully!')
  }

  const handleCancelClick = () => {
    setIsEditing(false)
  }

  const getRoleDisplay = () => {
    switch (role) {
      case 'ceo': return 'CEO/Admin'
      case 'manager': return 'Manager'
      case 'employee': return 'Employee'
      default: return 'User'
    }
  }

  const getRoleColor = () => {
    switch (role) {
      case 'ceo': return 'danger'
      case 'manager': return 'warning'
      case 'employee': return 'info'
      default: return 'secondary'
    }
  }

  return (
    <div className="premium-user-panel">
      {/* Profile Image Section */}
      <div className="profile-image-section">
        <div className="profile-image-container">
          {profileImage && profileImage !== '/images/default-avatar.png' ? (
            <img 
              src={profileImage} 
              className="profile-image" 
              alt="User Profile" 
            />
          ) : (
            <DefaultAvatar size={80} className="profile-image" />
          )}
          
          {/* Upload Overlay */}
          <div className="profile-image-overlay">
            <button 
              className="btn btn-sm btn-primary upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-camera"></i>
              )}
            </button>
          </div>
          
          {/* Online Status Indicator */}
          <div className="online-status-indicator">
            <span className="status-dot bg-success"></span>
          </div>
        </div>
        
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      </div>

      {/* User Info Section */}
      <div className="user-info-section">
        <div className="user-name">
          <h4 className="mb-0">{user?.name || 'User Name'}</h4>
          <div className="user-role">
            <span className={`badge badge-${getRoleColor()} badge-sm`}>
              {getRoleDisplay()}
            </span>
          </div>
        </div>
        
        <div className="user-details">
          <div className="detail-item">
            <i className="fas fa-envelope text-muted"></i>
            <span className="detail-text">{user?.email || 'user@example.com'}</span>
          </div>
          <div className="detail-item">
            <i className="fas fa-building text-muted"></i>
            <span className="detail-text">{user?.department || 'Department'}</span>
          </div>
          <div className="detail-item">
            <i className="fas fa-calendar text-muted"></i>
            <span className="detail-text">Joined {user?.hire_date ? new Date(user.hire_date).getFullYear() : '2024'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="profile-actions">
          {!isEditing ? (
            <div className="action-buttons">
              <button 
                className="btn btn-sm btn-outline-primary edit-btn"
                onClick={handleEditClick}
              >
                <i className="fas fa-edit mr-1"></i>
                Edit Profile
              </button>
              <div className="dropdown">
                <button 
                  className="btn btn-sm btn-outline-secondary settings-btn"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <i className="fas fa-cog"></i>
                </button>
                <div className="dropdown-menu dropdown-menu-right">
                  <a className="dropdown-item" href="#">
                    <i className="fas fa-user-cog mr-2"></i>
                    Account Settings
                  </a>
                  <a className="dropdown-item" href="#">
                    <i className="fas fa-bell mr-2"></i>
                    Notifications
                  </a>
                  <a className="dropdown-item" href="#">
                    <i className="fas fa-shield-alt mr-2"></i>
                    Privacy
                  </a>
                  <div className="dropdown-divider"></div>
                  <a className="dropdown-item" href="#">
                    <i className="fas fa-sign-out-alt mr-2"></i>
                    Sign Out
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="edit-actions">
              <button 
                className="btn btn-sm btn-success save-btn"
                onClick={handleSaveClick}
              >
                <i className="fas fa-check mr-1"></i>
                Save
              </button>
              <button 
                className="btn btn-sm btn-secondary cancel-btn"
                onClick={handleCancelClick}
              >
                <i className="fas fa-times mr-1"></i>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-item">
          <div className="stat-number">98%</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">24</div>
          <div className="stat-label">Tasks</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">5</div>
          <div className="stat-label">Projects</div>
        </div>
      </div>
    </div>
  )
}

export default PremiumUserProfile
