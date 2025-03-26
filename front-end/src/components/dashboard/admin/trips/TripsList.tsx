import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import './TripsList.css';
import './TripsListStyles.css';
import '../../../../styles/shared/Modal.css';
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
  findByDriverId(driverId: number): Promise<Trip[]>;
  getAssignedStudents(tripId: number): Promise<Student[]>;
  getUnassignedStudents(tripId: number, schoolId: number): Promise<Student[]>;
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

// Add this interface for student assignment
interface StudentAssignment {
  tripId: number;
  studentId: number;
}

// Function to format date and time
const formatDateTime = (dateTimeString: string) => {
  if (!dateTimeString) return 'N/A';
  
  try {
    const date = new Date(dateTimeString);
    return format(date, 'MMM d, yyyy h:mm a');
  } catch (error) {
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
  const [userRole, setUserRole] = useState<string>('');
  const [userId, setUserId] = useState<number | null>(null);

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

  // Load user role and ID on component mount
  useEffect(() => {
    const role = localStorage.getItem('role');
    const id = localStorage.getItem('userId');
    setUserRole(role || '');
    setUserId(id ? parseInt(id) : null);
  }, []);

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
        // Check for school ID first
        const schoolId = localStorage.getItem('schoolId');
        if (!schoolId) {
          setError('School ID not found. Please log in again.');
          setLoading(false);
          // Redirect to login after a short delay
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          return;
        }

        await Promise.all([
          fetchTrips(),
          fetchRoutes(),
          fetchDrivers(),
          fetchVehicles()
        ]);
      } catch (err) {
        console.error('Error loading data:', err);
        if (err instanceof Error && err.message.includes('School ID not found')) {
          setError('School ID not found. Please log in again.');
          // Redirect to login after a short delay
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else {
          setError('Failed to load data. Please try again later.');
        }
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
      const schoolId = getSchoolIdFromLocalStorage();
      if (!schoolId) {
        setError('School ID not found. Please log in again.');
        return;
      }

      try {
        const allRoutes = await routeService.getAllRoutes();
        const filteredRoutes = allRoutes.filter(route => route.school?.id === schoolId);
        
        if (!filteredRoutes || filteredRoutes.length === 0) {
          setRoutes([]);
        } else {
          setRoutes(filteredRoutes);
        }
      } catch (apiErr) {
        setError('Failed to fetch routes');
      }
    } catch (err) {
      setError('Error fetching routes');
    }
  };

  // Get school ID from local storage
  const getSchoolIdFromLocalStorage = (): number => {
    console.log('Getting school ID from localStorage...');
    
    // Try to get the school object first
    const schoolStr = localStorage.getItem('school');
    console.log('School object from localStorage:', schoolStr);
    if (schoolStr) {
      try {
        const school = JSON.parse(schoolStr);
        if (school && school.id) {
          console.log('Found school ID from school object:', school.id);
          return school.id;
        }
      } catch (err) {
        console.error('Error parsing school object:', err);
      }
    }
    
    // Try to get the schoolId directly
    const schoolId = localStorage.getItem('schoolId');
    console.log('Direct schoolId from localStorage:', schoolId);
    if (schoolId) {
      const parsedId = parseInt(schoolId, 10);
      if (!isNaN(parsedId)) {
        console.log('Found school ID from schoolId:', parsedId);
        return parsedId;
      }
    }
    
    // Try to get from userProfile
    const userProfileStr = localStorage.getItem('userProfile');
    console.log('UserProfile from localStorage:', userProfileStr);
    if (userProfileStr) {
      try {
        const userProfile = JSON.parse(userProfileStr);
        if (userProfile && userProfile.schoolId) {
          console.log('Found school ID from userProfile:', userProfile.schoolId);
          return userProfile.schoolId;
        }
      } catch (err) {
        console.error('Error parsing userProfile:', err);
      }
    }
    
    // Try to get from userData
    const userDataStr = localStorage.getItem('userData');
    console.log('UserData from localStorage:', userDataStr);
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        if (userData && userData.schoolId) {
          console.log('Found school ID from userData:', userData.schoolId);
          return userData.schoolId;
        }
      } catch (err) {
        console.error('Error parsing userData:', err);
      }
    }
    
    
    throw new Error('School ID not found in localStorage');
  };

  // Fetch drivers for dropdown
  const fetchDrivers = async () => {
    try {
      const schoolId = getSchoolIdFromLocalStorage();
      if (!schoolId) {
        return;
      }
      
      try {
        const allDrivers = await driverService.getAllDriversBySchoolId(schoolId);
        
        if (!allDrivers || allDrivers.length === 0) {
          setDrivers([]);
        } else {
          const processedDrivers = allDrivers.map(driver => {
            if (driver.firstName || driver.lastName) {
              return {
                ...driver,
                name: `${driver.firstName || ''} ${driver.lastName || ''}`.trim()
              };
            }
            return driver;
          });
          
          setDrivers(processedDrivers);
        }
      } catch (apiErr) {
        setError('Failed to fetch drivers');
      }
    } catch (err) {
      setError('Error fetching drivers');
    }
  };

  // Fetch vehicles for dropdown
  const fetchVehicles = async () => {
    try {
      const schoolId = getSchoolIdFromLocalStorage();
      if (!schoolId) {
        return;
      }
      
      try {
        const allVehicles = await vehicleService.findVehiclesBySchool(schoolId);
        
        if (!allVehicles || allVehicles.length === 0) {
          setVehicles([]);
        } else {
          setVehicles(allVehicles);
        }
      } catch (apiErr) {
        setError('Failed to fetch vehicles');
      }
    } catch (err) {
      setError('Error fetching vehicles');
    }
  };

  // Update the fetchAvailableStudents function
  const fetchAvailableStudents = async (tripId?: number) => {
    try {
      console.log('Starting fetchAvailableStudents...', { tripId });
      
      // Get school ID from localStorage
      const schoolId = localStorage.getItem('schoolId');
      console.log('School ID from localStorage:', schoolId);
      
      if (!schoolId) {
        console.error('School ID not found in localStorage');
        setError('School ID not found. Please log in again.');
        return;
      }

      if (tripId) {
        try {
          console.log('Fetching unassigned students for trip:', tripId, 'and school:', schoolId);
          const unassignedStudents = await tripService.getUnassignedStudents(tripId, parseInt(schoolId));
          console.log('Response from getUnassignedStudents:', unassignedStudents);
          
          // Ensure unassignedStudents is an array
          const students = Array.isArray(unassignedStudents) ? unassignedStudents : [];
          
          if (students.length === 0) {
            console.log('No unassigned students found');
            setError('All students from this school are already assigned to this trip.');
          } else {
            console.log(`Found ${students.length} unassigned students:`, 
              students.map(s => ({
                id: s.id,
                name: `${s.firstName} ${s.lastName}`,
                active: s.active
              }))
            );
          }
          
          setAvailableStudents(students);
        } catch (err) {
          console.error('Error fetching unassigned students:', err);
          setError('Failed to fetch available students. Please try again.');
        setAvailableStudents([]);
        }
      } else {
        // If no tripId, get all active students from the school
        try {
          console.log('No tripId provided, fetching all active students for school:', schoolId);
          const allStudents = await studentService.findBySchoolId(parseInt(schoolId));
          console.log('Response from findBySchoolId:', allStudents);
          
          // Ensure allStudents is an array
          const students = Array.isArray(allStudents) ? allStudents : [];
          const activeStudents = students.filter(student => student.active);
          console.log(`Found ${activeStudents.length} active students out of ${students.length} total`);
          
          setAvailableStudents(activeStudents);
        } catch (err) {
          console.error('Error fetching students:', err);
          setError('Failed to fetch students. Please try again.');
          setAvailableStudents([]);
        }
      }
    } catch (err) {
      console.error('Error in fetchAvailableStudents:', err);
      setError(err instanceof Error ? err.message : 'Error fetching available students');
      setAvailableStudents([]);
    }
  };

  // Handle starting a trip
  const handleStartTrip = async (tripId: number) => {
    try {
      await tripService.startTrip(tripId);
      await fetchTrips(); // Refresh the trips list
    } catch (err) {
      console.error('Error starting trip:', err);
      setOperationStatus({
        loading: false,
        success: false,
        error: 'Failed to start trip.'
      });
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

  // Update the openModal function
  const openModal = async (type: ModalType, trip: Trip | null = null) => {
    console.log('openModal called with:', { type, tripId: trip?.id });
    setModalType(type);
    setSelectedTrip(trip);
    
    if (type === 'assign') {
      console.log('Opening assign modal...');
      if (!trip || !trip.id) {
        console.error('Cannot assign students: No trip ID provided');
        setOperationStatus({
          loading: false,
          success: false,
          error: 'Invalid trip selected'
        });
        return;
      }
      
      console.log('Opening assign modal for trip:', trip.id);
      // Clear previous students and show loading state
      setAvailableStudents([]);
      setSelectedStudents([]);
      setOperationStatus({ loading: true, success: false, error: null });
      
      try {
        console.log('About to call fetchAvailableStudents with tripId:', trip.id);
        // Fetch available students when opening the assign modal
        await fetchAvailableStudents(trip.id);
        console.log('fetchAvailableStudents completed');
        setOperationStatus({ loading: false, success: true, error: null });
      } catch (err) {
        console.error('Error fetching students in openModal:', err);
        setOperationStatus({
          loading: false,
          success: false,
          error: 'Failed to load available students'
        });
      }
    }
    
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
    } else if (type === 'edit' && trip) {
      // Format dates for the datetime-local input
      const scheduledDep = trip.scheduledDepartureTime ? new Date(trip.scheduledDepartureTime).toISOString().slice(0, 16) : '';
      const scheduledArr = trip.scheduledArrivalTime ? new Date(trip.scheduledArrivalTime).toISOString().slice(0, 16) : '';
      
      // Ensure IDs are valid numbers - never allow null or 0
      const routeId = trip.routeId || (trip.route ? trip.route.id : 0);
      const driverId = trip.driverId || (trip.driver ? trip.driver.id : 0);
      const vehicleId = trip.vehicleId || (trip.vehicle ? trip.vehicle.id : 0);
      
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
    if (!trips || trips.length === 0) {
      return [];
    }

    return trips.filter(trip => {
      const searchLower = searchQuery.toLowerCase();
      const searchMatches = 
        trip.route?.name?.toLowerCase().includes(searchLower) || 
        trip.driver?.firstName?.toLowerCase().includes(searchLower) ||
        trip.driver?.lastName?.toLowerCase().includes(searchLower) ||
        trip.vehicle?.make?.toLowerCase().includes(searchLower) ||
        trip.vehicle?.model?.toLowerCase().includes(searchLower) ||
        trip.vehicle?.licensePlate?.toLowerCase().includes(searchLower) ||
        true;
      
      const statusMatches = !filterStatus || trip.status === filterStatus;
      const routeMatches = !filterRoute || trip.route?.id === filterRoute;
      
      return searchMatches && statusMatches && routeMatches;
    });
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
      console.log('Starting student assignment process...');
      console.log('Selected students:', selectedStudents);
      console.log('Trip ID:', tripId);
      
      if (!selectedStudents || selectedStudents.length === 0) {
        console.log('No students selected');
        setOperationStatus({
          loading: false,
          success: false,
          error: 'Please select at least one student to assign'
        });
        return;
      }

      setOperationStatus({
        loading: true,
        success: false,
        error: null
      });

      console.log('Calling tripService.assignStudents with:', {
        tripId,
        selectedStudents
      });

      // Call the service to assign students
      await tripService.assignStudents(tripId, selectedStudents);
      console.log('Successfully assigned students');

      setOperationStatus({
        loading: false,
        success: true,
        error: null,
        message: 'Students successfully assigned to trip'
      });

      // Refresh the trips and available students
      await fetchTrips();
      await fetchAvailableStudents(tripId);
      
      // Close modal after a short delay
      setTimeout(() => {
        closeModal();
        setSelectedStudents([]);
      }, 1500);
    } catch (err) {
      console.error('Error assigning students:', err);
      setOperationStatus({
        loading: false,
        success: false,
        error: err instanceof Error ? err.message : 'Failed to assign students'
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
            {operationStatus.loading ? (
              <div className="loading-indicator">Loading available students...</div>
            ) : (
              <div className="form-group">
                <label>Available Students</label>
                <div className="student-selection">
                  {availableStudents.length === 0 ? (
                    <div className="no-students-message">
                      <p>No students available for assignment</p>
                      <small>This could be because:</small>
                      <ul>
                        <li>All students are already assigned to this trip</li>
                        <li>No students are registered in the system</li>
                        <li>Students are not properly assigned to the school</li>
                      </ul>
                    </div>
                  ) : (
                    <>
                      <div className="selection-header">
                        <span>{availableStudents.length} students available</span>
                        <span>{selectedStudents.length} students selected</span>
                      </div>
                      <div className="students-list">
                        {availableStudents.map(student => (
                          <div key={student.id} className="student-checkbox">
                            <input
                              type="checkbox"
                              id={`student-${student.id}`}
                              checked={selectedStudents.includes(student.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  console.log('Adding student to selection:', student.id);
                                  setSelectedStudents([...selectedStudents, student.id]);
                                } else {
                                  console.log('Removing student from selection:', student.id);
                                  setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                                }
                              }}
                            />
                            <label htmlFor={`student-${student.id}`}>
                              {student.firstName} {student.lastName}
                              {student.studentId && <span className="student-id">({student.studentId})</span>}
                            </label>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {operationStatus.error && (
              <div className="error-message">{operationStatus.error}</div>
            )}
            
            {operationStatus.success && (
              <div className="success-message">{operationStatus.message}</div>
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
                onClick={() => selectedTrip && handleAssignStudents(selectedTrip.id)}
                disabled={operationStatus.loading || selectedStudents.length === 0}
              >
                {operationStatus.loading ? 'Assigning...' : `Assign ${selectedStudents.length} Student${selectedStudents.length !== 1 ? 's' : ''}`}
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
              {selectedTrip.status === TripStatus.SCHEDULED && (
                <button 
                  type="button" 
                  className="start-btn"
                  onClick={() => selectedTrip && handleStartTrip(selectedTrip.id)}
                >
                  Start Trip
                </button>
              )}
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
      const schoolId = getSchoolIdFromLocalStorage();
      
      if (!schoolId) {
        setError('School ID not found. Please log in again.');
        return;
      }

      let allTrips: Trip[] = [];
      
      if (userRole === 'DRIVER' && userId) {
        allTrips = await tripService.findByDriverId(userId);
      } else {
        allTrips = await tripService.getAllTrips();
      }
      
      if (!allTrips || allTrips.length === 0) {
        setTrips([]);
      } else {
        let filteredTrips = allTrips;
        if (userRole !== 'DRIVER') {
          filteredTrips = allTrips.filter(trip => {
            const tripSchoolId = trip.driver?.school?.id || trip.route?.school?.id;
            return tripSchoolId === schoolId;
          });
        }
        
        setTrips(filteredTrips);
      }
    } catch (err) {
      setError('Failed to load trips. Please try again later.');
    }
  };

  return (
    <div className="trips-container">
      <div className="list-header">
        <h2>Trips Management</h2>
        <div className="header-actions">
          {userRole !== 'DRIVER' && (
            <button className="add-button" onClick={() => openModal('add')}>
              Add Trip
            </button>
          )}
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
          {userRole !== 'DRIVER' && (
            <button className="add-button" onClick={() => openModal('add')}>
              Schedule a New Trip
            </button>
          )}
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
                    <span>
                      {trip.status}
                    </span>
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
                            console.log('Assign Students button clicked for trip:', trip);
                            openModal('assign', trip);
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