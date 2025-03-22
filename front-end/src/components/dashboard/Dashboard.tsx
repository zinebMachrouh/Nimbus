import { NavLink, useNavigate } from "react-router-dom";
import { useAuthService } from "../../contexts/ServiceContext";
import { FiSettings, FiLogOut } from "react-icons/fi";
import { BiBell, BiUser } from "react-icons/bi";
import './Dashboard.css';
import { useEffect, useState, useRef } from "react";
import { User } from "../../core/entities/user.entity";
import AdminDashboard from "./admin/AdminDashboard";

const Dashboard = () => {
    const navigate = useNavigate();
    const authService = useAuthService();
    const [user, setUser] = useState<User | null>(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        authService.getCurrentUser().then(setUser);
    }, [authService]);

    useEffect(() => {
        // Close profile menu when clicking outside
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
        // Close the profile menu first
        setShowProfileMenu(false);
        
        // Call the logout method from authService
        authService.logout();
        
        // Navigate to login page
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
                        <AdminDashboard />
                    )
                }
            </div>
        </main>
     );
}
 
export default Dashboard;