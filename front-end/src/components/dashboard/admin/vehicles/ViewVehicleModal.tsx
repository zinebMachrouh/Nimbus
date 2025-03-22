import { FaTimes, FaCarAlt, FaMapMarkerAlt, FaRegCalendarAlt, FaRoad } from "react-icons/fa";
import { Vehicle } from "../../../../core/entities/vehicle.entity";
import "./AddVehicleModal.css"; // Reusing the existing modal styles
import "./ViewVehicleModal.css"; // Additional styles specific to the view modal

interface ViewVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
}

const ViewVehicleModal = ({ isOpen, onClose, vehicle }: ViewVehicleModalProps) => {
  if (!isOpen) return null;

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container view-vehicle-modal">
        <div className="modal-header">
          <h2><FaCarAlt /> Vehicle Details</h2>
          <button className="close-button" onClick={onClose} aria-label="Close modal">
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <div className="vehicle-header">
            <h1 className="vehicle-title">{vehicle.make} {vehicle.model}</h1>
            <div className={`status-badge ${vehicle.status.toLowerCase()}`}>
              {vehicle.status}
            </div>
          </div>

          <div className="detail-sections">
            <div className="detail-section">
              <h3>General Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">License Plate</span>
                  <span className="detail-value">{vehicle.licensePlate}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Year</span>
                  <span className="detail-value">{vehicle.year}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Capacity</span>
                  <span className="detail-value">{vehicle.capacity} seats</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Current Mileage</span>
                  <span className="detail-value">{vehicle.currentMileage} km</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Dates & Registration</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Insurance Expiry</span>
                  <span className="detail-value">{formatDate(vehicle.insuranceExpiryDate)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Registration Expiry</span>
                  <span className="detail-value">{formatDate(vehicle.registrationExpiryDate)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last Maintenance</span>
                  <span className="detail-value">{formatDate(vehicle.lastMaintenanceDate)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Created</span>
                  <span className="detail-value">{formatDate(vehicle.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Location & Tracking</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Current Latitude</span>
                  <span className="detail-value">{vehicle.currentLatitude || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Current Longitude</span>
                  <span className="detail-value">{vehicle.currentLongitude || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Tracking Device ID</span>
                  <span className="detail-value">{vehicle.trackingDeviceId || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">School</span>
                  <span className="detail-value">{vehicle.school?.name || 'Not assigned'}</span>
                </div>
              </div>
            </div>

            {(vehicle.completedTripsCount !== undefined || 
              vehicle.totalMileage !== undefined || 
              vehicle.activeTripsCount !== undefined) && (
              <div className="detail-section">
                <h3>Statistics</h3>
                <div className="detail-grid">
                  {vehicle.completedTripsCount !== undefined && (
                    <div className="detail-item">
                      <span className="detail-label">Completed Trips</span>
                      <span className="detail-value">{vehicle.completedTripsCount}</span>
                    </div>
                  )}
                  {vehicle.totalMileage !== undefined && (
                    <div className="detail-item">
                      <span className="detail-label">Total Mileage</span>
                      <span className="detail-value">{vehicle.totalMileage} km</span>
                    </div>
                  )}
                  {vehicle.activeTripsCount !== undefined && (
                    <div className="detail-item">
                      <span className="detail-label">Active Trips</span>
                      <span className="detail-value">{vehicle.activeTripsCount}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="map-preview">
            {vehicle.currentLatitude && vehicle.currentLongitude ? (
              <div className="location-info">
                <div className="location-icon">
                  <FaMapMarkerAlt />
                </div>
                <div className="location-text">
                  <strong>Current Location</strong>
                  <p>Latitude: {vehicle.currentLatitude}, Longitude: {vehicle.currentLongitude}</p>
                </div>
              </div>
            ) : (
              <div className="no-location">
                <FaMapMarkerAlt className="no-location-icon" />
                <span>No location data available</span>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="close-button-primary" 
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewVehicleModal; 