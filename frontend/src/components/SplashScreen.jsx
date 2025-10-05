import React, { useState, useEffect } from 'react'
import './SplashScreen.css'

const SplashScreen = ({ onComplete }) => {
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [showLogo, setShowLogo] = useState(false)
  const [showText, setShowText] = useState(false)
  const [showProgress, setShowProgress] = useState(false)

  const loadingTexts = [
    'Initializing Axpect Technologies...',
    'Loading Workforce Productivity Suite...',
    'Preparing Dashboard...',
    'Setting up GPS Tracking...',
    'Configuring Messaging System...',
    'Finalizing Setup...'
  ]

  useEffect(() => {
    // Show logo first
    setTimeout(() => {
      setShowLogo(true)
    }, 300)
    
    // Show text after logo
    setTimeout(() => {
      setShowText(true)
    }, 800)
    
    // Show progress bar
    setTimeout(() => {
      setShowProgress(true)
    }, 1200)

    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setTimeout(() => onComplete(), 500)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 200)

    // Cycle through loading texts
    let textIndex = 0
    const textInterval = setInterval(() => {
      setCurrentText(loadingTexts[textIndex])
      textIndex = (textIndex + 1) % loadingTexts.length
    }, 800)

    return () => {
      clearInterval(progressInterval)
      clearInterval(textInterval)
    }
  }, [onComplete])

  return (
    <div className="splash-screen">
      {/* Background Animation */}
      <div className="splash-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Main Content */}
      <div className="splash-content">
        {/* Logo Section */}
        <div className={`logo-section ${showLogo ? 'animate-in' : ''}`}>
          <div className="logo-container">
            <img 
              src="/images/company-logo.png" 
              alt="Axpect Technologies" 
              className="company-logo"
            />
            <div className="logo-glow"></div>
          </div>
        </div>

        {/* Company Name */}
        <div className={`company-name-section ${showText ? 'animate-in' : ''}`}>
          <h1 className="company-title">Axpect Technologies</h1>
          <p className="company-subtitle">Workforce Productivity Suite</p>
        </div>

        {/* Loading Section */}
        <div className={`loading-section ${showProgress ? 'animate-in' : ''}`}>
          <div className="loading-text">
            <span className="loading-text-content">{currentText}</span>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <div className="progress-text">{Math.round(loadingProgress)}%</div>
          </div>
        </div>

        {/* Footer */}
        <div className={`splash-footer ${showText ? 'animate-in' : ''}`}>
          <p className="footer-text">
            <i className="fas fa-shield-alt"></i>
            Secure • Reliable • Efficient
          </p>
        </div>
      </div>

      {/* Particle Effects */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`}></div>
        ))}
      </div>
    </div>
  )
}

export default SplashScreen
