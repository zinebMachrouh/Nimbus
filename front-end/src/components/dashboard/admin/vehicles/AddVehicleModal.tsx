import { useState, useEffect } from "react";
import { FaTimes, FaCarAlt, FaCheck } from "react-icons/fa";
import "./AddVehicleModal.css";
import { Vehicle } from "../../../../core/entities/vehicle.entity";
import { useVehicleService } from "../../../../contexts/ServiceContext";

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVehicleAdded: (vehicle: Vehicle) => void;
}

const AddVehicleModal = ({ isOpen, onClose, onVehicleAdded }: AddVehicleModalProps) => {
  const vehicleService = useVehicleService();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    licensePlate: "",
    vin: "",
    capacity: 0,
    currentMileage: 0,
    nextMaintenanceDate: "",
    fuelType: "GASOLINE",
    registrationExpiryDate: "",
    currentLatitude: 33.5731104,
    currentLongitude: -7.5898434
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        make: "",
        model: "",
        year: new Date().getFullYear(),
        licensePlate: "",
        vin: "",
        capacity: 0,
        currentMileage: 0,
        nextMaintenanceDate: "",
        fuelType: "GASOLINE",
        registrationExpiryDate: "",
        currentLatitude: 33.5731104,
        currentLongitude: -7.5898434
      });
      setFormError("");
    }
  }, [isOpen]);

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
      // Get school ID from local storage
      const storedSchool = localStorage.getItem("school");
      let schoolId = 0;
      
      if (storedSchool) {
        try {
          schoolId = JSON.parse(storedSchool)?.id || 0;
        } catch (error) {
          console.error("Error parsing school from localStorage:", error);
          setFormError("Error retrieving school information");
          setIsSubmitting(false);
          return;
        }
      }
      
      if (!schoolId) {
        setFormError("No school selected");
        setIsSubmitting(false);
        return;
      }
      
      // Add vehicle with school ID
      const vehicleData = {
        ...formData,
        schoolId,
        status: "AVAILABLE" // Default status set here instead of in form
      };
      
      const newVehicle = await vehicleService.addVehicle(vehicleData);
      onVehicleAdded(newVehicle);
      onClose();
    } catch (error) {
      console.error("Failed to add vehicle:", error);
      setFormError("Failed to add vehicle. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2><FaCarAlt /> Add New Vehicle</h2>
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
                <label htmlFor="vin">VIN</label>
                <input
                  type="text"
                  id="vin"
                  name="vin"
                  value={formData.vin}
                  onChange={handleInputChange}
                  placeholder="Vehicle Identification Number"
                />
              </div>
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
            </div>
            
            <div className="form-row">
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
              <div className="form-group">
                <label htmlFor="fuelType">Fuel Type</label>
                <select
                  id="fuelType"
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleInputChange}
                >
                  <option value="GASOLINE">Gasoline</option>
                  <option value="DIESEL">Diesel</option>
                  <option value="ELECTRIC">Electric</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="CNG">CNG</option>
                </select>
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
                  placeholder="Default: Casablanca coordinates"
                />
                <small className="helper-text">Pre-set to Casablanca, Morocco</small>
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
                  placeholder="Default: Casablanca coordinates"
                />
                <small className="helper-text">Pre-set to Casablanca, Morocco</small>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nextMaintenanceDate">Next Maintenance Date</label>
                <input
                  type="date"
                  id="nextMaintenanceDate"
                  name="nextMaintenanceDate"
                  value={formData.nextMaintenanceDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="form-group">
                <label htmlFor="registrationExpiryDate">Registration Expiry Date</label>
                <input
                  type="date"
                  id="registrationExpiryDate"
                  name="registrationExpiryDate"
                  value={formData.registrationExpiryDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                />
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
                {isSubmitting ? "Saving..." : <><FaCheck /> Add Vehicle</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddVehicleModal; 