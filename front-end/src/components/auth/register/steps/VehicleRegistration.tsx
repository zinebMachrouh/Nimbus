import React from 'react';
import { useForm } from 'react-hook-form';
import { FaArrowLeft, FaBus, FaCar, FaCalendarAlt } from 'react-icons/fa';

type VehicleFormData = {
    vehicleNumber: string;
    make: string;
    model: string;
    year: number;
    capacity: number;
    insuranceExpiryDate: string;
    registrationExpiryDate: string;
    lastMaintenanceDate: string;
    currentMileage: number;
    trackingDeviceId: string;
    initialLatitude: number;
    initialLongitude: number;
};

interface VehicleRegistrationProps {
    vehicleData: any;
    onSubmit: (data: VehicleFormData) => void;
    onBack: () => void;
    isLoading: boolean;
}

const VehicleRegistration: React.FC<VehicleRegistrationProps> = ({ vehicleData, onSubmit, onBack, isLoading }) => {
    const { register, handleSubmit, formState: { errors, isValid } } = useForm<VehicleFormData>({
        mode: 'onBlur',
        defaultValues: {
            vehicleNumber: vehicleData.vehicleNumber || '',
            make: vehicleData.make || '',
            model: vehicleData.model || '',
            year: vehicleData.year || new Date().getFullYear(),
            capacity: vehicleData.capacity || 0,
            insuranceExpiryDate: vehicleData.insuranceExpiryDate || '',
            registrationExpiryDate: vehicleData.registrationExpiryDate || '',
            lastMaintenanceDate: vehicleData.lastMaintenanceDate || '',
            currentMileage: vehicleData.currentMileage || 0,
            trackingDeviceId: vehicleData.trackingDeviceId || '',
            initialLatitude: vehicleData.initialLatitude || 0,
            initialLongitude: vehicleData.initialLongitude || 0
        }
    });
    
    const getErrorMessage = (field: keyof VehicleFormData): string | undefined => {
        const errorObj = errors[field];
        if (!errorObj) return undefined;
        
        return errorObj.message;
    };
    
    const handleFormSubmit = (data: VehicleFormData) => {
        onSubmit(data);
    };
    
    const getCurrentDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };
    
    return (
        <div className="step-content">
            <h1>VEHICLE INFORMATION</h1>
            <h2>Register Your Vehicle <span>.</span></h2>
            <p className="login-link">Enter the details of the vehicle you want to manage</p>
            
            <form onSubmit={handleSubmit(handleFormSubmit)} className="registration-form">
                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="vehicleNumber">Vehicle Number</label>
                        <div className="input-wrapper">
                            <input
                                id="vehicleNumber"
                                type="text"
                                placeholder="Enter vehicle number/plate"
                                className={errors.vehicleNumber ? 'error' : ''}
                                {...register('vehicleNumber', {
                                    required: 'Vehicle number is required',
                                    minLength: {
                                        value: 2,
                                        message: 'Vehicle number must be at least 2 characters'
                                    }
                                })}
                            />
                            {getErrorMessage('vehicleNumber') && (
                                <span className="error-message">
                                    {getErrorMessage('vehicleNumber')}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <div className="form-field">
                        <label htmlFor="trackingDeviceId">Tracking Device ID (optional)</label>
                        <div className="input-wrapper">
                            <input
                                id="trackingDeviceId"
                                type="text"
                                placeholder="Enter tracking device ID"
                                className={errors.trackingDeviceId ? 'error' : ''}
                                {...register('trackingDeviceId')}
                            />
                            {getErrorMessage('trackingDeviceId') && (
                                <span className="error-message">
                                    {getErrorMessage('trackingDeviceId')}
                                </span>
                            )}
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
                                className={errors.make ? 'error' : ''}
                                {...register('make', {
                                    required: 'Make is required'
                                })}
                            />
                            {getErrorMessage('make') && (
                                <span className="error-message">
                                    {getErrorMessage('make')}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <div className="form-field">
                        <label htmlFor="model">Model</label>
                        <div className="input-wrapper">
                            <input
                                id="model"
                                type="text"
                                placeholder="Enter vehicle model"
                                className={errors.model ? 'error' : ''}
                                {...register('model', {
                                    required: 'Model is required'
                                })}
                            />
                            {getErrorMessage('model') && (
                                <span className="error-message">
                                    {getErrorMessage('model')}
                                </span>
                            )}
                        </div>
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
                                className={errors.year ? 'error' : ''}
                                {...register('year', {
                                    required: 'Year is required',
                                    min: {
                                        value: 1990,
                                        message: 'Year must be after 1990'
                                    },
                                    max: {
                                        value: new Date().getFullYear() + 1,
                                        message: `Year cannot be in the future`
                                    }
                                })}
                            />
                            {getErrorMessage('year') && (
                                <span className="error-message">
                                    {getErrorMessage('year')}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <div className="form-field">
                        <label htmlFor="capacity">Capacity</label>
                        <div className="input-wrapper">
                            <input
                                id="capacity"
                                type="number"
                                placeholder="Enter vehicle capacity"
                                className={errors.capacity ? 'error' : ''}
                                {...register('capacity', {
                                    required: 'Capacity is required',
                                    min: {
                                        value: 1,
                                        message: 'Capacity must be at least 1'
                                    }
                                })}
                            />
                            {getErrorMessage('capacity') && (
                                <span className="error-message">
                                    {getErrorMessage('capacity')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="form-field">
                    <label htmlFor="currentMileage">Current Mileage</label>
                    <div className="input-wrapper">
                        <input
                            id="currentMileage"
                            type="number"
                            placeholder="Enter current mileage"
                            className={errors.currentMileage ? 'error' : ''}
                            {...register('currentMileage', {
                                required: 'Current mileage is required',
                                min: {
                                    value: 0,
                                    message: 'Current mileage must be non-negative'
                                }
                            })}
                        />
                        {getErrorMessage('currentMileage') && (
                            <span className="error-message">
                                {getErrorMessage('currentMileage')}
                            </span>
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
                                className={errors.insuranceExpiryDate ? 'error' : ''}
                                {...register('insuranceExpiryDate', {
                                    required: 'Insurance expiry date is required'
                                })}
                            />
                            {getErrorMessage('insuranceExpiryDate') && (
                                <span className="error-message">
                                    {getErrorMessage('insuranceExpiryDate')}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <div className="form-field">
                        <label htmlFor="registrationExpiryDate">Registration Expiry Date</label>
                        <div className="input-wrapper">
                            <input
                                id="registrationExpiryDate"
                                type="date"
                                min={getCurrentDate()}
                                className={errors.registrationExpiryDate ? 'error' : ''}
                                {...register('registrationExpiryDate', {
                                    required: 'Registration expiry date is required'
                                })}
                            />
                            {getErrorMessage('registrationExpiryDate') && (
                                <span className="error-message">
                                    {getErrorMessage('registrationExpiryDate')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="form-field">
                    <label htmlFor="lastMaintenanceDate">Last Maintenance Date</label>
                    <div className="input-wrapper">
                        <input
                            id="lastMaintenanceDate"
                            type="date"
                            max={getCurrentDate()}
                            className={errors.lastMaintenanceDate ? 'error' : ''}
                            {...register('lastMaintenanceDate', {
                                required: 'Last maintenance date is required'
                            })}
                        />
                        {getErrorMessage('lastMaintenanceDate') && (
                            <span className="error-message">
                                {getErrorMessage('lastMaintenanceDate')}
                            </span>
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
                                className={errors.initialLatitude ? 'error' : ''}
                                {...register('initialLatitude', {
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
                            {getErrorMessage('initialLatitude') && (
                                <span className="error-message">
                                    {getErrorMessage('initialLatitude')}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <div className="form-field">
                        <label htmlFor="initialLongitude">Initial Longitude (optional)</label>
                        <div className="input-wrapper">
                            <input
                                id="initialLongitude"
                                type="number"
                                step="0.000001"
                                placeholder="Enter initial longitude"
                                className={errors.initialLongitude ? 'error' : ''}
                                {...register('initialLongitude', {
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
                            {getErrorMessage('initialLongitude') && (
                                <span className="error-message">
                                    {getErrorMessage('initialLongitude')}
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
                        disabled={!isValid || isLoading}
                    >
                        {isLoading ? (
                            <div className="spinner"></div>
                        ) : (
                            <span>Complete Registration</span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VehicleRegistration; 