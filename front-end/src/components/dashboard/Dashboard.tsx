import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAdminService, useAttendanceService, useAuthService, useDriverService, useParentService, useRouteService, useSchoolService, useStudentService, useTripService, useVehicleService } from "../../contexts/ServiceContext";
import { FiSettings, FiLogOut } from "react-icons/fi";
import { BiBell, BiUser } from "react-icons/bi";
import './Dashboard.css';
import { useEffect, useState, useRef, createContext } from "react";
import { User, UserRole } from "../../core/entities/user.entity";
import AdminDashboard from "./admin/AdminDashboard";
import { Driver } from "../../core/entities/driver.entity";
import { Parent } from "../../core/entities/parent.entity";
import { Route } from "../../core/entities/route.entity";
import { School } from "../../core/entities/school.entity";
import { Student } from "../../core/entities/student.entity";
import { Vehicle } from "../../core/entities/vehicle.entity";
import { Trip } from "../../core/entities/trip.entity";

export const MyContext = createContext<any>(null);
const Dashboard = () => {
    const navigate = useNavigate();
    const authService = useAuthService();
    const vehicleService = useVehicleService();
    const routeService = useRouteService();
    const studentService = useStudentService();
    const tripService = useTripService();
    const schoolService = useSchoolService();
    const attendanceService = useAttendanceService();
    const driverService = useDriverService();
    const adminService = useAdminService();
    const parentService = useParentService();

    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [parents, setParents] = useState<Parent[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [school, setSchool] = useState<School | null>(JSON.parse(localStorage.getItem("school") || "{}"));

    
    const [user, setUser] = useState<User | null>(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);


    const [attendance, setAttendance] = useState<number>(0);
    const [attendancePercentage, setAttendancePercentage] = useState<number>(0);

    const [trips, setTrips] = useState<Trip[]>([]);
    const [activeTrips, setActiveTrips] = useState<number>(0);
    const [activeTripsPercentage, setActiveTripsPercentage] = useState<number>(0);


    const [schoolId, setSchoolId] = useState<number>(() => {
        const storedSchool = localStorage.getItem("school");
        console.log('Raw school from localStorage:', storedSchool);
        
        if (storedSchool) {
            try {
                const school = JSON.parse(storedSchool);
                console.log('Parsed school object:', school);
                const id = school?.id;
                console.log('Extracted school ID:', id);
                return id || 0;
            } catch (error) {
                console.error("Error parsing school from localStorage:", error);
            }
        }
        return 0;
    });
    
    useEffect(() => {
        console.log('Dashboard useEffect triggered with schoolId:', schoolId);
        
        if (!schoolId) {
            console.error('No school ID available, skipping data fetch');
            return;
        }

        vehicleService.findVehiclesBySchool(schoolId).then(
            vehicles => {
                console.log('Fetched vehicles:', vehicles);
                setVehicles(vehicles);
            }
        );
        
        routeService.findBySchoolId(schoolId).then(routes => {
            console.log('Fetched routes:', routes);
            setRoutes(routes);
        });
        
        studentService.findBySchoolId(schoolId).then(students => {
            console.log('Fetched students:', students);
            setStudents(students);
        });

        tripService.getAllTrips().then(trips => {
            console.log('All trips from API:', JSON.stringify(trips, null, 2));
            console.log('Current schoolId:', schoolId);
            
            if (!trips || trips.length === 0) {
                console.log('No trips returned from API');
                setTrips([]);
                return;
            }
            
            // Filter trips by school ID
            const filteredTrips = trips.filter(trip => {
                const tripSchoolId = trip.driver?.school?.id;
                console.log('Comparing trip school ID:', tripSchoolId, 'with current school ID:', schoolId, 'for trip:', trip.id);
                return tripSchoolId === schoolId;
            });
        
            console.log('Filtered trips for school:', JSON.stringify(filteredTrips, null, 2));
            console.log('Number of filtered trips:', filteredTrips.length);
        
            setTrips(filteredTrips);
        
            // Count active trips (trips that are not completed or cancelled)
            const activeCount = filteredTrips.filter(trip => 
                trip.status !== 'COMPLETED' && trip.status !== 'CANCELLED'
            ).length;
            
            console.log('Active trips count:', activeCount);
            setActiveTrips(activeCount);
    
            const percentage = filteredTrips.length > 0 
                ? Math.round((activeCount / filteredTrips.length) * 100) 
                : 0;
    
            console.log('Active trips percentage:', percentage);
            setActiveTripsPercentage(percentage);
        }).catch(error => {
            console.error('Error fetching trips:', error);
            setTrips([]);
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

        adminService.getAllParents().then(users => {
            setParents(users);
        }).catch(error => {
            console.warn("Could not fetch parents:", error);
            setParents([]);
        });
        
        driverService.getAllDriversBySchoolId(schoolId).then(users => {
            setDrivers(users);
        }).catch(error => {
            console.warn("Could not fetch drivers:", error);
            setDrivers([]);
        });
    }, []);
    
    useEffect(() => {
        authService.getCurrentUser().then(setUser);
    }, [authService]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if(user?.role.toString() === "ROLE_ADMIN"){
            navigate("/dashboard/admin");
        }
    }, [user]);

    const logout = async () => {
        try {
            setShowProfileMenu(false);
            await authService.logout();
            navigate('/login');
        } catch (error) {
            console.error('Error during logout:', error);
            navigate('/login');
        }
    }

    return ( 
        <main id="dashboard">
            <header>
                <h1>Nimbus</h1>

                <div className="desktop-nav">
                    <nav>
                        {
                            authService.isAuthenticated() && authService.hasRole('ROLE_ADMIN') && (
                                <>
                                    <NavLink to="/dashboard/admin">Dashboard</NavLink>
                                    <NavLink to="vehicles">Vehicles</NavLink>
                                    <NavLink to="users">Users</NavLink>
                                    <NavLink to="students">Students</NavLink>
                                    <NavLink to="routes">Routes</NavLink>
                                    <NavLink to="trips">Trips</NavLink>
                                    <NavLink to="attendance">Attendance</NavLink>
                                    <NavLink to="reports">Reports</NavLink>
                                </>
                            )
                        }
                        {
                            authService.isAuthenticated() && authService.hasRole('ROLE_DRIVER') && (
                                <>
                                    <NavLink to="/dashboard/driver">Dashboard</NavLink>
                                    <NavLink to="trips">Trips</NavLink>
                                    <NavLink to="routes">Routes</NavLink>
                                    <NavLink to="history">History</NavLink>
                                    <NavLink to="reports">Reports</NavLink>
                                </>
                            )
                        }
                        {
                            authService.isAuthenticated() && authService.hasRole('ROLE_PARENT') && (
                                <>
                                    <NavLink to="/dashboard/parent">Dashboard</NavLink>
                                    <NavLink to="trips">Trips</NavLink>
                                    <NavLink to="routes">Routes</NavLink>
                                    <NavLink to="attendance">Attendance</NavLink>
                                    <NavLink to="reports">Reports</NavLink>
                                </>
                            )
                        }
                    </nav>
                    <button type="button" className="settings-btn">
                        <FiSettings />
                        <span>Setting</span>
                    </button>
                    <button type="button" className="notification-btn" title="Notifications">
                        <BiBell />
                        <span style={{width: "10px", height: "10px", backgroundColor: "#28887A", borderRadius: "50%", position: "absolute", top: "5px", right: "0px"}}></span>
                    </button>
                    <div className="profile-menu-container" ref={profileMenuRef}>
                        <button 
                            type="button" 
                            className="profile-btn" 
                            title="Profile" 
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                        >
                            <BiUser />
                        </button>
                        {showProfileMenu && (
                            <div className="profile-dropdown">
                                <div className="user-info">
                                    <span className="user-name">{user?.firstName} {user?.lastName}</span>
                                    <span className="user-email">{user?.email}</span>
                                </div>
                                <hr />
                                <button onClick={()=> {
                                    logout().catch(err => console.error('Error in logout handler:', err));
                                }} className="logout-btn">
                                    <FiLogOut /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            <div className="dashboard-content">
                <div className="dashboard-content-header">
                    <h1>Welcome In, <span>{user?.firstName}</span></h1>
                </div>
                <MyContext.Provider value={{ vehicles, routes, students, parents, drivers, school, attendancePercentage, trips, activeTripsPercentage }}>
                    <Outlet />
                </MyContext.Provider>
            </div>
        </main>
     );
}
 
export default Dashboard;