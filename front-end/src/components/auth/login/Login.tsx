import './Login.css';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaArrowLeft, FaEye, FaEyeSlash, FaExclamationCircle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthService } from '../../../contexts/ServiceContext';
import { ApiError } from '../../../core/models/ApiError';

type LoginFormData = {
    username: string;
    password: string;
};

const Login: React.FC = () => {
    const navigate = useNavigate();
    const authService = useAuthService();
    const [hidePassword, setHidePassword] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, formState: { errors, isValid } } = useForm<LoginFormData>({
        mode: 'onBlur',
        defaultValues: {
            username: '',
            password: ''
        }
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        setErrorMessage(null);
        
        try {
            await authService.login(data.username, data.password);
            navigate('/dashboard');
        } catch (error) {
            if (error instanceof ApiError) {
                setErrorMessage(error.message);
                
                if (error.validationErrors) {
                    // Handle specific validation errors if needed
                    console.error('Validation errors:', error.validationErrors);
                }
            } else {
                setErrorMessage('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getErrorMessage = (field: keyof LoginFormData): string | undefined => {
        const errorObj = errors[field];
        if (!errorObj) return undefined;
        
        return errorObj.message;
    };

    return ( 
        <section id="login">
            <div className="login-container">
                <Link className="back" to="/">
                    <FaArrowLeft />
                </Link>
                <div className="login-card">
                    {/* Header with Logo */}
                    <div className="header">
                        <div className="logo-section">
                            <img src="/logo.png" alt="Nimbus Logo" className="logo" />
                            <h2>Nimbus</h2>
                        </div>
                        <div className="nav-links">
                            <Link to="/" className="active">Home</Link>
                            <Link to="/register">Join</Link>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="signup-content">
                        <h1>LOGIN TO NIMBUS</h1>
                        <h2>Welcome Back <span>.</span></h2>
                        <p className="login-link">Doesn't have an account? <Link to="/register">Sign up</Link></p>

                        {/* Error Message */}
                        {errorMessage && (
                            <div className="error-message">
                                <FaExclamationCircle />
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
                            <div className="form-field">
                                <label htmlFor="username">Username</label>
                                <div className="input-wrapper">
                                    <input
                                        id="username"
                                        type="text"
                                        placeholder="Enter your username"
                                        className={errors.username ? 'error' : ''}
                                        {...register('username', {
                                            required: 'Username is required',
                                            minLength: {
                                                value: 3,
                                                message: 'Username must be at least 3 characters'
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
                                <label htmlFor="password">Password</label>
                                <div className="input-wrapper">
                                    <input
                                        id="password"
                                        type={hidePassword ? 'password' : 'text'}
                                        placeholder="Enter your password"
                                        className={errors.password ? 'error' : ''}
                                        {...register('password', {
                                            required: 'Password is required',
                                            minLength: {
                                                value: 6,
                                                message: 'Password must be at least 6 characters'
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
                            <div className="form-options">
                                <label className="remember-me">
                                    <input type="checkbox" />
                                    <span className="checkmark"></span>
                                    Remember me
                                </label>
                                <a href="#" className="forgot-password">Forgot password?</a>
                            </div>
                            <div className="action-buttons">
                                <button type="reset" className="btn btn-secondary">
                                    Reset Form
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={!isValid || isLoading}
                                >
                                    {isLoading ? (
                                        <div className="spinner"></div>
                                    ) : (
                                        <span>Log In</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
 
export default Login;