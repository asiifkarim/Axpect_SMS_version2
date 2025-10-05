import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import { toast } from 'react-toastify'
import '../styles/header-styles.module.css'

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, role, logout } = useUserStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleLogout = () => {
    console.log('Logout button clicked') // Debug log
    if (window.confirm('Your session will be terminated.\n\nProceed?')) {
      console.log('User confirmed logout') // Debug log
      logout()
      toast.success('Logged out successfully!')
      navigate('/login')
    }
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
    // Apply the collapsed class to the body
    document.body.classList.toggle('sidebar-collapse')
    // Also toggle the sidebar directly
    const sidebar = document.querySelector('.main-sidebar')
    if (sidebar) {
      sidebar.classList.toggle('sidebar-collapse')
    }
  }

  const toggleDropdown = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const dropdown = e.target.closest('.dropdown')
    const menu = dropdown.querySelector('.dropdown-menu')
    
    // Toggle dropdown manually
    if (menu.style.display === 'block') {
      menu.style.display = 'none'
    } else {
      // Close other dropdowns first
      document.querySelectorAll('.dropdown-menu').forEach(m => m.style.display = 'none')
      menu.style.display = 'block'
    }
  }

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
          menu.style.display = 'none'
        })
      }
    }

    document.addEventListener('click', handleClickOutside)
    
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  return (
    <nav className="main-header navbar navbar-expand navbar-white navbar-light">
      {/* Left navbar links */}
      <ul className="navbar-nav">
        <li className="nav-item">
          <a 
            className="nav-link" 
            data-widget="pushmenu" 
            href="#" 
            role="button"
            onClick={(e) => {
              e.preventDefault()
              toggleSidebar()
            }}
          >
            <i className="fas fa-bars"></i>
          </a>
        </li>
      </ul>

      {/* Right navbar links */}
      <ul className="navbar-nav ml-auto">
        <li className="nav-item dropdown">
          <a 
            className="nav-link dropdown-toggle" 
            href="#" 
            id="navbarDropdown" 
            role="button" 
            onClick={toggleDropdown}
            aria-expanded="false"
          >
            <img 
              src={user?.profile_pic || '/images/default-avatar.png'} 
              alt="Profile" 
              className="rounded-circle mr-2" 
              style={{ width: '25px', height: '25px', objectFit: 'cover' }}
            />
            <span className="ml-1">{user?.name || 'User'}</span>
          </a>
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <Link className="dropdown-item" to={`/${role}/profile`}>
                <i className="fas fa-user-cog mr-2"></i>
                My Profile
              </Link>
            </li>
            <li>
              <Link className="dropdown-item" to="/social/dashboard">
                <i className="fas fa-comments mr-2"></i>
                Messages
              </Link>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button 
                className="dropdown-item text-danger" 
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleLogout()
                }}
                style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Logout
              </button>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  )
}

export default Header
