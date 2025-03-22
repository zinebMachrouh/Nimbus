import {useEffect, useState} from "react";
import {Vehicle} from "../../../core/entities/vehicle.entity.ts";
import { Route, RouteType } from "../../../core/entities/route.entity.ts";
import { Student } from "../../../core/entities/student.entity.ts";
import { Trip, TripStatus } from "../../../core/entities/trip.entity.ts";
import { RiParentLine, RiRouteFill } from "react-icons/ri";
import { PiStudent } from "react-icons/pi";
import { Driver, DriverStatus } from "../../../core/entities/driver.entity.ts";
import { Parent } from "../../../core/entities/parent.entity.ts";
import { CiRoute } from "react-icons/ci";
import TripCard from "./trips/TripCard.tsx";
import Map from "./Map.tsx";
import { School } from "../../../core/entities/school.entity.ts";
import './AdminDashboard.css';
import { FaBus } from "react-icons/fa6";
import SchoolForm from "./school/SchoolForm.tsx";
import { Attendance } from "../../../core/entities/attendance.entity.ts";

const AdminDashboard = ({vehicles, routes, students, parents, drivers, school, attendancePercentage, trips, activeTripsPercentage}: {vehicles: Vehicle[], routes: Route[], students: Student[], parents: Parent[], drivers: Driver[], school: School, activeTrips: Trip[], attendance: Attendance[], attendancePercentage: number, trips: Trip[], activeTripsPercentage: number}) => {
    const [isSchoolFormOpen, setIsSchoolFormOpen] = useState(false);

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