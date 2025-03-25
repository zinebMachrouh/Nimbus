import React, { useEffect, useState } from 'react';
import { useAuthService } from '../../../contexts/ServiceContext';
import { useNavigate } from 'react-router-dom';
import { Student } from '../../../core/entities/student.entity';
import { Trip } from '../../../core/entities/trip.entity';
import { Attendance } from '../../../core/entities/attendance.entity';
import { Route } from '../../../core/entities/route.entity';
import { Parent } from '../../../core/entities/parent.entity';
import { FiUser, FiMap, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import './ParentDashboard.css';

const ParentDashboard: React.FC = () => {
    const navigate = useNavigate();
    const authService = useAuthService();
    const [children, setChildren] = useState<Student[]>([]);
    const [currentTrips, setCurrentTrips] = useState<Trip[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [parent, setParent] = useState<Parent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sectionLoading, setSectionLoading] = useState({
        children: false,
        trips: false,
        attendance: false,
        routes: false
    });

    const fetchParentDetails = async () => {
        try {
            const parentData = await authService.getParentDetails();
            setParent(parentData);
        } catch (err) {
            console.error('Error fetching parent details:', err);
            throw new Error('Failed to load parent details');
        }
    };

    const fetchChildren = async () => {
        setSectionLoading(prev => ({ ...prev, children: true }));
        try {
            const childrenData = await authService.getParentChildren();
            setChildren(childrenData);
            return childrenData;
        } catch (err) {
            console.error('Error fetching children:', err);
            throw new Error('Failed to load children information');
        } finally {
            setSectionLoading(prev => ({ ...prev, children: false }));
        }
    };

    const fetchCurrentTrips = async (childrenData: Student[]) => {
        setSectionLoading(prev => ({ ...prev, trips: true }));
        try {
            const tripsPromises = childrenData.map(child => 
                authService.getCurrentTrips(child.id)
            );
            const tripsResults = await Promise.all(tripsPromises);
            const allTrips = tripsResults.flat();
            setCurrentTrips(allTrips);
        } catch (err) {
            console.error('Error fetching trips:', err);
            throw new Error('Failed to load current trips');
        } finally {
            setSectionLoading(prev => ({ ...prev, trips: false }));
        }
    };

    const fetchAttendanceRecords = async (childrenData: Student[]) => {
        setSectionLoading(prev => ({ ...prev, attendance: true }));
        try {
            const attendancePromises = childrenData.map(child =>
                authService.getAttendanceRecords(child.id)
            );
            const attendanceResults = await Promise.all(attendancePromises);
            const allAttendance = attendanceResults.flat();
            setAttendanceRecords(allAttendance);
        } catch (err) {
            console.error('Error fetching attendance:', err);
            throw new Error('Failed to load attendance records');
        } finally {
            setSectionLoading(prev => ({ ...prev, attendance: false }));
        }
    };

    const fetchRoutes = async (childrenData: Student[]) => {
        setSectionLoading(prev => ({ ...prev, routes: true }));
        try {
            const routesPromises = childrenData.map(child =>
                authService.getStudentRoutes(child.id)
            );
            const routesResults = await Promise.all(routesPromises);
            const allRoutes = routesResults.flat();
            setRoutes(allRoutes);
        } catch (err) {
            console.error('Error fetching routes:', err);
            throw new Error('Failed to load routes');
        } finally {
            setSectionLoading(prev => ({ ...prev, routes: false }));
        }
    };

    const fetchData = async () => {
        try {
            if (!authService.isAuthenticated() || !authService.hasRole('ROLE_PARENT')) {
                navigate('/login');
                return;
            }

            const user = await authService.getCurrentUser();
            if (!user) {
                navigate('/login');
                return;
            }

            await fetchParentDetails();
            const childrenData = await fetchChildren();
            await Promise.all([
                fetchCurrentTrips(childrenData),
                fetchAttendanceRecords(childrenData),
                fetchRoutes(childrenData)
            ]);

            setLoading(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
            console.error('Error loading dashboard:', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Set up polling for real-time updates
        const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [authService, navigate]);

    const getAttendanceStatus = (status: string) => {
        switch (status) {
            case 'PRESENT':
                return <FiCheckCircle className="status-icon present" />;
            case 'ABSENT':
                return <FiXCircle className="status-icon absent" />;
            case 'LATE':
                return <FiAlertCircle className="status-icon late" />;
            default:
                return null;
        }
    };

    if (loading) {
        return <div className="loading">Loading dashboard...</div>;
    }

    if (error) {
        return (
            <div className="error">
                <p>{error}</p>
                <button onClick={fetchData} className="retry-button">
                    <FiRefreshCw /> Retry
                </button>
            </div>
        );
    }

    return (
        <div className="parent-dashboard">
            <div className="dashboard-header">
                <h1>Welcome, {parent?.firstName} {parent?.lastName}</h1>
                <p>Here's an overview of your children's school transportation</p>
                <button onClick={fetchData} className="refresh-button">
                    <FiRefreshCw /> Refresh
                </button>
            </div>

            <div className="dashboard-grid">
                {/* My Children Section */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <FiUser className="card-icon" />
                        <h2>My Children</h2>
                    </div>
                    <div className="card-content">
                        {sectionLoading.children ? (
                            <div className="section-loading">Loading children...</div>
                        ) : children.length > 0 ? (
                            <ul className="children-list">
                                {children.map(child => (
                                    <li key={child.id} className="child-item">
                                        <div className="child-info">
                                            <h3>{child.firstName} {child.lastName}</h3>
                                            <p>Grade: {child.grade}</p>
                                            <p>Student ID: {child.studentId}</p>
                                        </div>
                                        <div className="child-status">
                                            <span className={`status-badge ${child.active ? 'active' : 'inactive'}`}>
                                                {child.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="no-data">No children registered</p>
                        )}
                    </div>
                </div>

                {/* Current Trips Section */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <FiClock className="card-icon" />
                        <h2>Current Trips</h2>
                    </div>
                    <div className="card-content">
                        {sectionLoading.trips ? (
                            <div className="section-loading">Loading trips...</div>
                        ) : currentTrips.length > 0 ? (
                            <ul className="trips-list">
                                {currentTrips.map(trip => (
                                    <li key={trip.id} className="trip-item">
                                        <div className="trip-info">
                                            <h3>{trip.route?.name}</h3>
                                            <p>Status: {trip.status}</p>
                                            <p>Departure: {new Date(trip.scheduledDepartureTime).toLocaleTimeString()}</p>
                                        </div>
                                        <div className="trip-status">
                                            <span className={`status-badge ${trip.status.toLowerCase()}`}>
                                                {trip.status}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="no-data">No active trips</p>
                        )}
                    </div>
                </div>

                {/* Recent Attendance Section */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <FiCheckCircle className="card-icon" />
                        <h2>Recent Attendance</h2>
                    </div>
                    <div className="card-content">
                        {sectionLoading.attendance ? (
                            <div className="section-loading">Loading attendance...</div>
                        ) : attendanceRecords.length > 0 ? (
                            <ul className="attendance-list">
                                {attendanceRecords.slice(0, 5).map(record => (
                                    <li key={record.id} className="attendance-item">
                                        <div className="attendance-info">
                                            <h3>{record.student?.firstName} {record.student?.lastName}</h3>
                                            <p>{record.scanTime ? new Date(record.scanTime).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                        <div className="attendance-status">
                                            {getAttendanceStatus(record.status)}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="no-data">No attendance records</p>
                        )}
                    </div>
                </div>

                {/* Assigned Routes Section */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <FiMap className="card-icon" />
                        <h2>Assigned Routes</h2>
                    </div>
                    <div className="card-content">
                        {sectionLoading.routes ? (
                            <div className="section-loading">Loading routes...</div>
                        ) : routes.length > 0 ? (
                            <ul className="routes-list">
                                {routes.map(route => (
                                    <li key={route.id} className="route-item">
                                        <div className="route-info">
                                            <h3>{route.name}</h3>
                                            <p>Pickup: {route.pickupLocation}</p>
                                            <p>Dropoff: {route.dropoffLocation}</p>
                                        </div>
                                        <div className="route-details">
                                            <span className="route-time">
                                                {new Date(route.scheduledPickupTime).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="no-data">No routes assigned</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParentDashboard; 