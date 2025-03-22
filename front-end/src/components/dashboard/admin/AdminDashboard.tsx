import {useEffect, useState} from "react";
import {Vehicle} from "../../../core/entities/vehicle.entity.ts";
import {useAdminService, useAttendanceService, useRouteService, useSchoolService, useStudentService, useTripService, useVehicleService} from "../../../contexts/ServiceContext.tsx";
import { Route, RouteType } from "../../../core/entities/route.entity.ts";
import { Student } from "../../../core/entities/student.entity.ts";
import { Trip, TripStatus } from "../../../core/entities/trip.entity.ts";
import { RiParentLine, RiRouteFill } from "react-icons/ri";
import { PiStudent } from "react-icons/pi";
import { Driver, DriverStatus } from "../../../core/entities/driver.entity.ts";
import { Parent } from "../../../core/entities/parent.entity.ts";
import { CiRoute } from "react-icons/ci";
import TripCard from "./trips/TripCard.tsx";
import { UserRole } from "../../../core/entities/user.entity.ts";
import Map from "./Map.tsx";
import { School } from "../../../core/entities/school.entity.ts";
import { GiMassDriver } from "react-icons/gi";
import './AdminDashboard.css';
import { FaBus } from "react-icons/fa6";
import SchoolForm from "./school/SchoolForm.tsx";

const AdminDashboard = () => {
    const vehicleService = useVehicleService();
    const routeService = useRouteService();
    const studentService = useStudentService();
    const tripService = useTripService();
    const schoolService = useSchoolService();
    const attendanceService = useAttendanceService();
    const adminService = useAdminService();


    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [parents, setParents] = useState<Parent[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [school, setSchool] = useState<School | null>(JSON.parse(localStorage.getItem("school") || "{}"));
    const [isSchoolFormOpen, setIsSchoolFormOpen] = useState(false);
    
    const [attendance, setAttendance] = useState<number>(0);
    const [attendancePercentage, setAttendancePercentage] = useState<number>(0);

    const [trips, setTrips] = useState<Trip[]>([
        {
            id: 1,
            scheduledDepartureTime: "2024-01-01",
            scheduledArrivalTime: "2024-01-01",
            status: TripStatus.IN_PROGRESS,
            active: true,
            driver: {
                id: 1,
                firstName: "Driver 1",
                lastName: "Driver 1",
                email: "driver1@gmail.com",
                phoneNumber: "1234567890",
                address: "123 Main St",
                school: {
                    id: 1,
                    name: "School 1",
                    address: "123 Main St",
                    phoneNumber: "1234567890",
                    latitude: 123.456,
                    longitude: 78.910,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                licenseNumber: "1234567890",
                licenseExpiryDate: "2024-01-01",
                status: DriverStatus.AVAILABLE,
                role: UserRole.DRIVER,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            vehicle: {
                id: 1,
                make: "Vehicle 1",
                model: "Model 1",
                year: 2024,
                capacity: 10,
                status: "ACTIVE",
                insuranceExpiryDate: "2024-01-01",
                registrationExpiryDate: "2024-01-01",
                lastMaintenanceDate: "2024-01-01",
                school: {
                    id: 1,
                    name: "School 1",
                    address: "123 Main St",
                    phoneNumber: "1234567890",
                    latitude: 123.456,
                    longitude: 78.910,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                licensePlate: "1234567890",
                currentMileage: 1000,
                createdAt: "2024-01-01",
                updatedAt: "2024-01-01"
            },
            route: {
                id: 1,
                name: "Route 1",
                school: {
                    id: 1,
                    name: "School 1",
                    address: "123 Main St",
                    phoneNumber: "1234567890",
                    latitude: 123.456,
                    longitude: 78.910,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                type: RouteType.PICKUP,
                stops: [],
                distance: 100,
                duration: 100,
                active: true,
                createdAt: "2024-01-01",
                updatedAt: "2024-01-01"
            }
        },
        {
            id: 2,
            scheduledDepartureTime: "2024-01-01",
            scheduledArrivalTime: "2024-01-01",
            status: TripStatus.IN_PROGRESS,
            active: true,
            driver: {
                id: 1,
                firstName: "Driver 1",
                lastName: "Driver 1",
                email: "driver1@gmail.com",
                phoneNumber: "1234567890",
                address: "123 Main St",
                school: {
                    id: 1,
                    name: "School 1",
                    address: "123 Main St",
                    phoneNumber: "1234567890",
                    latitude: 123.456,
                    longitude: 78.910,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                licenseNumber: "1234567890",
                licenseExpiryDate: "2024-01-01",
                status: DriverStatus.AVAILABLE,
                role: UserRole.DRIVER,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            vehicle: {
                id: 1,
                make: "Vehicle 1",
                model: "Model 1",
                year: 2024,
                capacity: 10,
                status: "ACTIVE",
                insuranceExpiryDate: "2024-01-01",
                registrationExpiryDate: "2024-01-01",
                lastMaintenanceDate: "2024-01-01",
                school: {
                    id: 1,
                    name: "School 1",
                    address: "123 Main St",
                    phoneNumber: "1234567890",
                    latitude: 123.456,
                    longitude: 78.910,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                licensePlate: "1234567890",
                currentMileage: 1000,
                createdAt: "2024-01-01",
                updatedAt: "2024-01-01"
            },
            route: {
                id: 1,
                name: "Route 1",
                school: {
                    id: 1,
                    name: "School 1",
                    address: "123 Main St",
                    phoneNumber: "1234567890",
                    latitude: 123.456,
                    longitude: 78.910,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                type: RouteType.PICKUP,
                stops: [],
                distance: 100,
                duration: 100,
                active: true,
                createdAt: "2024-01-01",
                updatedAt: "2024-01-01"
            }
        },
        {
            id: 3,
            scheduledDepartureTime: "2024-01-01",
            scheduledArrivalTime: "2024-01-01",
            status: TripStatus.IN_PROGRESS,
            active: true,
            driver: {
                id: 1,
                firstName: "Driver 1",
                lastName: "Driver 1",
                email: "driver1@gmail.com",
                phoneNumber: "1234567890",
                address: "123 Main St",
                school: {
                    id: 1,
                    name: "School 1",
                    address: "123 Main St",
                    phoneNumber: "1234567890",
                    latitude: 123.456,
                    longitude: 78.910,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                licenseNumber: "1234567890",
                licenseExpiryDate: "2024-01-01",
                status: DriverStatus.AVAILABLE,
                role: UserRole.DRIVER,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            vehicle: {
                id: 1,
                make: "Vehicle 1",
                model: "Model 1",
                year: 2024,
                capacity: 10,
                status: "ACTIVE",
                insuranceExpiryDate: "2024-01-01",
                registrationExpiryDate: "2024-01-01",
                lastMaintenanceDate: "2024-01-01",
                school: {
                    id: 1,
                    name: "School 1",
                    address: "123 Main St",
                    phoneNumber: "1234567890",
                    latitude: 123.456,
                    longitude: 78.910,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                licensePlate: "1234567890",
                currentMileage: 1000,
                createdAt: "2024-01-01",
                updatedAt: "2024-01-01"
            },
            route: {
                id: 1,
                name: "Route 1",
                school: {
                    id: 1,
                    name: "School 1",
                    address: "123 Main St",
                    phoneNumber: "1234567890",
                    latitude: 123.456,
                    longitude: 78.910,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                type: RouteType.PICKUP,
                stops: [],
                distance: 100,
                duration: 100,
                active: true,
                createdAt: "2024-01-01",
                updatedAt: "2024-01-01"
            }
        },
        
        
    ]);
    const [activeTrips, setActiveTrips] = useState<number>(0);
    const [activeTripsPercentage, setActiveTripsPercentage] = useState<number>(0);


    const [schoolId, setSchoolId] = useState<number>(() => {
        const storedSchool = localStorage.getItem("school");
        if (storedSchool) {
            try {
                return JSON.parse(storedSchool)?.id || 0;
            } catch (error) {
                console.error("Error parsing school from localStorage:", error);
            }
        }
        return 0;
    });
    
    useEffect(() => {
        vehicleService.findVehiclesBySchool(schoolId).then(setVehicles);
        routeService.findBySchoolId(schoolId).then(setRoutes);
        studentService.findBySchoolId(schoolId).then(setStudents);
        
        tripService.findBySchoolId(schoolId).then(trips => {
            //setTrips(trips);
            
            tripService.countActiveTripsForSchool(schoolId).then(activeCount => {
                setActiveTrips(activeCount);
                
                if (trips.length > 0) {
                    const percentage = (activeCount / trips.length) * 100;
                    setActiveTripsPercentage(Math.round(percentage));
                } else {
                    setActiveTripsPercentage(0);
                }
            });
        });
        
        attendanceService.countTodaysPresentAttendance(schoolId).then(presentCount => {
            setAttendance(presentCount);
            
            studentService.findBySchoolId(schoolId).then(students => {
                if (students.length > 0) {
                    const percentage = (presentCount / students.length) * 100;
                    setAttendancePercentage(Math.round(percentage));
                } else {
                    setAttendancePercentage(0);
                }
            });
        });

        adminService.getUsersByRole("PARENT").then(users => {
            setParents(users.map(user => user as Parent));
        });
        adminService.getUsersByRole("DRIVER").then(users => {
            setDrivers(users.map(user => user as Driver));
        });
    }, []);

    return ( 
        <div className="admin-dashboard">
            <div className="admin-dashboard-header">
                <div className="stats">
                    <div className="stat">
                        <h3>Vehicles</h3>
                        <p>{vehicles.length}</p>
                    </div>
                    <div className="stat">
                        <h3>Routes</h3>
                        <p>{routes.length}</p>
                    </div>
                    <div className="stat">
                        <h3>Active Trips</h3>
                        <p>{activeTripsPercentage}%</p>
                    </div>
                    <div className="stat">
                        <h3>Attendance</h3>
                        <p>{attendancePercentage}%</p>
                    </div>
                    
                </div>
                <div className="big-stats">
                    <div className="big-stat">
                        <p>
                            <PiStudent className="stat-icon"/>
                            <strong>{students.length.toString().padStart(2, '0')}</strong>
                        </p>
                        <span>Students</span>
                    </div>
                    <div className="big-stat">
                        <p>
                            <RiParentLine className="stat-icon"/>
                            <strong>{parents.length.toString().padStart(2, '0')}</strong>
                        </p>
                        <span>Parents</span>
                    </div>
                    <div className="big-stat">
                        <p>
                            <CiRoute className="stat-icon"/>
                            <strong>{drivers.length.toString().padStart(2, '0')}</strong>
                        </p>
                        <span>Drivers</span>
                    </div>
                </div>
            </div>
            <div className="admin-dashboard-content">
                <div className="map-container">
                    <Map />
                </div>
                <div className="active-trips-container">
                    <h3>Current Trips</h3>
                    <div className="active-trips-list">
                        {trips.filter(trip => trip.active && trip.status === TripStatus.IN_PROGRESS).map(trip => (
                            <TripCard key={trip.id} trip={trip} />
                        ))}
                        {trips.filter(trip => trip.active && trip.status === TripStatus.IN_PROGRESS).length === 0 && (
                            <div className="active-trips-list-empty">
                                <p>No active trips</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="admin-dashboard-content-right">
                    <div className="admin-dashboard-content-right-header">
                    <div className="school">
                            <img src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=80" alt="school" />
                            <div className="school-info">
                                <div className="school-info-details">
                                    <h3>{school?.name}</h3>
                                    <p>{school?.phoneNumber}</p>
                                </div>
                                <button type="button" onClick={() => setIsSchoolFormOpen(true)}>Update</button>
                            </div>
                        </div>
                        <div className="actions">
                            <div className="action-card add-vehicle">
                                <div className="action-icon">
                                    <FaBus/>
                                </div>
                                <span>Add Vehicle</span>
                            </div>
                            <div className="action-card add-driver">
                                <div className="action-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </div>
                                <span>Add Driver</span>
                            </div>
                            <div className="action-card add-route">
                                <div className="action-icon">
                                    <RiRouteFill/>
                                </div>
                                <span>Add Route</span>
                            </div>
                            <div className="action-card add-student">
                                <div className="action-icon">
                                    <PiStudent/>
                                </div>
                                <span>Add Student</span>
                            </div>
                        </div>
                        
                      
                    </div>
                    <div className="premium-features">
                    </div>
                </div>
            </div>
            
            {/* School Form Modal */}
            <SchoolForm 
                isOpen={isSchoolFormOpen} 
                onClose={() => setIsSchoolFormOpen(false)} 
                school={school}
            />
        </div>
     );
}
 
export default AdminDashboard;