import { Trip, TripStatus } from "../../../../core/entities/trip.entity";
import { FaBus, FaUser, FaRoute, FaClock } from 'react-icons/fa';
import './TripCard.css';

const TripCard = ({trip}: {trip: Trip}) => {
    const formatTime = (timeString?: string) => {
        if (!timeString) return 'N/A';
        try {
            const date = new Date(timeString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return timeString;
        }
    };

    const getStatusColor = () => {
        switch(trip.status) {
            case TripStatus.IN_PROGRESS:
                return 'var(--keppel)';
            case TripStatus.COMPLETED:
                return 'var(--satin-sheen-gold)';
            case TripStatus.SCHEDULED:
                return 'var(--tiffany-blue)';
            case TripStatus.CANCELLED:
                return 'var(--night)';
            default:
                return 'var(--viridian)';
        }
    };

    const getDriverName = () => {
        if (!trip.driver) return 'No Driver Assigned';
        return `${trip.driver.firstName || ''} ${trip.driver.lastName || ''}`.trim() || 'Unnamed Driver';
    };
    
    const getVehicleDesc = () => {
        if (!trip.vehicle) return 'No Vehicle Assigned';
        return `${trip.vehicle.make || ''} ${trip.vehicle.model || ''}`.trim() || 'Unnamed Vehicle';
    };

    return ( 
        <div className="trip-card" style={{ borderColor: getStatusColor() }}>
            <div className="trip-card-header">
                <div className="trip-time">
                    <FaClock className="trip-icon" />
                    <div>
                        <p className="time-label">Departure</p>
                        <h4>{formatTime(trip.scheduledDepartureTime)}</h4>
                    </div>
                    <div className="time-separator">→</div>
                    <div>
                        <p className="time-label">Arrival</p>
                        <h4>{formatTime(trip.scheduledArrivalTime)}</h4>
                    </div>
                </div>
                <div className="trip-status" style={{ backgroundColor: getStatusColor() }}>
                    {trip.status}
                </div>
            </div>
            
            <div className="trip-card-details">
                <div className="trip-detail">
                    <FaUser className="detail-icon" />
                    <p>{getDriverName()}</p>
                </div>
                
                <div className="trip-detail">
                    <FaBus className="detail-icon" />
                    <p>
                        {getVehicleDesc()}
                        {trip.vehicle?.licensePlate && (
                            <span className="license-plate">{trip.vehicle.licensePlate}</span>
                        )}
                    </p>
                </div>
                
                <div className="trip-detail">
                    <FaRoute className="detail-icon" />
                    <p>{trip.route?.name || 'No Route Assigned'}</p>
                </div>
            </div>
        </div>
    );
}

export default TripCard;