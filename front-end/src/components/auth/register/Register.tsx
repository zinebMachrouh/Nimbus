import React from "react"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FaArrowLeft, FaEye, FaEyeSlash, FaExclamationCircle, FaCheckCircle, FaTimes } from "react-icons/fa"
import "./Register.css"
import { useAuthService, useSchoolService, useVehicleService } from "../../../contexts/ServiceContext"
import { UserRole } from "../../../core/entities/user.entity"
import { RegisterRequest } from "../../../core/dto/auth.dto"
import { VehicleStatus } from "../../../core/entities/vehicle.entity"
import { CreateSchoolRequest } from "../../../core/dto/school.dto.ts"
import { CreateVehicleRequest } from "../../../core/dto/vehicle.dto.ts"

interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`toast toast-${type}`}>
            <div className="toast-icon">
                {type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
            </div>
            <div className="toast-message">{message}</div>
            <button className="toast-close" onClick={onClose} aria-label="Close notification">
                <FaTimes />
            </button>
        </div>
    );
};

interface UserData {
    firstName: string
    lastName: string
    username: string
    email: string
    password: string
    confirmPassword: string
    phoneNumber: string
    role: UserRole
}

interface SchoolData {
    schoolName: string
    schoolAddress: string
    schoolPhoneNumber: string
    latitude: number
    longitude: number
}

interface VehicleData {
    vehicleNumber: string
    make: string
    model: string
    year: number
    capacity: number
    insuranceExpiryDate: string
    registrationExpiryDate: string
    lastMaintenanceDate: string
    currentMileage: number
    trackingDeviceId: string
    initialLatitude: number
    initialLongitude: number
}

// Combined type for all registration data
type RegistrationData = UserData & SchoolData & VehicleData

// User Registration Step Component
const UserRegistration = ({
                              userData,
                              onSubmit,
                              isLoading,
                              errorMessage,
                          }: {
    userData: RegistrationData
    onSubmit: (data: RegistrationData) => void
    isLoading: boolean
    errorMessage: string | null
}) => {


    const [hidePassword, setHidePassword] = useState(true)
    const [hideConfirmPassword, setHideConfirmPassword] = useState(true)
    const [formData, setFormData] = useState<RegistrationData>(userData)
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {}

        // First name validation
        if (!formData.firstName.trim()) {
            errors.firstName = "First name is required"
        } else if (formData.firstName.length < 2) {
            errors.firstName = "First name must be at least 2 characters"
        }

        // Last name validation
        if (!formData.lastName.trim()) {
            errors.lastName = "Last name is required"
        } else if (formData.lastName.length < 2) {
            errors.lastName = "Last name must be at least 2 characters"
        }

        // Username validation
        if (!formData.username.trim()) {
            errors.username = "Username is required"
        } else if (formData.username.length < 4) {
            errors.username = "Username must be at least 4 characters"
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!formData.email.trim()) {
            errors.email = "Email is required"
        } else if (!emailRegex.test(formData.email)) {
            errors.email = "Please enter a valid email address"
        }

        // Phone number validation
        const phoneRegex = /^\+?[0-9]{10,15}$/
        if (!formData.phoneNumber.trim()) {
            errors.phoneNumber = "Phone number is required"
        } else if (!phoneRegex.test(formData.phoneNumber.replace(/\s/g, ''))) {
            errors.phoneNumber = "Please enter a valid phone number"
        }

        // Password validation
        if (!formData.password) {
            errors.password = "Password is required"
        } else if (formData.password.length < 8) {
            errors.password = "Password must be at least 8 characters"
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            errors.password = "Password must contain uppercase, lowercase and numbers"
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            errors.confirmPassword = "Please confirm your password"
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = "Passwords don't match"
        }

        setValidationErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (validateForm()) {
            onSubmit(formData)
        }
    }

    const handleInputChange = (field: string, value: string | number) => {
        setFormData({ ...formData, [field]: value })
        
        // Clear validation error when user starts typing
        if (validationErrors[field]) {
            setValidationErrors({ ...validationErrors, [field]: '' })
        }
    }

    return (
        <div className="step-content">
            <h1>CREATE AN ACCOUNT</h1>
            <h2>
                Admin Registration <span>.</span>
            </h2>
            <p className="login-link">
                Already have an account? <Link to="/login">Log in</Link>
            </p>

            {errorMessage && (
                <div className="error-message">
                    <FaExclamationCircle />
                    <span>{errorMessage}</span>
                </div>
            )}

            <form onSubmit={handleFormSubmit} className="registration-form">
                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="firstName">First Name</label>
                        <div className="input-wrapper">
                            <input
                                id="firstName"
                                type="text"
                                placeholder="Enter your first name"
                                value={formData.firstName}
                                onChange={(e) => handleInputChange("firstName", e.target.value)}
                                className={validationErrors.firstName ? "error" : ""}
                                required
                            />
                        </div>
                        {validationErrors.firstName && (
                            <div className="field-error">{validationErrors.firstName}</div>
                        )}
                    </div>

                    <div className="form-field">
                        <label htmlFor="lastName">Last Name</label>
                        <div className="input-wrapper">
                            <input
                                id="lastName"
                                type="text"
                                placeholder="Enter your last name"
                                value={formData.lastName}
                                onChange={(e) => handleInputChange("lastName", e.target.value)}
                                className={validationErrors.lastName ? "error" : ""}
                                required
                            />
                        </div>
                        {validationErrors.lastName && (
                            <div className="field-error">{validationErrors.lastName}</div>
                        )}
                    </div>
                </div>

                <div className="form-field">
                    <label htmlFor="username">Username</label>
                    <div className="input-wrapper">
                        <input
                            id="username"
                            type="text"
                            placeholder="Choose a username"
                            value={formData.username}
                            onChange={(e) => handleInputChange("username", e.target.value)}
                            className={validationErrors.username ? "error" : ""}
                            required
                        />
                    </div>
                    {validationErrors.username && (
                        <div className="field-error">{validationErrors.username}</div>
                    )}
                </div>

                <div className="form-field">
                    <label htmlFor="email">Email</label>
                    <div className="input-wrapper">
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email address"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className={validationErrors.email ? "error" : ""}
                            required
                        />
                    </div>
                    {validationErrors.email && (
                        <div className="field-error">{validationErrors.email}</div>
                    )}
                </div>

                <div className="form-field">
                    <label htmlFor="phoneNumber">Phone Number</label>
                    <div className="input-wrapper">
                        <input
                            id="phoneNumber"
                            type="tel"
                            placeholder="Enter your phone number"
                            value={formData.phoneNumber}
                            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                            className={validationErrors.phoneNumber ? "error" : ""}
                            required
                        />
                    </div>
                    {validationErrors.phoneNumber && (
                        <div className="field-error">{validationErrors.phoneNumber}</div>
                    )}
                </div>

                <div className="form-field">
                    <label htmlFor="password">Password</label>
                    <div className="input-wrapper">
                        <input
                            id="password"
                            type={hidePassword ? "password" : "text"}
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={(e) => handleInputChange("password", e.target.value)}
                            className={validationErrors.password ? "error" : ""}
                            required
                        />
                        <button type="button" className="toggle-password" onClick={() => setHidePassword(!hidePassword)}>
                            {hidePassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    {validationErrors.password && (
                        <div className="field-error">{validationErrors.password}</div>
                    )}
                </div>

                <div className="form-field">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className="input-wrapper">
                        <input
                            id="confirmPassword"
                            type={hideConfirmPassword ? "password" : "text"}
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                            className={validationErrors.confirmPassword ? "error" : ""}
                            required
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setHideConfirmPassword(!hideConfirmPassword)}
                        >
                            {hideConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    {validationErrors.confirmPassword && (
                        <div className="field-error">{validationErrors.confirmPassword}</div>
                    )}
                </div>

                <div className="action-buttons">
                    <Link to="/" className="btn btn-back">
                        Cancel
                    </Link>
                    <button type="submit" className="btn btn-next" disabled={isLoading}>
                        {isLoading ? <div className="spinner"></div> : <span>Next Step</span>}
                    </button>
                </div>
            </form>
        </div>
    )
}

// School Registration Step Component
const SchoolRegistration = ({
                                schoolData,
                                onSubmit,
                                onBack,
                                isLoading,
                                errorMessage,
                            }: {
    schoolData: RegistrationData
    onSubmit: (data: RegistrationData) => void
    onBack: () => void
    isLoading: boolean
    errorMessage: string | null
}) => {
    const [formData, setFormData] = useState<RegistrationData>(schoolData)
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {}

        // School name validation
        if (!formData.schoolName.trim()) {
            errors.schoolName = "School name is required"
        } else if (formData.schoolName.length < 3) {
            errors.schoolName = "School name must be at least 3 characters"
        }

        // School address validation
        if (!formData.schoolAddress.trim()) {
            errors.schoolAddress = "School address is required"
        } else if (formData.schoolAddress.length < 5) {
            errors.schoolAddress = "Please enter a complete address"
        }

        // School phone number validation
        const phoneRegex = /^\+?[0-9]{10,15}$/
        if (!formData.schoolPhoneNumber.trim()) {
            errors.schoolPhoneNumber = "Phone number is required"
        } else if (!phoneRegex.test(formData.schoolPhoneNumber.replace(/\s/g, ''))) {
            errors.schoolPhoneNumber = "Please enter a valid phone number"
        }

        // Latitude validation (if provided)
        if (formData.latitude !== 0 && (formData.latitude < -90 || formData.latitude > 90)) {
            errors.latitude = "Latitude must be between -90 and 90 degrees"
        }

        // Longitude validation (if provided)
        if (formData.longitude !== 0 && (formData.longitude < -180 || formData.longitude > 180)) {
            errors.longitude = "Longitude must be between -180 and 180 degrees"
        }

        setValidationErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (validateForm()) {
            onSubmit(formData)
        }
    }

    const handleInputChange = (field: string, value: string | number) => {
        setFormData({ ...formData, [field]: value })
        
        // Clear validation error when user starts typing
        if (validationErrors[field]) {
            setValidationErrors({ ...validationErrors, [field]: '' })
        }
    }

    return (
        <div className="step-content">
            <h1>SCHOOL INFORMATION</h1>
            <h2>
                Register Your School <span>.</span>
            </h2>
            <p className="login-link">Enter the details of the school you want to manage</p>

            {errorMessage && (
                <div className="error-message">
                    <FaExclamationCircle />
                    <span>{errorMessage}</span>
                </div>
            )}

            <form onSubmit={handleFormSubmit} className="registration-form">
                <div className="form-field">
                    <label htmlFor="schoolName">School Name</label>
                    <div className="input-wrapper">
                        <input
                            id="schoolName"
                            type="text"
                            placeholder="Enter school name"
                            value={formData.schoolName}
                            onChange={(e) => handleInputChange("schoolName", e.target.value)}
                            className={validationErrors.schoolName ? "error" : ""}
                            required
                        />
                    </div>
                    {validationErrors.schoolName && (
                        <div className="field-error">{validationErrors.schoolName}</div>
                    )}
                </div>

                <div className="form-field">
                    <label htmlFor="schoolAddress">School Address</label>
                    <div className="input-wrapper">
                        <input
                            id="schoolAddress"
                            type="text"
                            placeholder="Enter school address"
                            value={formData.schoolAddress}
                            onChange={(e) => handleInputChange("schoolAddress", e.target.value)}
                            className={validationErrors.schoolAddress ? "error" : ""}
                            required
                        />
                    </div>
                    {validationErrors.schoolAddress && (
                        <div className="field-error">{validationErrors.schoolAddress}</div>
                    )}
                </div>

                <div className="form-field">
                    <label htmlFor="schoolPhoneNumber">School Phone Number</label>
                    <div className="input-wrapper">
                        <input
                            id="schoolPhoneNumber"
                            type="tel"
                            placeholder="Enter school phone number"
                            value={formData.schoolPhoneNumber}
                            onChange={(e) => handleInputChange("schoolPhoneNumber", e.target.value)}
                            className={validationErrors.schoolPhoneNumber ? "error" : ""}
                            required
                        />
                    </div>
                    {validationErrors.schoolPhoneNumber && (
                        <div className="field-error">{validationErrors.schoolPhoneNumber}</div>
                    )}
                </div>

                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="latitude">Latitude (optional)</label>
                        <div className="input-wrapper">
                            <input
                                id="latitude"
                                type="number"
                                step="0.000001"
                                placeholder="Enter latitude"
                                value={formData.latitude}
                                onChange={(e) => handleInputChange("latitude", Number.parseFloat(e.target.value) || 0)}
                                className={validationErrors.latitude ? "error" : ""}
                            />
                        </div>
                        {validationErrors.latitude && (
                            <div className="field-error">{validationErrors.latitude}</div>
                        )}
                    </div>

                    <div className="form-field">
                        <label htmlFor="longitude">Longitude (optional)</label>
                        <div className="input-wrapper">
                            <input
                                id="longitude"
                                type="number"
                                step="0.000001"
                                placeholder="Enter longitude"
                                value={formData.longitude}
                                onChange={(e) => handleInputChange("longitude", Number.parseFloat(e.target.value) || 0)}
                                className={validationErrors.longitude ? "error" : ""}
                            />
                        </div>
                        {validationErrors.longitude && (
                            <div className="field-error">{validationErrors.longitude}</div>
                        )}
                    </div>
                </div>

                <div className="action-buttons">
                    <button type="button" className="btn btn-back" onClick={onBack}>
                        <FaArrowLeft /> Previous
                    </button>
                    <button type="submit" className="btn btn-next" disabled={isLoading}>
                        {isLoading ? <div className="spinner"></div> : <span>Next Step</span>}
                    </button>
                </div>
            </form>
        </div>
    )
}

// Vehicle Registration Step Component
const VehicleRegistration = ({
                                 vehicleData,
                                 onSubmit,
                                 onBack,
                                 isLoading,
                                 errorMessage,
                                 onAddMore,
                                 vehicleCount
                             }: {
    vehicleData: RegistrationData
    onSubmit: (data: RegistrationData) => void
    onBack: () => void
    isLoading: boolean
    errorMessage: string | null
    onAddMore: (data: RegistrationData) => void
    vehicleCount: number
}) => {
    const [formData, setFormData] = useState<RegistrationData>(vehicleData)
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
    
    // Update form data when vehicleData prop changes (after adding vehicle)
    React.useEffect(() => {
        setFormData(vehicleData);
    }, [vehicleData]);

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {}
        const currentYear = new Date().getFullYear()

        // Vehicle number validation
        if (!formData.vehicleNumber.trim()) {
            errors.vehicleNumber = "Vehicle number is required"
        } else if (formData.vehicleNumber.length < 4) {
            errors.vehicleNumber = "Please enter a valid vehicle number"
        }

        // Make validation
        if (!formData.make.trim()) {
            errors.make = "Vehicle make is required"
        }

        // Model validation
        if (!formData.model.trim()) {
            errors.model = "Vehicle model is required"
        }

        // Year validation
        if (!formData.year) {
            errors.year = "Year is required"
        } else if (formData.year < 1990 || formData.year > currentYear + 1) {
            errors.year = `Year must be between 1990 and ${currentYear + 1}`
        }

        // Capacity validation
        if (!formData.capacity) {
            errors.capacity = "Capacity is required"
        } else if (formData.capacity < 1 || formData.capacity > 100) {
            errors.capacity = "Capacity must be between 1 and 100"
        }

        // Insurance expiry date validation
        if (!formData.insuranceExpiryDate) {
            errors.insuranceExpiryDate = "Insurance expiry date is required"
        } else {
            const insuranceDate = new Date(formData.insuranceExpiryDate)
            const today = new Date()
            if (insuranceDate < today) {
                errors.insuranceExpiryDate = "Insurance expiry date must be in the future"
            }
        }

        // Registration expiry date validation
        if (!formData.registrationExpiryDate) {
            errors.registrationExpiryDate = "Registration expiry date is required"
        } else {
            const registrationDate = new Date(formData.registrationExpiryDate)
            const today = new Date()
            if (registrationDate < today) {
                errors.registrationExpiryDate = "Registration expiry date must be in the future"
            }
        }

        // Current mileage validation
        if (formData.currentMileage < 0) {
            errors.currentMileage = "Current mileage cannot be negative"
        }

        // Latitude validation (if provided)
        if (formData.initialLatitude !== 0 && (formData.initialLatitude < -90 || formData.initialLatitude > 90)) {
            errors.initialLatitude = "Latitude must be between -90 and 90 degrees"
        }

        // Longitude validation (if provided)
        if (formData.initialLongitude !== 0 && (formData.initialLongitude < -180 || formData.initialLongitude > 180)) {
            errors.initialLongitude = "Longitude must be between -180 and 180 degrees"
        }

        setValidationErrors(errors)
        return Object.keys(errors).length === 0
    }

    const getCurrentDate = () => {
        const today = new Date()
        return today.toISOString().split("T")[0]
    }

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (validateForm()) {
            onSubmit(formData)
        }
    }

    const handleAddMore = (e: React.FormEvent) => {
        e.preventDefault()
        if (validateForm()) {
            onAddMore(formData)
        }
    }

    const handleInputChange = (field: string, value: string | number) => {
        setFormData({ ...formData, [field]: value })
        
        // Clear validation error when user starts typing
        if (validationErrors[field]) {
            setValidationErrors({ ...validationErrors, [field]: '' })
        }
    }

    return (
        <div className="step-content">
            <h1>VEHICLE INFORMATION</h1>
            <h2>
                Register Your Vehicle <span>.</span>
            </h2>
            <p className="login-link">Enter the details of the vehicle you want to manage</p>
            
            {vehicleCount > 0 && (
                <div className="vehicle-count-indicator">
                    <span className="vehicle-count">{vehicleCount}</span> vehicle{vehicleCount !== 1 ? 's' : ''} registered
                </div>
            )}

            {errorMessage && (
                <div className="error-message">
                    <FaExclamationCircle />
                    <span>{errorMessage}</span>
                </div>
            )}

            <form onSubmit={handleFormSubmit} className="registration-form">
                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="vehicleNumber">Vehicle Number</label>
                        <div className="input-wrapper">
                            <input
                                id="vehicleNumber"
                                type="text"
                                placeholder="Enter vehicle number"
                                value={formData.vehicleNumber}
                                onChange={(e) => handleInputChange("vehicleNumber", e.target.value)}
                                className={validationErrors.vehicleNumber ? "error" : ""}
                                required
                            />
                        </div>
                        {validationErrors.vehicleNumber && (
                            <div className="field-error">{validationErrors.vehicleNumber}</div>
                        )}
                    </div>

                    <div className="form-field">
                        <label htmlFor="trackingDeviceId">Tracking Device ID (optional)</label>
                        <div className="input-wrapper">
                            <input
                                id="trackingDeviceId"
                                type="text"
                                placeholder="Enter tracking device ID"
                                value={formData.trackingDeviceId}
                                onChange={(e) => handleInputChange("trackingDeviceId", e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="make">Make</label>
                        <div className="input-wrapper">
                            <input
                                id="make"
                                type="text"
                                placeholder="Enter vehicle make"
                                value={formData.make}
                                onChange={(e) => handleInputChange("make", e.target.value)}
                                className={validationErrors.make ? "error" : ""}
                                required
                            />
                        </div>
                        {validationErrors.make && (
                            <div className="field-error">{validationErrors.make}</div>
                        )}
                    </div>

                    <div className="form-field">
                        <label htmlFor="model">Model</label>
                        <div className="input-wrapper">
                            <input
                                id="model"
                                type="text"
                                placeholder="Enter vehicle model"
                                value={formData.model}
                                onChange={(e) => handleInputChange("model", e.target.value)}
                                className={validationErrors.model ? "error" : ""}
                                required
                            />
                        </div>
                        {validationErrors.model && (
                            <div className="field-error">{validationErrors.model}</div>
                        )}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="year">Year</label>
                        <div className="input-wrapper">
                            <input
                                id="year"
                                type="number"
                                placeholder="Enter vehicle year"
                                value={formData.year}
                                onChange={(e) => handleInputChange("year", Number.parseInt(e.target.value) || new Date().getFullYear())}
                                className={validationErrors.year ? "error" : ""}
                                required
                            />
                        </div>
                        {validationErrors.year && (
                            <div className="field-error">{validationErrors.year}</div>
                        )}
                    </div>

                    <div className="form-field">
                        <label htmlFor="capacity">Capacity</label>
                        <div className="input-wrapper">
                            <input
                                id="capacity"
                                type="number"
                                placeholder="Enter vehicle capacity"
                                value={formData.capacity}
                                onChange={(e) => handleInputChange("capacity", Number.parseInt(e.target.value) || 0)}
                                className={validationErrors.capacity ? "error" : ""}
                                required
                            />
                        </div>
                        {validationErrors.capacity && (
                            <div className="field-error">{validationErrors.capacity}</div>
                        )}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="insuranceExpiryDate">Insurance Expiry Date</label>
                        <div className="input-wrapper">
                            <input
                                id="insuranceExpiryDate"
                                type="date"
                                min={getCurrentDate()}
                                value={formData.insuranceExpiryDate}
                                onChange={(e) => handleInputChange("insuranceExpiryDate", e.target.value)}
                                className={validationErrors.insuranceExpiryDate ? "error" : ""}
                                required
                            />
                        </div>
                        {validationErrors.insuranceExpiryDate && (
                            <div className="field-error">{validationErrors.insuranceExpiryDate}</div>
                        )}
                    </div>

                    <div className="form-field">
                        <label htmlFor="registrationExpiryDate">Registration Expiry Date</label>
                        <div className="input-wrapper">
                            <input
                                id="registrationExpiryDate"
                                type="date"
                                min={getCurrentDate()}
                                value={formData.registrationExpiryDate}
                                onChange={(e) => handleInputChange("registrationExpiryDate", e.target.value)}
                                className={validationErrors.registrationExpiryDate ? "error" : ""}
                                required
                            />
                        </div>
                        {validationErrors.registrationExpiryDate && (
                            <div className="field-error">{validationErrors.registrationExpiryDate}</div>
                        )}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="lastMaintenanceDate">Last Maintenance Date</label>
                        <div className="input-wrapper">
                            <input
                                id="lastMaintenanceDate"
                                type="date"
                                max={getCurrentDate()}
                                value={formData.lastMaintenanceDate}
                                onChange={(e) => handleInputChange("lastMaintenanceDate", e.target.value)}
                                className={validationErrors.lastMaintenanceDate ? "error" : ""}
                                required
                            />
                        </div>
                        {validationErrors.lastMaintenanceDate && (
                            <div className="field-error">{validationErrors.lastMaintenanceDate}</div>
                        )}
                    </div>

                    <div className="form-field">
                        <label htmlFor="currentMileage">Current Mileage</label>
                        <div className="input-wrapper">
                            <input
                                id="currentMileage"
                                type="number"
                                min="0"
                                placeholder="Enter current mileage"
                                value={formData.currentMileage}
                                onChange={(e) => handleInputChange("currentMileage", Number.parseInt(e.target.value) || 0)}
                                className={validationErrors.currentMileage ? "error" : ""}
                                required
                            />
                        </div>
                        {validationErrors.currentMileage && (
                            <div className="field-error">{validationErrors.currentMileage}</div>
                        )}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="initialLatitude">Initial Latitude (optional)</label>
                        <div className="input-wrapper">
                            <input
                                id="initialLatitude"
                                type="number"
                                step="0.000001"
                                placeholder="Enter initial latitude"
                                value={formData.initialLatitude}
                                onChange={(e) => handleInputChange("initialLatitude", Number.parseFloat(e.target.value) || 0)}
                                className={validationErrors.initialLatitude ? "error" : ""}
                            />
                        </div>
                        {validationErrors.initialLatitude && (
                            <div className="field-error">{validationErrors.initialLatitude}</div>
                        )}
                    </div>

                    <div className="form-field">
                        <label htmlFor="initialLongitude">Initial Longitude (optional)</label>
                        <div className="input-wrapper">
                            <input
                                id="initialLongitude"
                                type="number"
                                step="0.000001"
                                placeholder="Enter initial longitude"
                                value={formData.initialLongitude}
                                onChange={(e) => handleInputChange("initialLongitude", Number.parseFloat(e.target.value) || 0)}
                                className={validationErrors.initialLongitude ? "error" : ""}
                            />
                        </div>
                        {validationErrors.initialLongitude && (
                            <div className="field-error">{validationErrors.initialLongitude}</div>
                        )}
                    </div>
                </div>

                <div className="action-buttons">
                    <button type="button" className="btn btn-back" onClick={onBack}>
                        <FaArrowLeft /> Previous
                    </button>
                    <button type="button" className="btn btn-add-more" onClick={handleAddMore} disabled={isLoading}>
                        {isLoading ? <div className="spinner"></div> : <span>Add Another Vehicle</span>}
                    </button>
                    <button type="submit" className="btn btn-next" disabled={isLoading}>
                        {isLoading ? <div className="spinner"></div> : (
                            <span>{vehicleCount > 0 ? 'Complete Registration' : 'Register Vehicle & Complete'}</span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}

const Register = () => {
    const navigate = useNavigate()
    const authService = useAuthService()
    const vehicleService = useVehicleService()
    const schoolService = useSchoolService()

    const [step, setStep] = useState(1)
    const [schoolId, setSchoolId] = useState<number | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [registeredVehicles, setRegisteredVehicles] = useState<number[]>([])
    
    // Toast state
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

    // Function to show toast message
    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    // Function to hide toast message
    const hideToast = () => {
        setToast(null);
    };

    // Registration form data
    const [registrationData, setRegistrationData] = useState<RegistrationData>({
        // User data
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        role: UserRole.ADMIN,

        // School data
        schoolName: "",
        schoolAddress: "",
        schoolPhoneNumber: "",
        latitude: 0,
        longitude: 0,

        // Vehicle data
        vehicleNumber: "",
        make: "",
        model: "",
        year: new Date().getFullYear(),
        capacity: 0,
        insuranceExpiryDate: "",
        registrationExpiryDate: "",
        lastMaintenanceDate: "",
        currentMileage: 0,
        trackingDeviceId: "",
        initialLatitude: 0,
        initialLongitude: 0,
    })
    
    useEffect(() => {
        if (authService.isAuthenticated()) {
            navigate("/dashboard");
        }
    }, [navigate, authService]);


    // Helper function to check authentication status
    const checkAuthStatus = () => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('currentUser');
        
        console.log('Auth status check:');
        console.log('- Token exists:', !!token);
        console.log('- User data exists:', !!userData);
        
        if (token) {
            console.log('- Token starts with:', token.substring(0, 15));
        }
        
        if (userData) {
            try {
                const user = JSON.parse(userData);
                console.log('- User ID:', user.id);
                console.log('- User role:', user.role);
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
        
        return !!token && !!userData;
    }

    // Step 1: Register the user
    const handleUserRegistration = async (userData: RegistrationData) => {
        setIsLoading(true)
        setErrorMessage(null)

        try {
            // Create user registration request
            const userRequest: RegisterRequest = {
                firstName: userData.firstName,
                lastName: userData.lastName,
                username: userData.username,
                email: userData.email,
                password: userData.password,
                phoneNumber: userData.phoneNumber,
                role: userData.role,
            }

            console.log('Starting user registration with:', userRequest);
            const response = await authService.register(userRequest)
            console.log('Registration response received:', response);
            checkAuthStatus();

            if (!authService.isAuthenticated()) {
                console.error('Authentication failed after registration, forcing manual authentication');
                if (response.token) {
                    localStorage.setItem('token', response.token);
                    console.log('Manually set token:', response.token.substring(0, 15) + '...');
                } else {
                    throw new Error("No authentication token received from server");
                }
            }

            setRegistrationData(userData)
            showToast("User account created successfully!", "success")
            nextStep()
        } catch (error: any) {
            console.error('Registration error details:', error);
            setErrorMessage(error.message || "User registration failed. Please try again.")
            showToast(error.message || "User registration failed", "error")
        } finally {
            setIsLoading(false)
        }
    }

    // Step 2: Create the school
    const handleSchoolRegistration = async (schoolData: RegistrationData) => {
        setIsLoading(true)
        setErrorMessage(null)

        try {
            console.log('Creating school with data from form')
            
            const schoolRequest: CreateSchoolRequest = {
                name: schoolData.schoolName,
                address: schoolData.schoolAddress,
                phoneNumber: schoolData.schoolPhoneNumber,
                latitude: schoolData.latitude || undefined,
                longitude: schoolData.longitude || undefined,
            }

            const token = localStorage.getItem('token')
            if (!token) {
                throw new Error("Authentication token not found")
            }

            try {
                const response = await schoolService.create(schoolRequest)

                console.log('School creation successful with direct API call:', response)
                setSchoolId(response.id)
                localStorage.setItem("school", JSON.stringify(response))
                setRegistrationData(schoolData)
                nextStep()
            } catch (fetchError: any) {
                console.error('Direct API call failed:', fetchError)
                throw fetchError
            }
        } catch (error: any) {
            setErrorMessage(error.message || "School registration failed. Please try again.")
            showToast(error.message || "School registration failed", "error")
            console.error('School registration error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleVehicleRegistration = async (vehicleData: RegistrationData) => {
        setIsLoading(true)
        setErrorMessage(null)

        try {
            const vehicleRequest: CreateVehicleRequest = {
                vehicleNumber: vehicleData.vehicleNumber,
                make: vehicleData.make,
                model: vehicleData.model,
                year: vehicleData.year,
                capacity: vehicleData.capacity,
                status: VehicleStatus.AVAILABLE,
                currentMileage: vehicleData.currentMileage,
                insuranceExpiryDate: vehicleData.insuranceExpiryDate,
                registrationExpiryDate: vehicleData.registrationExpiryDate,
                lastMaintenanceDate: vehicleData.lastMaintenanceDate,
                trackingDeviceId: vehicleData.trackingDeviceId || undefined,
                currentLatitude: vehicleData.initialLatitude || undefined,
                currentLongitude: vehicleData.initialLongitude || undefined,
                //@ts-ignore
                schoolId: schoolId,
            }

            console.log('Vehicle creation request:', vehicleRequest);
            
            const token = localStorage.getItem('token')
            if (!token) {
                throw new Error("Authentication token not found")
            }

            try {
                const response = await vehicleService.create(vehicleRequest)

                const vehicle = await response
                console.log('Vehicle creation successful with direct API call:', vehicle)
                
                showToast("Registration completed successfully! Redirecting to dashboard...", "success")
                
                setTimeout(() => {
                    navigate("/dashboard")
                }, 2000)
                
            } catch (fetchError: any) {
                console.error('Direct API call failed:', fetchError)
                throw fetchError
            }
        } catch (error: any) {
            setErrorMessage(error.message || "Vehicle registration failed. Please try again.")
            showToast(error.message || "Vehicle registration failed", "error")
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddAnotherVehicle = async (vehicleData: RegistrationData) => {
        setIsLoading(true)
        setErrorMessage(null)

        try {
            const vehicleRequest: CreateVehicleRequest = {
                vehicleNumber: vehicleData.vehicleNumber,
                make: vehicleData.make,
                model: vehicleData.model,
                year: vehicleData.year,
                capacity: vehicleData.capacity,
                status: VehicleStatus.AVAILABLE,
                currentMileage: vehicleData.currentMileage,
                insuranceExpiryDate: vehicleData.insuranceExpiryDate,
                registrationExpiryDate: vehicleData.registrationExpiryDate,
                lastMaintenanceDate: vehicleData.lastMaintenanceDate,
                trackingDeviceId: vehicleData.trackingDeviceId || undefined,
                currentLatitude: vehicleData.initialLatitude || undefined,
                currentLongitude: vehicleData.initialLongitude || undefined,
            }

            console.log('Vehicle creation request:', vehicleRequest);
            
            const token = localStorage.getItem('token')
            if (!token) {
                throw new Error("Authentication token not found")
            }

            try {
                const response = await vehicleService.create(vehicleRequest)

                const vehicle = await response
                console.log('Vehicle creation successful with direct API call:', vehicle)
                
                setRegisteredVehicles(prev => [...prev, vehicle.id])
                
                const resetVehicleData = {
                    ...registrationData,
                    vehicleNumber: "",
                    make: "",
                    model: "",
                    year: new Date().getFullYear(),
                    capacity: 0,
                    insuranceExpiryDate: "",
                    registrationExpiryDate: "",
                    lastMaintenanceDate: "",
                    currentMileage: 0,
                    trackingDeviceId: "",
                    initialLatitude: 0,
                    initialLongitude: 0,
                }
                
                setRegistrationData(resetVehicleData)
                showToast(`Vehicle added successfully! You can add more vehicles or complete registration.`, "success")
                
            } catch (fetchError: any) {
                console.error('Direct API call failed:', fetchError)
                throw fetchError
            }
        } catch (error: any) {
            setErrorMessage(error.message || "Vehicle registration failed. Please try again.")
            showToast(error.message || "Vehicle registration failed", "error")
        } finally {
            setIsLoading(false)
        }
    }

    const nextStep = () => {
        setStep(step + 1)
        setErrorMessage(null)
    }

    const prevStep = () => {
        setStep(step - 1)
        setErrorMessage(null)
    }

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <UserRegistration
                        userData={registrationData}
                        onSubmit={handleUserRegistration}
                        isLoading={isLoading}
                        errorMessage={errorMessage}
                    />
                )
            case 2:
                return (
                    <SchoolRegistration
                        schoolData={registrationData}
                        onSubmit={handleSchoolRegistration}
                        onBack={prevStep}
                        isLoading={isLoading}
                        errorMessage={errorMessage}
                    />
                )
            case 3:
                return (
                    <VehicleRegistration
                        vehicleData={registrationData}
                        onSubmit={handleVehicleRegistration}
                        onBack={prevStep}
                        onAddMore={handleAddAnotherVehicle}
                        isLoading={isLoading}
                        errorMessage={errorMessage}
                        vehicleCount={registeredVehicles.length}
                    />
                )
            default:
                return (
                    <UserRegistration
                        userData={registrationData}
                        onSubmit={handleUserRegistration}
                        isLoading={isLoading}
                        errorMessage={errorMessage}
                    />
                )
        }
    }

    return (
        <section id="register">
            <div className="register-container">
                <Link className="back" to="/">
                    <FaArrowLeft />
                </Link>

                <div className="register-card">
                    <div className="header">
                        <div className="logo-section">
                            <img src="/logo.png" alt="Nimbus Logo" className="logo" />
                            <h2>Nimbus</h2>
                        </div>
                        <div className="nav-links">
                            <Link to="/" className="active">
                                Home
                            </Link>
                            <Link to="/login">Login</Link>
                        </div>
                    </div>

                    <div className="registration-progress">
                        <div className={`step ${step >= 1 ? "active" : ""}`}>
                            <div className="step-number">1</div>
                            <div className="step-text">Account</div>
                        </div>
                        <div className="step-line"></div>
                        <div className={`step ${step >= 2 ? "active" : ""}`}>
                            <div className="step-number">2</div>
                            <div className="step-text">School</div>
                        </div>
                        <div className="step-line"></div>
                        <div className={`step ${step >= 3 ? "active" : ""}`}>
                            <div className="step-number">3</div>
                            <div className="step-text">Vehicle</div>
                        </div>
                    </div>

                    {renderStepContent()}
                    
                    {/* Toast notification */}
                    {toast && (
                        <Toast 
                            message={toast.message} 
                            type={toast.type} 
                            onClose={hideToast}
                        />
                    )}
                </div>
            </div>
        </section>
    )
}

export default Register

