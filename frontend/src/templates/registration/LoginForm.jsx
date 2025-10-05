import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useUserStore } from '../../store/userStore'
import SplashScreen from '../../components/SplashScreen'
import '../../styles/login-page.css'

const LoginForm = () => {
  const { mockLogin } = useUserStore()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    // Check if splash screen has been shown before
    const splashShown = localStorage.getItem('splashShown')
    
    // For testing purposes, always show splash screen
    // Comment out the localStorage check to always show splash
    setShowSplash(true)
    
    // Uncomment below for production behavior
    // if (splashShown) {
    //   // If splash was shown before, skip it
    //   setShowSplash(false)
    // } else {
    //   // Show splash screen for first-time visitors
    //   setShowSplash(true)
    // }
  }, [])

  const handleSplashComplete = () => {
    // Mark splash as shown
    localStorage.setItem('splashShown', 'true')
    setShowSplash(false)
  }

  // Add a function to manually reset splash screen for testing
  const resetSplashScreen = () => {
    localStorage.removeItem('splashShown')
    setShowSplash(true)
  }

  const onSubmit = async (data) => {
    const result = mockLogin(data.email, data.password)
    
    if (result.success) {
      toast.success('Login successful!')
      const role = result.user.user_type === '1' ? 'ceo' : result.user.user_type === '2' ? 'manager' : 'employee'
      navigate(`/${role}/dashboard`)
    } else {
      toast.error(result.error || 'Login failed')
    }
  }

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  return (
    <div className="login-page">
      {/* Particle Effects */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`}></div>
        ))}
      </div>

      <div className="login-box">
        <div className="login-logo">
          <a href="#"><b>Axpect</b> Technologies</a>
        </div>
        
        <div className="card">
          <div className="card-body login-card-body">
            <p className="login-box-msg">Sign in to start your session</p>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="input-group mb-3">
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="Email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
                <div className="input-group-append">
                  <div className="input-group-text">
                    <span className="fas fa-envelope"></span>
                  </div>
                </div>
                {errors.email && (
                  <div className="invalid-feedback">{errors.email.message}</div>
                )}
              </div>
              
              <div className="input-group mb-3">
                <input
                  type="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="Password"
                  {...register('password', { required: 'Password is required' })}
                />
                <div className="input-group-append">
                  <div className="input-group-text">
                    <span className="fas fa-lock"></span>
                  </div>
                </div>
                {errors.password && (
                  <div className="invalid-feedback">{errors.password.message}</div>
                )}
              </div>
              
              <div className="row">
                <div className="col-8">
                  <div className="icheck-primary">
                    <input type="checkbox" id="remember" />
                    <label htmlFor="remember">Remember Me</label>
                  </div>
                </div>
                
                <div className="col-4">
                  <button type="submit" className="btn btn-primary btn-block">
                    Sign In
                  </button>
                </div>
              </div>
            </form>

            <p className="mb-1">
              <a href="#/registration/password-reset">I forgot my password</a>
            </p>
            <p className="mb-0">
              <a href="#/registration/signup" className="text-center">Register a new membership</a>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="card mt-3">
          <div className="card-header">
            <h5 className="card-title">Demo Credentials</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-4">
                <strong>CEO/Admin:</strong><br />
                admin@axpecttech.com<br />
                password123
              </div>
              <div className="col-md-4">
                <strong>Manager:</strong><br />
                manager@axpecttech.com<br />
                password123
              </div>
              <div className="col-md-4">
                <strong>Employee:</strong><br />
                employee@axpecttech.com<br />
                password123
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-12 text-center">
                <button 
                  type="button" 
                  className="btn btn-outline-info btn-sm"
                  onClick={resetSplashScreen}
                >
                  <i className="fas fa-redo mr-1"></i>
                  Reset Splash Screen (Testing)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm