import React from 'react'

const DefaultAvatar = ({ size = 80, className = '' }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 80 80" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:'#667eea', stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:'#764ba2', stopOpacity:1}} />
        </linearGradient>
      </defs>
      
      {/* Background Circle */}
      <circle 
        cx="40" 
        cy="40" 
        r="40" 
        fill="url(#avatarGradient)"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="2"
      />
      
      {/* User Icon */}
      <g transform="translate(40, 40)">
        {/* Head */}
        <circle 
          cx="0" 
          cy="-8" 
          r="12" 
          fill="rgba(255, 255, 255, 0.9)"
        />
        
        {/* Body */}
        <path 
          d="M-15, 8 Q-15, 20, 0, 20 Q15, 20, 15, 8 L15, 25 Q15, 35, 0, 35 Q-15, 35, -15, 25 Z" 
          fill="rgba(255, 255, 255, 0.9)"
        />
      </g>
      
      {/* Decorative Elements */}
      <circle 
        cx="20" 
        cy="20" 
        r="2" 
        fill="rgba(255, 255, 255, 0.3)"
        opacity="0.6"
      />
      <circle 
        cx="60" 
        cy="25" 
        r="1.5" 
        fill="rgba(255, 255, 255, 0.2)"
        opacity="0.4"
      />
      <circle 
        cx="65" 
        cy="55" 
        r="1" 
        fill="rgba(255, 255, 255, 0.2)"
        opacity="0.3"
      />
    </svg>
  )
}

export default DefaultAvatar
