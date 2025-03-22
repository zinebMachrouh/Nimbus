import { useState, useEffect } from "react";
import { FaTimes, FaCarAlt, FaSave } from "react-icons/fa";
import "./AddVehicleModal.css"; // Reusing the existing modal styles
import { Vehicle, VehicleStatus } from "../../../../core/entities/vehicle.entity";
import { useVehicleService } from "../../../../contexts/ServiceContext";

interface EditVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  onVehicleUpdated: (vehicle: Vehicle) => void;
}

const EditVehicleModal = ({ isOpen, onClose, vehicle, onVehicleUpdated }: EditVehicleModalProps) => {
  const vehicleService = useVehicleService();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    licensePlate: "",
    capacity: 0,
    currentMileage: 0,
    status: "",
    registrationExpiryDate: "",
    insuranceExpiryDate: "",
    lastMaintenanceDate: "",
    currentLatitude: 0,
    currentLongitude: 0
  });

  // Load vehicle data when modal opens
  useEffect(() => {
    if (isOpen && vehicle) {
      setFormData({
        make: vehicle.make || "",
        model: vehicle.model || "",
        year: vehicle.year || new Date().getFullYear(),
        licensePlate: vehicle.licensePlate || "",
        capacity: vehicle.capacity || 0,
        currentMileage: vehicle.currentMileage || 0,
        status: vehicle.status || VehicleStatus.AVAILABLE,
        registrationExpiryDate: vehicle.registrationExpiryDate ? vehicle.registrationExpiryDate.split('T')[0] : "",
        insuranceExpiryDate: vehicle.insuranceExpiryDate ? vehicle.insuranceExpiryDate.split('T')[0] : "",
        lastMaintenanceDate: vehicle.lastMaintenanceDate ? vehicle.lastMaintenanceDate.split('T')[0] : "",
        currentLatitude: vehicle.currentLatitude || 0,
        currentLongitude: vehicle.currentLongitude || 0
      });
      setFormError("");
    }
  }, [isOpen, vehicle]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let parsedValue: any = value;
    
    // Convert numeric strings to numbers
    if (name === "year" || name === "capacity" || name === "currentMileage" || 
        name === "currentLatitude" || name === "currentLongitude") {
      parsedValue = parseFloat(value) || 0;
    }
    
    setFormData({
      ...formData,
      [name]: parsedValue
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    
    try {
      const vehicleData = {
        vehicleNumber: formData.licensePlate,
        make: formData.make,
        model: formData.model,
        year: formData.year,
        capacity: formData.capacity,
        status: formData.status,
        currentMileage: formData.currentMileage,
        registrationExpiryDate: formData.registrationExpiryDate,
        insuranceExpiryDate: formData.insuranceExpiryDate,
        lastMaintenanceDate: formData.lastMaintenanceDate,
        initialLatitude: formData.currentLatitude,
        initialLongitude: formData.currentLongitude
      };
      
      const updatedVehicle = await vehicleService.update(vehicle.id, vehicleData);
      onVehicleUpdated(updatedVehicle);
      onClose();
    } catch (error) {
      console.error("Failed to update vehicle:", error);
      setFormError("Failed to update vehicle. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2><FaCarAlt /> Edit Vehicle</h2>
          <button className="close-button" onClick={onClose} aria-label="Close modal">
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="make">Make *</label>
                <input
                  type="text"
                  id="make"
                  name="make"
                  value={formData.make}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Toyota"
                />
              </div>
              <div className="form-group">
                <label htmlFor="model">Model *</label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Hiace"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="year">Year *</label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                  min="1990"
                  max={new Date().getFullYear() + 1}
                />
              </div>
              <div className="form-group">
                <label htmlFor="licensePlate">License Plate *</label>
                <input
                  type="text"
                  id="licensePlate"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. ABC-1234"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="capacity">Capacity (Seats) *</label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="100"
                />
              </div>
              <div className="form-group">
                <label htmlFor="currentMileage">Current Mileage (km) *</label>
                <input
                  type="number"
                  id="currentMileage"
                  name="currentMileage"
                  value={formData.currentMileage}
                  onChange={handleInputChange}
                  required
                  min="0"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value={VehicleStatus.AVAILABLE}>Available</option>
                  <option value={VehicleStatus.IN_USE}>In Use</option>
                  <option value={VehicleStatus.MAINTENANCE}>Maintenance</option>
                  <option value={VehicleStatus.OUT_OF_SERVICE}>Out of Service</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="lastMaintenanceDate">Last Maintenance Date</label>
                <input
                  type="date"
                  id="lastMaintenanceDate"
                  name="lastMaintenanceDate"
                  value={formData.lastMaintenanceDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="registrationExpiryDate">Registration Expiry Date</label>
                <input
                  type="date"
                  id="registrationExpiryDate"
                  name="registrationExpiryDate"
                  value={formData.registrationExpiryDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="insuranceExpiryDate">Insurance Expiry Date</label>
                <input
                  type="date"
                  id="insuranceExpiryDate"
                  name="insuranceExpiryDate"
                  value={formData.insuranceExpiryDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="currentLatitude">Current Latitude</label>
                <input
                  type="number"
                  id="currentLatitude"
                  name="currentLatitude"
                  value={formData.currentLatitude}
                  onChange={handleInputChange}
                  step="0.000001"
                  placeholder="e.g. 33.5731104"
                />
                <small className="helper-text">Current location coordinates</small>
              </div>
              <div className="form-group">
                <label htmlFor="currentLongitude">Current Longitude</label>
                <input
                  type="number"
                  id="currentLongitude"
                  name="currentLongitude"
                  value={formData.currentLongitude}
                  onChange={handleInputChange}
                  step="0.000001"
                  placeholder="e.g. -7.5898434"
                />
                <small className="helper-text">Current location coordinates</small>
              </div>
            </div>
            
            {formError && <div className="form-error">{formError}</div>}
            
            <div className="modal-footer">
              <button 
                type="button" 
                className="cancel-button" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-button" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : <><FaSave /> Save Changes</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditVehicleModal; 