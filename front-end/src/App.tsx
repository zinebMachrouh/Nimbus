import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './components/home/Home'
import React from 'react'
import { ServiceProvider } from './contexts/ServiceContext'
import Login from './components/auth/login/Login'
import Register from './components/auth/register/Register'
import Dashboard from './components/dashboard/Dashboard'

const App: React.FC = () => {
  return (
    <ServiceProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ServiceProvider>
  )
}

export default App 