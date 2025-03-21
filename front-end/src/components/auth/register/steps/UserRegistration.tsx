import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaPhone } from 'react-icons/fa';
import { Link } from 'react-router-dom';

type UserFormData = {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    phoneNumber: string;
};

interface UserRegistrationProps {
    userData: any;
    onSubmit: (data: UserFormData) => void;
}

const UserRegistration: React.FC<UserRegistrationProps> = ({ userData, onSubmit }) => {
    const [hidePassword, setHidePassword] = useState(true);
    const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
    
    const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm<UserFormData>({
        mode: 'onBlur',
        defaultValues: {
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            username: userData.username || '',
            email: userData.email || '',
            password: userData.password || '',
            confirmPassword: userData.confirmPassword || '',
            phoneNumber: userData.phoneNumber || ''
        }
    });
    
    const password = watch('password');
    
    const getErrorMessage = (field: keyof UserFormData): string | undefined => {
        const errorObj = errors[field];
        if (!errorObj) return undefined;
        
        return errorObj.message;
    };
    
    const handleFormSubmit = (data: UserFormData) => {
        onSubmit(data);
    };
    
    return (
        <div className="step-content">
            <h1>CREATE AN ACCOUNT</h1>
            <h2>Admin Registration <span>.</span></h2>
            <p className="login-link">Already have an account? <Link to="/login">Log in</Link></p>
            
            <form onSubmit={handleSubmit(handleFormSubmit)} className="registration-form">
                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="firstName">First Name</label>
                        <div className="input-wrapper">
                            <input
                                id="firstName"
                                type="text"
                                placeholder="Enter your first name"
                                className={errors.firstName ? 'error' : ''}
                                {...register('firstName', {
                                    required: 'First name is required',
                                    minLength: {
                                        value: 2,
                                        message: 'First name must be at least 2 characters'
                                    }
                                })}
                            />
                            {getErrorMessage('firstName') && (
                                <span className="error-message">
                                    {getErrorMessage('firstName')}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <div className="form-field">
                        <label htmlFor="lastName">Last Name</label>
                        <div className="input-wrapper">
                            <input
                                id="lastName"
                                type="text"
                                placeholder="Enter your last name"
                                className={errors.lastName ? 'error' : ''}
                                {...register('lastName', {
                                    required: 'Last name is required',
                                    minLength: {
                                        value: 2,
                                        message: 'Last name must be at least 2 characters'
                                    }
                                })}
                            />
                            {getErrorMessage('lastName') && (
                                <span className="error-message">
                                    {getErrorMessage('lastName')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="form-field">
                    <label htmlFor="username">Username</label>
                    <div className="input-wrapper">
                        <input
                            id="username"
                            type="text"
                            placeholder="Choose a username"
                            className={errors.username ? 'error' : ''}
                            {...register('username', {
                                required: 'Username is required',
                                minLength: {
                                    value: 3,
                                    message: 'Username must be at least 3 characters'
                                },
                                pattern: {
                                    value: /^[a-zA-Z0-9_-]+$/,
                                    message: 'Username can only contain letters, numbers, underscores and hyphens'
                                }
                            })}
                        />
                        {getErrorMessage('username') && (
                            <span className="error-message">
                                {getErrorMessage('username')}
                            </span>
                        )}
                    </div>
                </div>
                
                <div className="form-field">
                    <label htmlFor="email">Email</label>
                    <div className="input-wrapper">
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email address"
                            className={errors.email ? 'error' : ''}
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address'
                                }
                            })}
                        />
                        {getErrorMessage('email') && (
                            <span className="error-message">
                                {getErrorMessage('email')}
                            </span>
                        )}
                    </div>
                </div>
                
                <div className="form-field">
                    <label htmlFor="phoneNumber">Phone Number</label>
                    <div className="input-wrapper">
                        <input
                            id="phoneNumber"
                            type="tel"
                            placeholder="Enter your phone number"
                            className={errors.phoneNumber ? 'error' : ''}
                            {...register('phoneNumber', {
                                required: 'Phone number is required',
                                pattern: {
                                    value: /^\+?[0-9]{8,15}$/,
                                    message: 'Invalid phone number format'
                                }
                            })}
                        />
                        {getErrorMessage('phoneNumber') && (
                            <span className="error-message">
                                {getErrorMessage('phoneNumber')}
                            </span>
                        )}
                    </div>
                </div>
                
                <div className="form-field">
                    <label htmlFor="password">Password</label>
                    <div className="input-wrapper">
                        <input
                            id="password"
                            type={hidePassword ? 'password' : 'text'}
                            placeholder="Create a password"
                            className={errors.password ? 'error' : ''}
                            {...register('password', {
                                required: 'Password is required',
                                minLength: {
                                    value: 8,
                                    message: 'Password must be at least 8 characters'
                                },
                                pattern: {
                                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
                                }
                            })}
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setHidePassword(!hidePassword)}
                        >
                            {hidePassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                        {getErrorMessage('password') && (
                            <span className="error-message">
                                {getErrorMessage('password')}
                            </span>
                        )}
                    </div>
                </div>
                
                <div className="form-field">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className="input-wrapper">
                        <input
                            id="confirmPassword"
                            type={hideConfirmPassword ? 'password' : 'text'}
                            placeholder="Confirm your password"
                            className={errors.confirmPassword ? 'error' : ''}
                            {...register('confirmPassword', {
                                required: 'Please confirm your password',
                                validate: value => value === password || 'Passwords do not match'
                            })}
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setHideConfirmPassword(!hideConfirmPassword)}
                        >
                            {hideConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                        {getErrorMessage('confirmPassword') && (
                            <span className="error-message">
                                {getErrorMessage('confirmPassword')}
                            </span>
                        )}
                    </div>
                </div>
                
                <div className="action-buttons">
                    <Link to="/" className="btn btn-back">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="btn btn-next"
                        disabled={!isValid}
                    >
                        Next Step
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserRegistration; 