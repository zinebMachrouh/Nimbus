import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthService } from '../../../contexts/ServiceContext';
import { Trip } from '../../../core/entities/trip.entity';
import { Vehicle } from '../../../core/entities/vehicle.entity';
import { Route } from '../../../core/entities/route.entity';
import { Student } from '../../../core/entities/student.entity';
import { Driver, DriverStatus } from '../../../core/entities/driver.entity';
import { useDriverService, useTripService, useVehicleService, useRouteService, useStudentService } from '../../../contexts/ServiceContext';
import { FiMap, FiTruck, FiUsers, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import './DriverDashboard.css';
import { QRCodeCanvas } from 'qrcode.react';

const DriverDashboard: React.FC = () => {
    const navigate = useNavigate();
    const authService = useAuthService();
    const driverService = useDriverService();
    const tripService = useTripService();
    const vehicleService = useVehicleService();
    const routeService = useRouteService();
    const studentService = useStudentService();

    const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [route, setRoute] = useState<Route | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [driver, setDriver] = useState<Driver | null>(null);
    const [driverStatus, setDriverStatus] = useState<string>('OFF_DUTY');
    const [schoolId, setSchoolId] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authService.isAuthenticated() || !authService.hasRole('ROLE_DRIVER')) {
            navigate('/login');
            return;
        }

        const fetchDriverData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const currentUser = await authService.getCurrentUser();
                if (!currentUser?.id) {
                    throw new Error('User ID not found');
                }
                
                const driverData = await driverService.getDriverById(currentUser.id);
                setDriver(driverData);
                setDriverStatus(driverData.status);
                
                if (driverData.school?.id) {
                    setSchoolId(driverData.school.id);
                    localStorage.setItem('schoolId', driverData.school.id.toString());
                } else {
                    throw new Error('School ID not found in driver data');
                }
            } catch (error) {
                console.error('Error fetching driver data:', error);
                setError(error instanceof Error ? error.message : 'Failed to fetch driver data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDriverData();
    }, [authService, navigate, driverService]);

    useEffect(() => {
        if (!schoolId || !driver?.id) return;

        const fetchTripData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const trips = await tripService.findByDriverId(driver.id);
                const activeTrip = trips.find(trip => trip.status === 'IN_PROGRESS');
                setCurrentTrip(activeTrip || null);

                if (activeTrip) {
                    const vehicleData = await vehicleService.findById(activeTrip.vehicle?.id || 0);
                    setVehicle(vehicleData);

                    const routeData = await routeService.findByIdWithStops(activeTrip.route?.id || 0);
                    setRoute(routeData);

                    const studentsData = await studentService.findStudentsByRoute(activeTrip.route?.id || 0);
                    setStudents(studentsData);
                }
            } catch (error) {
                console.error('Error fetching trip data:', error);
                setError(error instanceof Error ? error.message : 'Failed to fetch trip data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTripData();
    }, [schoolId, driver?.id, tripService, vehicleService, routeService, studentService]);

    const handleStatusChange = async (newStatus: string) => {
        try {
            await driverService.updateDriver(driver?.id || 0, { status: newStatus as DriverStatus });
            setDriverStatus(newStatus);
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'AVAILABLE':
                return '#2ecc71';
            case 'ON_TRIP':
                return '#3498db';
            case 'OFF_DUTY':
                return '#e74c3c';
            case 'ON_LEAVE':
                return '#f1c40f';
            default:
                return '#95a5a6';
        }
    };

    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="driver-dashboard">
            <div className="dashboard-header">
                <h1>Welcome, {driver?.firstName} {driver?.lastName}</h1>
                <p>Driver Dashboard</p>
                <div className="status-controls">
                    <button
                        className={`status-btn ${driverStatus === 'AVAILABLE' ? 'active' : ''}`}
                        onClick={() => handleStatusChange('AVAILABLE')}
                    >
                        Available
                    </button>
                    <button
                        className={`status-btn ${driverStatus === 'OFF_DUTY' ? 'active' : ''}`}
                        onClick={() => handleStatusChange('OFF_DUTY')}
                    >
                        Off Duty
                    </button>
                    <button
                        className={`status-btn ${driverStatus === 'ON_LEAVE' ? 'active' : ''}`}
                        onClick={() => handleStatusChange('ON_LEAVE')}
                    >
                        On Leave
                    </button>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card current-trip-card">
                    <h2>Current Trip</h2>
                    {currentTrip ? (
                        <div className="trip-details">
                            <FiMap className="trip-icon" />
                            <div className="trip-info">
                                <h3>{currentTrip.route?.name}</h3>
                                <p>Status: {currentTrip.status}</p>
                                <p>Type: {currentTrip.route?.type}</p>
                                <p>Vehicle: {vehicle?.licensePlate}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="no-data">No active trip</p>
                    )}
                </div>

                <div className="dashboard-card vehicle-card">
                    <h2>Assigned Vehicle</h2>
                    {vehicle ? (
                        <div className="vehicle-details">
                            <FiTruck className="vehicle-icon" />
                            <div className="vehicle-info">
                                <h3>{vehicle.licensePlate}</h3>
                                <p>Model: {vehicle.model}</p>
                                <p>Capacity: {vehicle.capacity} students</p>
                                <p>Status: {vehicle.status}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="no-data">No vehicle assigned</p>
                    )}
                </div>

                <div className="dashboard-card students-card">
                    <h2>Students on Route</h2>
                    <div className="students-list">
                        {students.map(student => (
                            <div key={student.id} className="student-item">
                                <FiUsers className="student-icon" />
                                <div className="student-info">
                                    <h3>{student.firstName} {student.lastName}</h3>
                                    <p>Grade: {student.grade}</p>
                                    <p>Stop: <QRCodeCanvas value={student.qrCode.toString()} size={256} /> </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="dashboard-card route-card">
                    <h2>Route Details</h2>
                    {route ? (
                        <div className="route-details">
                            <FiMap className="route-icon" />
                            <div className="route-info">
                                <h3>{route.name}</h3>
                                <p>Type: {route.type}</p>
                                <p>Total Stops: {route.stops?.length || 0}</p>
                                <p>Estimated Duration: {route.duration} minutes</p>
                            </div>
                        </div>
                    ) : (
                        <p className="no-data">No route assigned</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DriverDashboard; 