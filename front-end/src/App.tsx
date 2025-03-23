import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './components/home/Home'
import React from 'react'
import { ServiceProvider } from './contexts/ServiceContext'
import Login from './components/auth/login/Login'
import Register from './components/auth/register/Register'
import Dashboard from './components/dashboard/Dashboard'
import AdminDashboard from './components/dashboard/admin/AdminDashboard'
import VehiclesList from './components/dashboard/admin/vehicles/VehiclesList'
import UsersList from './components/dashboard/admin/users/UsersList'
import StudentsList from './components/dashboard/admin/students/StudentsList'

const App: React.FC = () => {
  return (
    <ServiceProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} >
          <Route path="admin" element={<AdminDashboard />} />
          <Route path='vehicles' element={<VehiclesList />} />
          <Route path='users' element={<UsersList />} />
          <Route path='students' element={<StudentsList />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ServiceProvider>
  )
}

export default App 