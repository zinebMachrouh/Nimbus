import React from 'react';
import { useForm } from 'react-hook-form';
import { FaArrowLeft, FaSchool, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

type SchoolFormData = {
    schoolName: string;
    schoolAddress: string;
    schoolPhoneNumber: string;
    latitude: number;
    longitude: number;
};

interface SchoolRegistrationProps {
    schoolData: any;
    onSubmit: (data: SchoolFormData) => void;
    onBack: () => void;
}

const SchoolRegistration: React.FC<SchoolRegistrationProps> = ({ schoolData, onSubmit, onBack }) => {
    const { register, handleSubmit, formState: { errors, isValid } } = useForm<SchoolFormData>({
        mode: 'onBlur',
        defaultValues: {
            schoolName: schoolData.schoolName || '',
            schoolAddress: schoolData.schoolAddress || '',
            schoolPhoneNumber: schoolData.schoolPhoneNumber || '',
            latitude: schoolData.latitude || 0,
            longitude: schoolData.longitude || 0
        }
    });
    
    const getErrorMessage = (field: keyof SchoolFormData): string | undefined => {
        const errorObj = errors[field];
        if (!errorObj) return undefined;
        
        return errorObj.message;
    };
    
    const handleFormSubmit = (data: SchoolFormData) => {
        onSubmit(data);
    };
    
    return (
        <div className="step-content">
            <h1>SCHOOL INFORMATION</h1>
            <h2>Register Your School <span>.</span></h2>
            <p className="login-link">Enter the details of the school you want to manage</p>
            
            <form onSubmit={handleSubmit(handleFormSubmit)} className="registration-form">
                <div className="form-field">
                    <label htmlFor="schoolName">School Name</label>
                    <div className="input-wrapper">
                        <input
                            id="schoolName"
                            type="text"
                            placeholder="Enter school name"
                            className={errors.schoolName ? 'error' : ''}
                            {...register('schoolName', {
                                required: 'School name is required',
                                minLength: {
                                    value: 3,
                                    message: 'School name must be at least 3 characters'
                                }
                            })}
                        />
                        {getErrorMessage('schoolName') && (
                            <span className="error-message">
                                {getErrorMessage('schoolName')}
                            </span>
                        )}
                    </div>
                </div>
                
                <div className="form-field">
                    <label htmlFor="schoolAddress">School Address</label>
                    <div className="input-wrapper">
                        <input
                            id="schoolAddress"
                            type="text"
                            placeholder="Enter school address"
                            className={errors.schoolAddress ? 'error' : ''}
                            {...register('schoolAddress', {
                                required: 'School address is required',
                                minLength: {
                                    value: 5,
                                    message: 'School address must be at least 5 characters'
                                }
                            })}
                        />
                        {getErrorMessage('schoolAddress') && (
                            <span className="error-message">
                                {getErrorMessage('schoolAddress')}
                            </span>
                        )}
                    </div>
                </div>
                
                <div className="form-field">
                    <label htmlFor="schoolPhoneNumber">School Phone Number</label>
                    <div className="input-wrapper">
                        <input
                            id="schoolPhoneNumber"
                            type="tel"
                            placeholder="Enter school phone number"
                            className={errors.schoolPhoneNumber ? 'error' : ''}
                            {...register('schoolPhoneNumber', {
                                required: 'School phone number is required',
                                pattern: {
                                    value: /^\+?[0-9]{8,15}$/,
                                    message: 'Invalid phone number format'
                                }
                            })}
                        />
                        {getErrorMessage('schoolPhoneNumber') && (
                            <span className="error-message">
                                {getErrorMessage('schoolPhoneNumber')}
                            </span>
                        )}
                    </div>
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
                                className={errors.latitude ? 'error' : ''}
                                {...register('latitude', {
                                    min: {
                                        value: -90,
                                        message: 'Latitude must be between -90 and 90'
                                    },
                                    max: {
                                        value: 90,
                                        message: 'Latitude must be between -90 and 90'
                                    }
                                })}
                            />
                            {getErrorMessage('latitude') && (
                                <span className="error-message">
                                    {getErrorMessage('latitude')}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <div className="form-field">
                        <label htmlFor="longitude">Longitude (optional)</label>
                        <div className="input-wrapper">
                            <input
                                id="longitude"
                                type="number"
                                step="0.000001"
                                placeholder="Enter longitude"
                                className={errors.longitude ? 'error' : ''}
                                {...register('longitude', {
                                    min: {
                                        value: -180,
                                        message: 'Longitude must be between -180 and 180'
                                    },
                                    max: {
                                        value: 180,
                                        message: 'Longitude must be between -180 and 180'
                                    }
                                })}
                            />
                            {getErrorMessage('longitude') && (
                                <span className="error-message">
                                    {getErrorMessage('longitude')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="action-buttons">
                    <button
                        type="button"
                        className="btn btn-back"
                        onClick={onBack}
                    >
                        <FaArrowLeft /> Previous
                    </button>
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

export default SchoolRegistration; 