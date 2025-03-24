import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import './TripsList.css';
import './TripsListStyles.css';
import { useTripService, useRouteService, useDriverService, useVehicleService, useStudentService } from '../../../../contexts/ServiceContext';
import { TripStatus } from '../../../../core/entities/trip.entity';
import { Route } from '../../../../core/entities/route.entity';
import { Driver } from '../../../../core/entities/driver.entity';
import { Vehicle } from '../../../../core/entities/vehicle.entity';
import { Student } from '../../../../core/entities/student.entity';
import { QRCodeSVG } from 'qrcode.react';
import { Attendance } from '../../../../core/entities/trip.entity';

// Update the ModalType to include all possible values
type ModalType = 'add' | 'edit' | 'view' | 'delete' | 'cancel' | 'assign';

interface TripFormData {
  id?: number;
  scheduledDepartureTime: string;
  scheduledArrivalTime: string;
  notes: string;
  routeId: number;
  driverId: number;
  vehicleId: number;
}

// Define trip request interface for better type safety
interface TripRequestData {
  driverId: number;
  routeId: number;
  vehicleId: number;
  scheduledDepartureTime: string;
  scheduledArrivalTime: string;
  notes: string;
  status: string;
}

// Update the OperationStatus interface
interface OperationStatus {
  loading: boolean;
  success: boolean;
  error: string | null;
  message?: string;
}

// Update the TripService interface
interface TripService {
  getAllTrips(): Promise<Trip[]>;
  createTrip(trip: TripRequestData): Promise<Trip>;
  updateTrip(id: number, trip: TripRequestData): Promise<Trip>;
  deleteTrip(id: number): Promise<void>;
  updateTripStatus(id: number, status: TripStatus): Promise<Trip>;
  cancelTrip(id: number, reason: string): Promise<Trip>;
  assignStudents(tripId: number, studentIds: number[]): Promise<Trip>;
  getTripRequestSchema(): Promise<any>;
}

// Update the Trip interface to include students
interface Trip {
  id: number;
  routeId: number;
  driverId: number;
  vehicleId: number;
  scheduledDepartureTime: string;
  scheduledArrivalTime: string;
  status: TripStatus;
  notes?: string;
  route?: Route;
  driver?: Driver;
  vehicle?: Vehicle;
  students?: Student[];
  actualDepartureTime?: string;
  actualArrivalTime?: string;
  cancellationReason?: string;
  attendances?: Attendance[];
}

// Function to format date and time
const formatDateTime = (dateTimeString: string) => {
  if (!dateTimeString) return 'N/A';
  
  try {
    const date = new Date(dateTimeString);
    return format(date, 'MMM d, yyyy h:mm a');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateTimeString;
  }
};

// Function to format status
const formatStatus = (status: string) => {
  if (!status) return '';
  
  // Convert from SNAKE_CASE to Title Case
  return status
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Add this type guard function at the top of the file
const isViewMode = (type: ModalType): type is 'view' => type === 'view';

const TripsList: React.FC = () => {
  // State
  const [trips, setTrips] = useState<Trip[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('add');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterRoute, setFilterRoute] = useState<number>(0);
  const [formData, setFormData] = useState<TripFormData>({
    scheduledDepartureTime: '',
    scheduledArrivalTime: '',
    notes: '',
    routeId: 0,
    driverId: 0,
    vehicleId: 0
  });
  const [operationStatus, setOperationStatus] = useState<OperationStatus>({
    loading: false,
    success: false,
    error: null
  });
  const [cancelReason, setCancelReason] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);

  // Services
  const tripService = useTripService();
  const routeService = useRouteService();
  const driverService = useDriverService();
  const vehicleService = useVehicleService();
  const studentService = useStudentService();

  // Alias for consistency with other code
  const setShowModal = setIsModalOpen;
  const showModal = isModalOpen;
  
  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      scheduledDepartureTime: '',
      scheduledArrivalTime: '',
      notes: '',
      routeId: 0,
      driverId: 0,
      vehicleId: 0
    });
    
    setOperationStatus({
      loading: false,
      success: false,
      error: null
    });
  };

  // Load data on component mount
  useEffect(() => {
    const checkAndLoad = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in to access this page.');
        setLoading(false);
        return;
      }

      try {
        await Promise.all([
          fetchTrips(),
          fetchRoutes(),
          fetchDrivers(),
          fetchVehicles(),
          fetchAvailableStudents()
        ]);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    checkAndLoad();
  }, []);

  // Fetch TripRequest schema if available
  const fetchTripRequestSchema = async () => {
    try {
      const schema = await tripService.getTripRequestSchema();
      console.log('TripRequest schema:', schema);
      return schema;
    } catch (err) {
      console.error('Error fetching TripRequest schema:', err);
      return null;
    }
  };

  // Fetch routes for dropdown
  const fetchRoutes = async () => {
    try {
      console.log('Fetching routes');
      const schoolId = getSchoolIdFromLocalStorage();
      if (!schoolId) {
        console.error('No school ID found');
        setError('School ID not found. Please log in again.');
        return;
      }

      try {
        const allRoutes = await routeService.getAllRoutes();
        console.log('Fetched routes:', allRoutes);
        
        // Filter routes by school ID
        const filteredRoutes = allRoutes.filter(route => route.school?.id === schoolId);
        console.log('Filtered routes for school:', filteredRoutes);
        
        if (!filteredRoutes || filteredRoutes.length === 0) {
          console.log('No routes found for school');
        } else {
          setRoutes(filteredRoutes);
        }
      } catch (apiErr) {
        console.error('API error fetching routes:', apiErr);
      }
    } catch (err) {
      console.error('Error in fetchRoutes:', err);
    }
  };

  // Get school ID from local storage
  const getSchoolIdFromLocalStorage = (): number => {
    const school = JSON.parse(localStorage.getItem('school') || '{}');
    const schoolId = school.id;
    return schoolId;
  };

  // Fetch drivers for dropdown
  const fetchDrivers = async () => {
    try {
      const schoolId = getSchoolIdFromLocalStorage();
      if (!schoolId) {
        console.warn('Skipping driver fetch - no valid school ID');
        return;
      }
      
      console.log('Fetching drivers for school ID:', schoolId);
      try {
        const allDrivers = await driverService.getAllDriversBySchoolId(schoolId);
        console.log('Fetched drivers:', allDrivers);
        
        // If API returned empty array, use mock data
        if (!allDrivers || allDrivers.length === 0) {
          console.log('No drivers returned from API');
        } else {
          // Make sure each driver has a name property or construct one from firstName/lastName
          const processedDrivers = allDrivers.map(driver => {
            if (driver.firstName || driver.lastName) {
              return {
                ...driver,
                name: `${driver.firstName || ''} ${driver.lastName || ''}`.trim()
              };
            }
            return driver;
          });
          
          console.log('Processed drivers with names:', processedDrivers);
          setDrivers(processedDrivers);
        }
      } catch (apiErr) {
        console.error('API error fetching drivers:', apiErr);
      }
    } catch (err) {
      console.error('Error in fetchDrivers:', err);
    }
  };

  // Fetch vehicles for dropdown
  const fetchVehicles = async () => {
    try {
      const schoolId = getSchoolIdFromLocalStorage();
      if (!schoolId) {
        console.warn('Skipping vehicle fetch - no valid school ID');
        return;
      }
      
      console.log('Fetching vehicles for school ID:', schoolId);
      try {
        const allVehicles = await vehicleService.findVehiclesBySchool(schoolId);
        console.log('Fetched vehicles:', allVehicles);
        
        if (!allVehicles || allVehicles.length === 0) {
          console.log('No vehicles returned from API, using mock data');
        } else {
          setVehicles(allVehicles);
        }
      } catch (apiErr) {
        console.error('API error fetching vehicles:', apiErr);
      }
    } catch (err) {
      console.error('Error in fetchVehicles:', err);
    }
  };

  // Fetch available students
  const fetchAvailableStudents = async () => {
    try {
      const schoolId = getSchoolIdFromLocalStorage();
      if (!schoolId) {
        console.error('No school ID found');
        setError('School ID not found. Please log in again.');
        return;
      }
      
      const allStudents = await studentService.getAllStudents();
      console.log('Fetched students:', allStudents);
      
      // Filter students by school ID
      const filteredStudents = allStudents.filter(student => student.school?.id === schoolId);
      console.log('Filtered students for school:', filteredStudents);
      
      setAvailableStudents(filteredStudents);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Open modal
  const openModal = (type: ModalType, trip: Trip | null = null) => {
    setModalType(type);
    setSelectedTrip(trip);
    
    // Calculate a future time (1 hour from now) for scheduled departure
    const futureTime = new Date();
    futureTime.setHours(futureTime.getHours() + 1);
    // Round to nearest half hour
    futureTime.setMinutes(Math.round(futureTime.getMinutes() / 30) * 30);
    
    // Calculate arrival time 2 hours after departure
    const arrivalTime = new Date(futureTime);
    arrivalTime.setHours(arrivalTime.getHours() + 2);
    
    if (type === 'add') {
      // Set default route, driver, and vehicle if available
      let defaultRouteId = routes.length > 0 ? routes[0].id : null;
      let defaultDriverId = drivers.length > 0 ? drivers[0].id : null;
      let defaultVehicleId = vehicles.length > 0 ? vehicles[0].id : null;
      
      // Validate we have at least one of each required field
      if (!defaultRouteId || !defaultDriverId || !defaultVehicleId) {
        console.warn('Missing default selections:', {
          routes: routes.length,
          drivers: drivers.length,
          vehicles: vehicles.length
        });
        
        // If we're missing data, refresh the data
        if (routes.length === 0) fetchRoutes();
        if (drivers.length === 0) fetchDrivers();
        if (vehicles.length === 0) fetchVehicles();
        
      }
      
      // Final check - if we still don't have valid IDs, show an error but provide a reasonable default
      if (!defaultRouteId || defaultRouteId <= 0) defaultRouteId = 1;
      if (!defaultDriverId || defaultDriverId <= 0) defaultDriverId = 1;
      if (!defaultVehicleId || defaultVehicleId <= 0) defaultVehicleId = 1;
      
      // Log available options for debugging
      console.log('Available routes:', routes.length, 'Available drivers:', drivers.length, 'Available vehicles:', vehicles.length);
      console.log('Default selections - Route:', defaultRouteId, 'Driver:', defaultDriverId, 'Vehicle:', defaultVehicleId);
      
      // Create new form data with default selections - ensuring none are null
      setFormData({
        id: 0,
        routeId: defaultRouteId,
        driverId: defaultDriverId,
        vehicleId: defaultVehicleId,
        scheduledDepartureTime: futureTime.toISOString().slice(0, 16),
        scheduledArrivalTime: arrivalTime.toISOString().slice(0, 16),
        notes: ''
      });
    } else if (trip) {
      // Format dates for the datetime-local input
      const scheduledDep = trip.scheduledDepartureTime ? new Date(trip.scheduledDepartureTime).toISOString().slice(0, 16) : '';
      const scheduledArr = trip.scheduledArrivalTime ? new Date(trip.scheduledArrivalTime).toISOString().slice(0, 16) : '';
      
      // Ensure IDs are valid numbers - never allow null or 0
      const routeId = trip.id || (trip.route ? trip.route.id : 0);
      const driverId = trip.id || (trip.driver ? trip.driver.id : 0);
      const vehicleId = trip.id || (trip.vehicle ? trip.vehicle.id : 0);
      
      // If any ID is missing, use the first available option
      const finalRouteId = routeId > 0 ? routeId : (routes.length > 0 ? routes[0].id : 1);
      const finalDriverId = driverId > 0 ? driverId : (drivers.length > 0 ? drivers[0].id : 1);
      const finalVehicleId = vehicleId > 0 ? vehicleId : (vehicles.length > 0 ? vehicles[0].id : 1);
      
      // Edit existing trip data
      setFormData({
        ...trip,
        routeId: finalRouteId,
        driverId: finalDriverId,
        vehicleId: finalVehicleId,
        scheduledDepartureTime: scheduledDep,
        scheduledArrivalTime: scheduledArr,
        notes: trip.notes || ''
      });
    }
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTrip(null);
    setCancelReason('');
    resetForm(); // Reset form when closing modal
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started - Form data:', formData);
    
    // Strict validation for required fields
    if (!formData.routeId || formData.routeId <= 0) {
      console.log('Validation failed: Missing routeId');
      setOperationStatus({
        loading: false,
        success: false,
        error: 'Route selection is required by the database. Please select a route.'
      });
      return;
    }
    
    if (!formData.driverId || formData.driverId <= 0) {
      console.log('Validation failed: Missing driverId');
      setOperationStatus({
        loading: false,
        success: false,
        error: 'Driver selection is required by the database. Please select a driver.'
      });
      return;
    }
    
    if (!formData.vehicleId || formData.vehicleId <= 0) {
      console.log('Validation failed: Missing vehicleId');
      setOperationStatus({
        loading: false,
        success: false,
        error: 'Vehicle selection is required by the database. Please select a vehicle.'
      });
      return;
    }
    
    // Validate dates
    if (!formData.scheduledDepartureTime) {
      console.log('Validation failed: Missing scheduledDepartureTime');
      setOperationStatus({
        loading: false,
        success: false,
        error: 'Scheduled departure time is required.'
      });
      return;
    }
    
    if (!formData.scheduledArrivalTime) {
      console.log('Validation failed: Missing scheduledArrivalTime');
      setOperationStatus({
        loading: false,
        success: false,
        error: 'Scheduled arrival time is required.'
      });
      return;
    }
    
    setOperationStatus({
      loading: true,
      success: false,
      error: null
    });
    
    try {
      if (modalType === 'add') {
        try {
          // Create a complete trip request object with non-null values
          const tripData = {
            // Standard camelCase (JSON convention)
            routeId: Number(formData.routeId),  // Ensure it's a number
            driverId: Number(formData.driverId),
            vehicleId: Number(formData.vehicleId),
            
            // Also include snake_case (may match DB column name)
            route_id: Number(formData.routeId),
            driver_id: Number(formData.driverId),
            vehicle_id: Number(formData.vehicleId),
            
            // Also include nested objects (may match entity structure)
            route: { id: Number(formData.routeId) },
            driver: { id: Number(formData.driverId) },
            vehicle: { id: Number(formData.vehicleId) },
            
            // Include original data
            scheduledDepartureTime: formData.scheduledDepartureTime,
            scheduledArrivalTime: formData.scheduledArrivalTime,
            notes: formData.notes || '',
            status: "SCHEDULED"
          };
          
          // Log the trip data being sent
          console.log('Trip data being sent:', JSON.stringify(tripData, null, 2));
          
          const newTrip = await tripService.createTrip(tripData);
          console.log('Trip created successfully:', newTrip);
          setOperationStatus({
            loading: false,
            success: true,
            error: null,
            message: 'Trip created successfully'
          });
          setTimeout(() => {
            closeModal();
            fetchTrips();
          }, 2000);
        } catch (error) {
          console.error('Trip creation error:', error);
          setOperationStatus({
            loading: false,
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create trip',
            message: 'Failed to create trip'
          });
        }
      } else if (modalType === 'edit' && selectedTrip) {
        // Update trip schedule
        await tripService.updateTripSchedule(
          selectedTrip.id,
          formData.scheduledDepartureTime,
          formData.scheduledArrivalTime
        );
        
        // Reassign driver and vehicle if changed
        if (formData.driverId !== selectedTrip.driver?.id) {
          await tripService.assignDriver(selectedTrip.id, formData.driverId);
        }
        
        if (formData.vehicleId !== selectedTrip.vehicle?.id) {
          await tripService.assignVehicle(selectedTrip.id, formData.vehicleId);
        }
        
        setOperationStatus({
          loading: false,
          success: true,
          error: null
        });
        
        // Refresh trips
        await fetchTrips();
        
        // Close modal after a delay
        setTimeout(() => {
          closeModal();
        }, 1500);
      }
    } catch (err) {
      console.error('Error submitting trip form:', err);
      setOperationStatus({
        loading: false,
        success: false,
        error: 'Failed to save trip. Please try again.'
      });
    }
  };

  // Handle trip status updates
  const handleStatusUpdate = async (tripId: number, status: TripStatus) => {
    try {
      await tripService.updateTripStatus(tripId, status);
      await fetchTrips();
    } catch (err) {
      console.error(`Error updating trip status to ${status}:`, err);
      setError(`Failed to update trip status to ${status}.`);
    }
  };

  // Handle trip cancellation
  const handleCancelTrip = async (tripId: number, reason: string) => {
    if (!reason.trim()) {
      setOperationStatus({
        loading: false,
        success: false,
        error: 'Cancellation reason is required'
      });
      return;
    }
    
    try {
      await tripService.cancelTrip(tripId, reason);
      await fetchTrips();
      closeModal();
    } catch (err) {
      console.error('Error canceling trip:', err);
      setOperationStatus({
        loading: false,
        success: false,
        error: 'Failed to cancel trip.'
      });
    }
  };

  // Handle trip deletion
  const handleDeleteTrip = async (tripId: number) => {
    try {
      await tripService.deleteTrip(tripId);
      await fetchTrips();
      closeModal();
    } catch (err) {
      console.error('Error deleting trip:', err);
      setOperationStatus({
        loading: false,
        success: false,
        error: 'Failed to delete trip.'
      });
    }
  };

  // Filter trips based on search query and filters
  const getFilteredTrips = () => {
    console.log('Starting getFilteredTrips with:', {
      totalTrips: trips.length,
      searchQuery,
      filterStatus,
      filterRoute,
      trips: JSON.stringify(trips, null, 2)
    });

    if (!trips || trips.length === 0) {
      console.log('No trips to filter');
      return [];
    }

    const filteredTrips = trips.filter(trip => {
      // Log each trip being filtered
      console.log('Filtering trip:', {
        id: trip.id,
        route: trip.route?.name,
        driver: trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}` : 'No driver',
        status: trip.status,
        schoolId: trip.driver?.school?.id
      });

      // Filter by search query
      const searchLower = searchQuery.toLowerCase();
      const searchMatches = 
        trip.route?.name?.toLowerCase().includes(searchLower) || 
        trip.driver?.firstName?.toLowerCase().includes(searchLower) ||
        trip.driver?.lastName?.toLowerCase().includes(searchLower) ||
        trip.vehicle?.make?.toLowerCase().includes(searchLower) ||
        trip.vehicle?.model?.toLowerCase().includes(searchLower) ||
        trip.vehicle?.licensePlate?.toLowerCase().includes(searchLower) ||
        true;
      
      // Filter by status
      const statusMatches = !filterStatus || trip.status === filterStatus;
      
      // Filter by route
      const routeMatches = !filterRoute || trip.route?.id === filterRoute;
      
      const matches = searchMatches && statusMatches && routeMatches;
      
      if (matches) {
        console.log('Trip matches all filters:', {
          id: trip.id,
          route: trip.route?.name,
          driver: `${trip.driver?.firstName} ${trip.driver?.lastName}`,
          status: trip.status
        });
      }
      
      return matches;
    });

    console.log('Filtered trips result:', {
      totalFiltered: filteredTrips.length,
      trips: JSON.stringify(filteredTrips, null, 2)
    });

    return filteredTrips;
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (e) {
      return dateString;
    }
  };

  // Update the handleAssignStudents function
  const handleAssignStudents = async (tripId: number) => {
    try {
      console.log('Starting student assignment for trip:', tripId);
      console.log('Selected students:', selectedStudents);
      
      if (!selectedStudents || selectedStudents.length === 0) {
        setOperationStatus({
          loading: false,
          success: false,
          error: 'Please select at least one student to assign',
          message: 'No students selected'
        });
        return;
      }

      setOperationStatus({
        loading: true,
        success: false,
        error: null,
        message: 'Assigning students...'
      });

      const response = await tripService.assignStudents(tripId, selectedStudents);
      console.log('Student assignment response:', response);
      
      setOperationStatus({
        loading: false,
        success: true,
        error: null,
        message: `Successfully assigned ${selectedStudents.length} students`
      });

      // Refresh trips to show updated student assignments
      await fetchTrips();
      
      // Close modal after a short delay
      setTimeout(() => {
        closeModal();
        setSelectedStudents([]); // Reset selected students
      }, 1500);
    } catch (err) {
      console.error('Error assigning students:', err);
      setOperationStatus({
        loading: false,
        success: false,
        error: err instanceof Error ? err.message : 'Failed to assign students',
        message: 'Assignment failed'
      });
    }
  };

  // Render modal content based on type
  const renderModalContent = () => {
    switch (modalType) {
      case 'assign':
        return (
          <div className="modal-content">
            <h2>Assign Students to Trip</h2>
            <div className="form-group">
              <label>Select Students</label>
              <div className="student-selection">
                {availableStudents.length === 0 ? (
                  <p className="no-students">No students available for assignment</p>
                ) : (
                  availableStudents.map(student => (
                    <div key={student.id} className="student-checkbox">
                      <input
                        type="checkbox"
                        id={`student-${student.id}`}
                        checked={selectedStudents.includes(student.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents([...selectedStudents, student.id]);
                          } else {
                            setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                          }
                        }}
                      />
                      <label htmlFor={`student-${student.id}`}>
                        {student.firstName} {student.lastName}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {operationStatus.error && (
              <div className="error-message">{operationStatus.error}</div>
            )}
            
            {operationStatus.message && (
              <div className={`message ${operationStatus.success ? 'success' : 'error'}`}>
                {operationStatus.message}
              </div>
            )}
            
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={closeModal}
                disabled={operationStatus.loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleAssignStudents(selectedTrip?.id || 0)}
                disabled={operationStatus.loading || selectedStudents.length === 0}
              >
                {operationStatus.loading ? 'Assigning...' : 'Assign Students'}
              </button>
            </div>
          </div>
        );
      case 'add':
      case 'edit':
        return (
          <div className="modal-content">
            <h2>{modalType === 'add' ? 'Schedule New Trip' : 'Update Trip'}</h2>
            <div className="modal-form">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="routeId" className="required-field">Route:</label>
                  <select
                    id="routeId"
                    name="routeId"
                    value={formData.routeId || ''}
                    onChange={handleInputChange}
                    required
                    className={formData.routeId ? '' : 'invalid-input'}
                    disabled={isViewMode(modalType)}
                  >
                    <option value="">-- Select Route --</option>
                    {routes.map(route => (
                      <option key={route.id} value={route.id}>
                        {route.name}
                      </option>
                    ))}
                  </select>
                  {!formData.routeId && <div className="field-error">Route is required</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="driverId" className="required-field">Driver:</label>
                  <select
                    id="driverId"
                    name="driverId"
                    value={formData.driverId || ''}
                    onChange={handleInputChange}
                    required
                    className={formData.driverId ? '' : 'invalid-input'}
                    disabled={isViewMode(modalType)}
                  >
                    <option value="">-- Select Driver --</option>
                    {drivers.map(driver => (
                      <option key={driver.id} value={driver.id}>
                        {`${driver.firstName || ''} ${driver.lastName || ''}`.trim() || `Driver #${driver.id}`}
                      </option>
                    ))}
                  </select>
                  {!formData.driverId && <div className="field-error">Driver is required</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="vehicleId" className="required-field">Vehicle:</label>
                  <select
                    id="vehicleId"
                    name="vehicleId"
                    value={formData.vehicleId || ''}
                    onChange={handleInputChange}
                    required
                    className={formData.vehicleId ? '' : 'invalid-input'}
                    disabled={isViewMode(modalType)}
                  >
                    <option value="">-- Select Vehicle --</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.licensePlate} - {vehicle.model}
                      </option>
                    ))}
                  </select>
                  {!formData.vehicleId && <div className="field-error">Vehicle is required</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="scheduledDepartureTime" className="required-field">Scheduled Departure:</label>
                  <input
                    type="datetime-local"
                    id="scheduledDepartureTime"
                    name="scheduledDepartureTime"
                    value={formData.scheduledDepartureTime || ''}
                    onChange={handleInputChange}
                    required
                    className={formData.scheduledDepartureTime ? '' : 'invalid-input'}
                    disabled={isViewMode(modalType)}
                  />
                  {!formData.scheduledDepartureTime && <div className="field-error">Departure time is required</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="scheduledArrivalTime" className="required-field">Scheduled Arrival:</label>
                  <input
                    type="datetime-local"
                    id="scheduledArrivalTime"
                    name="scheduledArrivalTime"
                    value={formData.scheduledArrivalTime || ''}
                    onChange={handleInputChange}
                    required
                    className={formData.scheduledArrivalTime ? '' : 'invalid-input'}
                    disabled={isViewMode(modalType)}
                  />
                  {!formData.scheduledArrivalTime && <div className="field-error">Arrival time is required</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="notes">Notes:</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleInputChange}
                    disabled={isViewMode(modalType)}
                  />
                </div>
                
                {operationStatus.error && <div className="error-message">{operationStatus.error}</div>}
                
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                    {isViewMode(modalType) ? 'Close' : 'Cancel'}
                  </button>
                  {!isViewMode(modalType) && (
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={operationStatus.loading || !formData.routeId || !formData.driverId || !formData.vehicleId}
                    >
                      {operationStatus.loading ? 'Saving...' : 'Save'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        );
        
      case 'view':
        if (!selectedTrip) return null;
        return (
          <div className="modal-content view-trip">
            <h2>Trip Details</h2>
            <div className="trip-details">
              <div className="detail-group">
                <h3>General Information</h3>
                <p><strong>Status:</strong> <span className={`status-badge ${selectedTrip.status.toLowerCase()}`}>{selectedTrip.status}</span></p>
                <p><strong>Scheduled Departure:</strong> {formatDate(selectedTrip.scheduledDepartureTime)}</p>
                <p><strong>Scheduled Arrival:</strong> {formatDate(selectedTrip.scheduledArrivalTime)}</p>
                {selectedTrip.actualDepartureTime && (
                  <p><strong>Actual Departure:</strong> {formatDate(selectedTrip.actualDepartureTime)}</p>
                )}
                {selectedTrip.actualArrivalTime && (
                  <p><strong>Actual Arrival:</strong> {formatDate(selectedTrip.actualArrivalTime)}</p>
                )}
                <p><strong>Notes:</strong> {selectedTrip.notes || 'No notes'}</p>
                {selectedTrip.cancellationReason && (
                  <p><strong>Cancellation Reason:</strong> {selectedTrip.cancellationReason}</p>
                )}
              </div>
              
              <div className="detail-group">
                <h3>Route Information</h3>
                <p><strong>Route:</strong> {selectedTrip.route?.name || 'No route assigned'}</p>
                <p><strong>Type:</strong> {selectedTrip.route?.type || 'N/A'}</p>
                <p><strong>Description:</strong> {selectedTrip.route?.description || 'No description'}</p>
              </div>
              
              <div className="detail-group">
                <h3>Assignment</h3>
                <p>
                  <strong>Driver:</strong> {selectedTrip.driver ? 
                    `${selectedTrip.driver.firstName} ${selectedTrip.driver.lastName}` : 
                    'No driver assigned'}
                </p>
                <p>
                  <strong>Vehicle:</strong> {selectedTrip.vehicle ? 
                    `${selectedTrip.vehicle.make} ${selectedTrip.vehicle.model} (${selectedTrip.vehicle.licensePlate})` : 
                    'No vehicle assigned'}
                </p>
              </div>
            </div>
            
            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={closeModal}>
                Close
              </button>
              <button 
                type="button" 
                className="edit-btn"
                onClick={() => openModal('edit', selectedTrip)}
              >
                Edit Trip
              </button>
            </div>
          </div>
        );
        
      case 'delete':
        return (
          <div className="modal-content">
            <h2>Delete Trip</h2>
            <p>Are you sure you want to delete this trip? This action cannot be undone.</p>
            
            {operationStatus.error && (
              <div className="error-message">{operationStatus.error}</div>
            )}
            
            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={closeModal}>
                Cancel
              </button>
              <button 
                type="button" 
                className="delete-btn"
                onClick={() => selectedTrip && handleDeleteTrip(selectedTrip.id)}
                disabled={operationStatus.loading}
              >
                {operationStatus.loading ? 'Deleting...' : 'Delete Trip'}
              </button>
            </div>
          </div>
        );
        
      case 'cancel':
        return (
          <div className="modal-content">
            <h2>Cancel Trip</h2>
            <p>Please provide a reason for cancelling this trip:</p>
            
            <div className="form-group">
              <label htmlFor="cancelReason">Cancellation Reason</label>
              <textarea 
                id="cancelReason" 
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                required
              />
            </div>
            
            {operationStatus.error && (
              <div className="error-message">{operationStatus.error}</div>
            )}
            
            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={closeModal}>
                Back
              </button>
              <button 
                type="button" 
                className="submit-btn"
                onClick={() => selectedTrip && handleCancelTrip(selectedTrip.id, cancelReason)}
                disabled={operationStatus.loading || !cancelReason.trim()}
              >
                {operationStatus.loading ? 'Cancelling...' : 'Cancel Trip'}
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Add fetchTrips function
  const fetchTrips = async () => {
    try {
      console.log('Starting to fetch trips...');
      const schoolId = getSchoolIdFromLocalStorage();
      console.log('School ID from localStorage:', schoolId);
      
      if (!schoolId) {
        console.error('No school ID available');
        setError('School ID not found. Please log in again.');
        return;
      }

      const allTrips = await tripService.getAllTrips();
      console.log('Raw trips from API:', JSON.stringify(allTrips, null, 2));
      
      if (!allTrips || allTrips.length === 0) {
        console.log('No trips returned from API');
        setTrips([]);
      } else {
        // Filter trips by school ID
        const filteredTrips = allTrips.filter(trip => {
          const tripSchoolId = trip.driver?.school?.id || trip.route?.school?.id;
          return tripSchoolId === schoolId;
        });
        
        console.log('Filtered trips for school:', filteredTrips.length);
        setTrips(filteredTrips);
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError('Failed to load trips. Please try again later.');
    }
  };

  // Add styles for student selection
  const styles = `
    .student-selection {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 1rem;
      margin-top: 0.5rem;
    }

    .student-checkbox {
      display: flex;
      align-items: center;
      padding: 0.5rem;
      border-bottom: 1px solid #eee;
    }

    .student-checkbox:last-child {
      border-bottom: none;
    }

    .student-checkbox input[type="checkbox"] {
      margin-right: 0.5rem;
    }

    .student-checkbox label {
      cursor: pointer;
    }

    .trip-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 1rem;
      margin-bottom: 1rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .trip-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .trip-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .trip-title {
      font-size: 1.2rem;
      font-weight: 600;
      color: #2c3e50;
    }

    .trip-status {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .trip-status.scheduled {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .trip-status.in-progress {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .trip-status.completed {
      background-color: #f5f5f5;
      color: #616161;
    }

    .trip-status.cancelled {
      background-color: #ffebee;
      color: #c62828;
    }

    .trip-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .trip-detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .trip-detail-item i {
      color: #666;
    }

    .trip-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .btn {
      padding: 0.5rem 1rem;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .btn-primary {
      background-color: #1976d2;
      color: white;
    }

    .btn-primary:hover {
      background-color: #1565c0;
    }

    .btn-secondary {
      background-color: #f5f5f5;
      color: #333;
    }

    .btn-secondary:hover {
      background-color: #e0e0e0;
    }

    .btn-danger {
      background-color: #d32f2f;
      color: white;
    }

    .btn-danger:hover {
      background-color: #c62828;
    }

    .modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #1976d2;
      box-shadow: 0 0 0 2px rgba(25,118,210,0.2);
    }

    .field-error {
      color: #d32f2f;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .invalid-input {
      border-color: #d32f2f !important;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }

    .assigned-student {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem;
      border-bottom: 1px solid #eee;
    }

    .assigned-student:last-child {
      border-bottom: none;
    }

    .seat-number {
      background-color: #e6f7ff;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    .qr-code {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }

    .qr-label {
      font-size: 0.75rem;
      color: #666;
    }
  `;

  // Add the styles to the document
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  return (
    <div className="trips-container">
      <div className="list-header">
        <h2>Trips Management</h2>
        <div className="header-actions">
          <button className="add-button" onClick={() => openModal('add')}>
            Add Trip
          </button>
        </div>
      </div>
      
      <div className="search-filter-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search trips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filters">
          <div className="filter">
            <label htmlFor="statusFilter">Status:</label>
            <select
              id="statusFilter"
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              title="Filter by status"
            >
              <option value="">All Statuses</option>
              <option value={TripStatus.SCHEDULED}>Scheduled</option>
              <option value={TripStatus.IN_PROGRESS}>In Progress</option>
              <option value={TripStatus.COMPLETED}>Completed</option>
              <option value={TripStatus.CANCELLED}>Cancelled</option>
            </select>
          </div>
          
          <div className="filter">
            <label htmlFor="routeFilter">Route:</label>
            <select
              id="routeFilter"
              className="filter-select"
              value={filterRoute}
              onChange={(e) => setFilterRoute(parseInt(e.target.value, 10))}
              title="Filter by route"
            >
              <option value="0">All Routes</option>
              {routes.map(route => (
                <option key={route.id} value={route.id}>{route.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-indicator">Loading trips...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : trips.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🚌</div>
          <h3>No trips found</h3>
          <p>No trips match your current filters or there are no trips scheduled yet.</p>
          <button className="add-button" onClick={() => openModal('add')}>
            Schedule a New Trip
          </button>
        </div>
      ) : getFilteredTrips().length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No matching trips</h3>
          <p>No trips match your current filters. Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="trips-table">
            <thead>
              <tr>
                <th>Route</th>
                <th>Departure</th>
                <th>Arrival</th>
                <th>Driver</th>
                <th>Vehicle</th>
                <th>Status</th>
                <th>Students</th>
                <th className="actions-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredTrips().map(trip => (
                <tr key={trip.id} className={trip.status.toLowerCase()}>
                  <td>{trip.route?.name || 'N/A'}</td>
                  <td>{formatDate(trip.scheduledDepartureTime)}</td>
                  <td>{formatDate(trip.scheduledArrivalTime)}</td>
                  <td>{trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}` : 'Unassigned'}</td>
                  <td>{trip.vehicle ? `${trip.vehicle.make} ${trip.vehicle.model}` : 'Unassigned'}</td>
                  <td>
                    <span className={`status-badge ${trip.status.toLowerCase()}`}>
                      {trip.status}
                    </span>
                  </td>
                  <td>
                    <div>
                      {trip.attendances?.map(attendance => (
                        attendance && attendance.student ? (
                          <div key={attendance.id} className="assigned-student">
                            <span>{attendance.student.firstName} {attendance.student.lastName}</span>
                            <span className="seat-number">
                              {attendance.seatNumber ? `Seat ${attendance.seatNumber}` : 'Seat Unassigned'}
                            </span>
                            <div className="qr-code">
                              <QRCodeSVG 
                                value={attendance.qrCode || `trip:${trip.id},student:${attendance.student.id}`} 
                                size={64} 
                              />
                              <span className="qr-label">Scan for attendance</span>
                            </div>
                          </div>
                        ) : null
                      ))}
                    </div>
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="action-btn view" 
                      title="View Trip Details"
                      onClick={() => openModal('view', trip)}
                    >
                      View
                    </button>
                    
                    {trip.status === TripStatus.SCHEDULED && (
                      <>
                        <button 
                          className="action-btn edit" 
                          title="Edit Trip"
                          onClick={() => openModal('edit', trip)}
                        >
                          Edit
                        </button>
                        
                        <button 
                          className="action-btn assign" 
                          title="Assign Students"
                          onClick={() => {
                            setSelectedTrip(trip);
                            setModalType('assign');
                            setIsModalOpen(true);
                          }}
                        >
                          Assign Students
                        </button>
                        
                        <button 
                          className="action-btn cancel" 
                          title="Cancel Trip"
                          onClick={() => {
                            setSelectedTrip(trip);
                            setModalType('cancel');
                            setIsModalOpen(true);
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    
                    {(trip.status === TripStatus.COMPLETED || trip.status === TripStatus.CANCELLED) && (
                      <button 
                        className="action-btn delete" 
                        title="Delete Trip"
                        onClick={() => openModal('delete', trip)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      
      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-close" onClick={closeModal}>×</button>
            {renderModalContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default TripsList; 