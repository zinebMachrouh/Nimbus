import { NavLink, useNavigate } from "react-router-dom";
import { useAdminService, useAttendanceService, useAuthService, useRouteService, useSchoolService, useStudentService, useTripService, useVehicleService } from "../../contexts/ServiceContext";
import { FiSettings, FiLogOut } from "react-icons/fi";
import { BiBell, BiUser } from "react-icons/bi";
import './Dashboard.css';
import { useEffect, useState, useRef } from "react";
import { User } from "../../core/entities/user.entity";
import AdminDashboard from "./admin/AdminDashboard";
import { Driver } from "../../core/entities/driver.entity";
import { Parent } from "../../core/entities/parent.entity";
import { Route } from "../../core/entities/route.entity";
import { School } from "../../core/entities/school.entity";
import { Student } from "../../core/entities/student.entity";
import { Vehicle } from "../../core/entities/vehicle.entity";
import { Trip } from "../../core/entities/trip.entity";

const Dashboard = () => {
    const navigate = useNavigate();
    const authService = useAuthService();
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
            setTrips(trips);
            
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

    const logout = () => {
        setShowProfileMenu(false);
        authService.logout();        
        navigate('/login');
    }

    return ( 
        <main id="dashboard">
            <header>
                <h1>Nimbus</h1>

                <div className="desktop-nav">
                    <nav>
                        <NavLink to="/dashboard">Dashboard</NavLink>
                        {
                            authService.isAuthenticated() && authService.hasRole('ROLE_ADMIN') && (
                                <>
                                    <NavLink to="/users">Users</NavLink>
                                    <NavLink to="/students">Students</NavLink>
                                    <NavLink to="/vehicles">Vehicles</NavLink>
                                    <NavLink to="/trips">Trips</NavLink>
                                    <NavLink to="/routes">Routes</NavLink>
                                    <NavLink to="/reports">Reports</NavLink>
                                </>
                            )
                        }
                        {
                            authService.isAuthenticated() && authService.hasRole('ROLE_DRIVER') && (
                                <>
                                    <NavLink to="/trips">Trips</NavLink>
                                    <NavLink to="/routes">Routes</NavLink>
                                    <NavLink to="/history">History</NavLink>
                                    <NavLink to="/reports">Reports</NavLink>
                                </>
                            )
                        }
                        {
                            authService.isAuthenticated() && authService.hasRole('ROLE_PARENT') && (
                                <>
                                    <NavLink to="/trips">Trips</NavLink>
                                    <NavLink to="/routes">Routes</NavLink>
                                    <NavLink to="/attendance">Attendance</NavLink>
                                    <NavLink to="/reports">Reports</NavLink>
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
                        <span className="notification-badge"></span>
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
                                <button onClick={()=>logout()} className="logout-btn">
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
                {
                    authService.hasRole('ROLE_ADMIN') && (
                        <AdminDashboard vehicles={vehicles} routes={routes} students={students} parents={parents} drivers={drivers} school={school as School}  attendancePercentage={attendancePercentage} trips={trips} activeTripsPercentage={activeTripsPercentage} />
                    )
                }
            </div>
        </main>
     );
}
 
export default Dashboard;