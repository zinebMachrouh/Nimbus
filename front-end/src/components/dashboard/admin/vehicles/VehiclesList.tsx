import { useContext, useEffect, useState } from "react";
import { MyContext } from "../../Dashboard";
import { Vehicle } from "../../../../core/entities/vehicle.entity";
import { useVehicleService } from "../../../../contexts/ServiceContext";
import "./VehiclesList.css";
import { FaEye, FaEdit, FaTrash, FaPlus, FaSort, FaSortUp, FaSortDown, FaSearch, FaCarAlt, FaExclamationTriangle, FaTimes } from "react-icons/fa";
import AddVehicleModal from "./AddVehicleModal";
import ViewVehicleModal from "./ViewVehicleModal";
import EditVehicleModal from "./EditVehicleModal";

type SortField = 'make' | 'year' | 'capacity' | 'currentMileage' | 'status';
type SortDirection = 'asc' | 'desc';

const VehiclesList = () => {
    const { vehicles: contextVehicles } = useContext(MyContext);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortField, setSortField] = useState<SortField>('make');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [deleteError, setDeleteError] = useState("");
    const vehicleService = useVehicleService();
    
    useEffect(() => {
        if (contextVehicles && contextVehicles.length > 0) {
            setVehicles(contextVehicles);
            setLoading(false);
        } else {
            loadVehicles();
        }
    }, [contextVehicles]);

    const loadVehicles = () => {
        const storedSchool = localStorage.getItem("school");
        let schoolId = 0;
        
        if (storedSchool) {
            try {
                schoolId = JSON.parse(storedSchool)?.id || 0;
            } catch (error) {
                console.error("Error parsing school from localStorage:", error);
            }
        }
        
        if (schoolId) {
            vehicleService.findVehiclesBySchool(schoolId)
                .then(data => {
                    setVehicles(data);
                })
                .catch(error => {
                    console.error("Failed to fetch vehicles:", error);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    };

    const handleVehicleAdded = (newVehicle: Vehicle) => {
        setVehicles(prevVehicles => [...prevVehicles, newVehicle]);
    };

    const handleVehicleUpdated = (updatedVehicle: Vehicle) => {
        setVehicles(prevVehicles => 
            prevVehicles.map(vehicle => 
                vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle
            )
        );
    };

    const handleViewVehicle = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setIsViewModalOpen(true);
    };

    const handleEditVehicle = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        
        // Check if vehicle is in use
        if (vehicle.status === 'MAINTENANCE' || vehicle.status === 'IN_USE') {
            setDeleteError(`Cannot delete vehicle that is currently ${vehicle.status.toLowerCase()}.`);
            setIsDeleteConfirmOpen(true);
            return;
        }
        
        setDeleteError("");
        setIsDeleteConfirmOpen(true);
    };

    const confirmDeleteVehicle = () => {
        if (!selectedVehicle || deleteError) {
            setIsDeleteConfirmOpen(false);
            return;
        }
        
        vehicleService.deleteVehicle(selectedVehicle.id)
            .then(() => {
                setVehicles(prevVehicles => 
                    prevVehicles.filter(v => v.id !== selectedVehicle.id)
                );
                setIsDeleteConfirmOpen(false);
            })
            .catch(error => {
                console.error("Failed to delete vehicle:", error);
                setDeleteError("Failed to delete vehicle. Please try again.");
            });
    };

    useEffect(() => {
        let result = [...vehicles];
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(vehicle => 
                `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(query) ||
                vehicle.licensePlate.toLowerCase().includes(query) ||
                vehicle.status.toLowerCase().includes(query)
            );
        }
        
        result.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortField) {
                case 'make':
                    aValue = `${a.make} ${a.model}`.toLowerCase();
                    bValue = `${b.make} ${b.model}`.toLowerCase();
                    break;
                case 'year':
                    aValue = a.year;
                    bValue = b.year;
                    break;
                case 'capacity':
                    aValue = a.capacity;
                    bValue = b.capacity;
                    break;
                case 'currentMileage':
                    aValue = a.currentMileage;
                    bValue = b.currentMileage;
                    break;
                case 'status':
                    aValue = a.status.toLowerCase();
                    bValue = b.status.toLowerCase();
                    break;
                default:
                    aValue = `${a.make} ${a.model}`.toLowerCase();
                    bValue = `${b.make} ${b.model}`.toLowerCase();
            }
            
            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
        
        setFilteredVehicles(result);
    }, [vehicles, searchQuery, sortField, sortDirection]);

    const handleSort = (field: SortField) => {
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) {
            return <FaSort className="sort-icon" />;
        }
        return sortDirection === 'asc' ? 
            <FaSortUp className="sort-icon active" /> : 
            <FaSortDown className="sort-icon active" />;
    };

    if (loading) {
        return <div className="vehicles-list-loading">
            <div className="loading-spinner"></div>
            Loading vehicles...
        </div>;
    }

    return ( 
        <div className="vehicles-list-container">
            <div className="search-container">
                <div className="search-input-wrapper">
                    <FaSearch className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search vehicles..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                    <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                        <div className="vehicles-count">
                            <FaCarAlt /> <span>{filteredVehicles.length} vehicles found</span>
                        </div>
                    </div>
                    <button className="add-vehicle-btn" onClick={() => setIsAddModalOpen(true)}>
                        <FaPlus className="btn-icon" />
                        <span>Add Vehicle</span>
                    </button>
                </div>
            </div>
            
            {vehicles.length === 0 ? (
                <div className="no-vehicles">
                    <p>No vehicles found. Add a vehicle to get started.</p>
                </div>
            ) : filteredVehicles.length === 0 ? (
                <div className="no-vehicles">
                    <p>No vehicles match your search criteria.</p>
                </div>
            ) : (
                <div className="vehicles-table-container">
                    <table className="vehicles-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('make')} className="sortable-header">
                                    <div className="header-content">
                                        <span>Make & Model</span>
                                        {getSortIcon('make')}
                                    </div>
                                </th>
                                <th>License Plate</th>
                                <th onClick={() => handleSort('year')} className="sortable-header">
                                    <div className="header-content">
                                        <span>Year</span>
                                        {getSortIcon('year')}
                                    </div>
                                </th>
                                <th onClick={() => handleSort('capacity')} className="sortable-header">
                                    <div className="header-content">
                                        <span>Capacity</span>
                                        {getSortIcon('capacity')}
                                    </div>
                                </th>
                                <th onClick={() => handleSort('currentMileage')} className="sortable-header">
                                    <div className="header-content">
                                        <span>Current Mileage</span>
                                        {getSortIcon('currentMileage')}
                                    </div>
                                </th>
                                <th onClick={() => handleSort('status')} className="sortable-header">
                                    <div className="header-content">
                                        <span>Status</span>
                                        {getSortIcon('status')}
                                    </div>
                                </th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVehicles.map((vehicle, index) => (
                                <tr key={vehicle.id} className="vehicle-row" style={{ animationDelay: `${index * 0.05}s` }}>
                                    <td>
                                        <div className="vehicle-name">
                                            {vehicle.make} {vehicle.model}
                                        </div>
                                    </td>
                                    <td>{vehicle.licensePlate}</td>
                                    <td>{vehicle.year}</td>
                                    <td>{vehicle.capacity} seats</td>
                                    <td>{vehicle.currentMileage} km</td>
                                    <td>
                                        <span className={`status-badge ${vehicle.status.toLowerCase()}`}>
                                            {vehicle.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="table-action-buttons">
                                            <button 
                                                className="action-btn view" 
                                                title="View Details"
                                                onClick={() => handleViewVehicle(vehicle)}
                                            >
                                                <FaEye />
                                            </button>
                                            <button 
                                                className="action-btn edit" 
                                                title="Edit Vehicle"
                                                onClick={() => handleEditVehicle(vehicle)}
                                            >
                                                <FaEdit />
                                            </button>
                                            <button 
                                                className="action-btn delete" 
                                                title="Delete Vehicle"
                                                onClick={() => handleDeleteClick(vehicle)}
                                                disabled={vehicle.status === 'MAINTENANCE' || vehicle.status === 'IN_USE'}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modals */}
            <AddVehicleModal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onVehicleAdded={handleVehicleAdded}
            />
            
            {selectedVehicle && (
                <>
                    <ViewVehicleModal
                        isOpen={isViewModalOpen}
                        onClose={() => setIsViewModalOpen(false)}
                        vehicle={selectedVehicle}
                    />
                    
                    <EditVehicleModal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        vehicle={selectedVehicle}
                        onVehicleUpdated={handleVehicleUpdated}
                    />
                </>
            )}
            
            {/* Delete Confirmation Modal */}
            {isDeleteConfirmOpen && (
                <div className="modal-overlay">
                    <div className="modal-container delete-confirm-modal">
                        <div className="modal-header delete-modal-header">
                            <h2>
                                {deleteError ? 
                                    <><FaExclamationTriangle className="error-icon" /> Cannot Delete Vehicle</> : 
                                    <><FaTrash className="delete-icon" /> Confirm Delete</>}
                            </h2>
                            <button className="close-button" onClick={() => setIsDeleteConfirmOpen(false)} aria-label="Close modal">
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            {deleteError ? (
                                <div className="delete-error">
                                    <FaExclamationTriangle className="delete-error-icon" />
                                    <div className="delete-error-message">
                                        <h3>Operation Not Allowed</h3>
                                        <p>{deleteError}</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="delete-warning">
                                        <FaExclamationTriangle className="warning-icon" />
                                        <p>You are about to delete this vehicle permanently. This action cannot be undone.</p>
                                    </div>
                                    
                                    <div className="delete-vehicle-details">
                                        <div className="vehicle-preview">
                                            <div className="vehicle-preview-header">
                                                <h3>{selectedVehicle?.make} {selectedVehicle?.model}</h3>
                                                <div className={`status-badge ${selectedVehicle?.status.toLowerCase()}`}>
                                                    {selectedVehicle?.status}
                                                </div>
                                            </div>
                                            <div className="vehicle-preview-info">
                                                <div className="preview-item">
                                                    <span className="preview-label">License Plate</span>
                                                    <span className="preview-value">{selectedVehicle?.licensePlate}</span>
                                                </div>
                                                <div className="preview-item">
                                                    <span className="preview-label">Year</span>
                                                    <span className="preview-value">{selectedVehicle?.year}</span>
                                                </div>
                                                <div className="preview-item">
                                                    <span className="preview-label">Capacity</span>
                                                    <span className="preview-value">{selectedVehicle?.capacity} seats</span>
                                                </div>
                                                <div className="preview-item">
                                                    <span className="preview-label">Current Mileage</span>
                                                    <span className="preview-value">{selectedVehicle?.currentMileage} km</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="delete-consequences">
                                            <h4>What happens when you delete this vehicle?</h4>
                                            <ul>
                                                <li>The vehicle will be removed from the system permanently</li>
                                                <li>All historical data related to this vehicle will be lost</li>
                                                <li>Any schedules or routes involving this vehicle may be affected</li>
                                            </ul>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="modal-footer delete-modal-footer">
                            <button 
                                className="cancel-button" 
                                onClick={() => setIsDeleteConfirmOpen(false)}
                            >
                                {deleteError ? "Close" : "Cancel"}
                            </button>
                            {!deleteError && (
                                <button 
                                    className="delete-button" 
                                    onClick={confirmDeleteVehicle}
                                >
                                    <FaTrash /> Delete Vehicle
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
     );
}
 
export default VehiclesList;