import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import Footer from './Footer'
import styles from '../styles/globals.module.css'

const BaseLayout = () => {
  return (
    <div className="wrapper">
      {/* Header */}
      <Header />
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Content Wrapper */}
      <div className="content-wrapper">
        <Outlet />
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}

export default BaseLayout
