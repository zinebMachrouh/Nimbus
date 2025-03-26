import React, { useState, useEffect } from 'react';
import './RoutesList.css';
import { useRouteService, useSchoolService } from '../../../../contexts/ServiceContext';
import { Route, RouteType } from '../../../../core/entities/route.entity';
import { School } from '../../../../core/entities/school.entity';

interface RouteStop {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  estimatedMinutesFromStart: number;
  order?: number;
  sequence?: number;
}

interface NewStopForm {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  estimatedMinutesFromStart: number;
  sequence: number;
}

interface OperationStatus {
  loading: boolean;
  success: boolean;
  error: string | null;
}

interface FormData {
  id?: number;
  name: string;
  description: string;
  type: RouteType;
  schoolId: number;
  stops: RouteStop[];
}

// Add a proper type for the renderModalContent function parameter
type ModalType = 'add' | 'edit' | 'view' | 'delete' | 'add-stop';

const RoutesList: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('add');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    type: RouteType.MORNING_PICKUP,
    schoolId: 0,
    stops: [{
      name: '',
      address: '',
      latitude: 0,
      longitude: 0,
      estimatedMinutesFromStart: 0
    }]
  });
  const [operationStatus, setOperationStatus] = useState<OperationStatus>({
    loading: false,
    success: false,
    error: null
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterSchool, setFilterSchool] = useState<number>(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Add missing state declarations
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Add a state for the new stop form
  const [newStopForm, setNewStopForm] = useState<NewStopForm>({
    name: '',
    address: '',
    latitude: 0,
    longitude: 0,
    estimatedMinutesFromStart: 0,
    sequence: 1
  });
  
  // Services
  const routeService = useRouteService();
  const schoolService = useSchoolService();

  useEffect(() => {
    const checkAndLoad = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setError('Authentication required. Please log in to access this page.');
        setLoading(false);
      } else {
        setIsAuthenticated(true);
        await fetchRoutes();
        await fetchSchools();
      }
    };
    
    checkAndLoad();
  }, []);

  useEffect(() => {
    if (schools.length > 0) {
      console.log('Schools loaded successfully:', schools);
      // If there are no schools, we can't create routes due to the foreign key constraint
      if (schools.length === 0) {
        setError('No schools found. You need to create a school before you can create routes.');
      }
    }
  }, [schools]);

  // Check if user is authenticated
  const checkAuthentication = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      setError('Authentication required. Please log in to access this page.');
      setLoading(false);
      return false;
    } else {
      setIsAuthenticated(true);
      return true;
    }
  };

  // Fetch all routes
  const fetchRoutes = async () => {
    if (!checkAuthentication()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get school ID from localStorage
      const schoolId = getSchoolIdFromLocalStorage();
      console.log('Fetching routes for school ID:', schoolId);
      
      if (!schoolId) {
        throw new Error('School ID not found. Please log in again.');
      }

      // Get routes for the specific school
      const schoolRoutes = await routeService.findBySchoolId(schoolId);
      console.log('API Response - Routes for school:', schoolRoutes);
      
      if (!schoolRoutes || schoolRoutes.length === 0) {
        console.log('No routes found for school:', schoolId);
        setRoutes([]);
        return;
      }
      
      // Then load detailed information for each route with stops
      const detailedRoutes = await Promise.all(
        schoolRoutes.map(async (route) => {
          try {
            console.log(`Fetching details for route ${route.id}`);
            const detailedRoute = await routeService.findByIdWithStops(route.id);
            console.log(`Route ${route.id} details:`, detailedRoute);
            return detailedRoute;
          } catch (err) {
            console.warn(`Could not load details for route ${route.id}:`, err);
            return {
              ...route,
              stops: []
            };
          }
        })
      );
      
      // Filter out any undefined or null routes
      const validRoutes = detailedRoutes.filter(route => route !== undefined && route !== null);
      console.log('Final valid routes:', validRoutes);
      
      setRoutes(validRoutes);
    } catch (err: unknown) {
      console.error('Error fetching routes:', err);
      setError('Error fetching routes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all schools
  const fetchSchools = async () => {
    if (!checkAuthentication()) return;
    
    try {
      const data = await schoolService.getAllSchools();
      setSchools(data);
    } catch (err: any) {
      console.error('Error fetching schools:', err);
    }
  };

  // Enhance the getSchoolIdFromLocalStorage function with a hardcoded fallback
  const getSchoolIdFromLocalStorage = (): number => {
    try {
      console.log('=== Debugging getSchoolIdFromLocalStorage ===');
      
      // First try: Get the school object directly from localStorage
      const schoolStr = localStorage.getItem('school');
      console.log('school from localStorage:', schoolStr);
      if (schoolStr) {
        const school = JSON.parse(schoolStr);
        console.log('Parsed school:', school);
        if (school && school.id && parseInt(school.id) > 0) {
          const schoolId = parseInt(school.id);
          console.log('Found valid school ID from school object:', schoolId);
          return schoolId;
        }
      }
      
      // If no school object found, try other methods...
      const userProfileStr = localStorage.getItem('userProfile');
      console.log('userProfile from localStorage:', userProfileStr);
      if (userProfileStr) {
        const userProfile = JSON.parse(userProfileStr);
        console.log('Parsed userProfile:', userProfile);
        if (userProfile && userProfile.schoolId && parseInt(userProfile.schoolId) > 0) {
          const schoolId = parseInt(userProfile.schoolId);
          console.log('Found valid school ID in userProfile:', schoolId);
          return schoolId;
        }
      }
      
      // Rest of the fallback methods...
      const userDataStr = localStorage.getItem('userData');
      console.log('userData from localStorage:', userDataStr);
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        console.log('Parsed userData:', userData);
        if (userData && userData.school && userData.school.id && parseInt(userData.school.id) > 0) {
          const schoolId = parseInt(userData.school.id);
          console.log('Found valid school ID in userData:', schoolId);
          return schoolId;
        }
      }
      
      const schoolCacheStr = localStorage.getItem('schoolCache');
      console.log('schoolCache from localStorage:', schoolCacheStr);
      if (schoolCacheStr) {
        const schoolCache = JSON.parse(schoolCacheStr);
        console.log('Parsed schoolCache:', schoolCache);
        if (schoolCache && schoolCache.id && parseInt(schoolCache.id) > 0) {
          const schoolId = parseInt(schoolCache.id);
          console.log('Found valid school ID in schoolCache:', schoolId);
          return schoolId;
        }
      }
      
      const tokenStr = localStorage.getItem('token');
      console.log('token from localStorage:', tokenStr);
      if (tokenStr) {
        try {
          const base64Url = tokenStr.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const decoded = JSON.parse(jsonPayload);
          console.log('Decoded token claims:', decoded);
          if (decoded && decoded.schoolId && parseInt(decoded.schoolId) > 0) {
            const schoolId = parseInt(decoded.schoolId);
            console.log('Found valid school ID in token claims:', schoolId);
            return schoolId;
          }
        } catch (e) {
          console.warn('Failed to extract schoolId from token:', e);
        }
      }
      
      console.log('Available schools:', schools);
      if (schools.length > 0) {
        console.log('Using first school in list as fallback:', schools[0].id);
        return schools[0].id;
      }
      
      console.warn('Using hardcoded school ID fallback: 1');
      return 1;
    } catch (err) {
      console.error('Error getting school ID from localStorage:', err);
      return 1;
    }
  };

  // Handle input changes for the main form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric fields
    if (name === 'schoolId') {
      const numericValue = value === '' ? 0 : parseInt(value, 10);
      setFormData({
        ...formData,
        [name]: numericValue
      });
    } else {
      // Handle string fields
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle input changes for stops in the main form
  const handleStopInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const [field, indexStr, property] = name.split('.');
    const index = parseInt(indexStr, 10);
    
    const updatedStops = [...formData.stops];
    
    // Handle numeric fields
    if (property === 'latitude' || property === 'longitude' || property === 'estimatedMinutesFromStart' || property === 'sequence') {
      const numericValue = value === '' ? 0 : parseFloat(value);
      updatedStops[index] = {
        ...updatedStops[index],
        [property]: numericValue
      };
    } else {
      // Handle string fields
      updatedStops[index] = {
        ...updatedStops[index],
        [property]: value
      };
    }
    
    setFormData({
      ...formData,
      stops: updatedStops
    });
  };

  // Modify the openModal function to set the schoolId from localStorage
  const openModal = (type: 'add' | 'edit' | 'view' | 'delete' | 'add-stop', route: Route | null = null) => {
    setModalType(type);
    setSelectedRoute(route);
    
    if (type === 'add') {
      // Get a valid school ID - first try localStorage, then first school, then default to 1
      const schoolId = getSchoolIdFromLocalStorage();
      const validSchoolId = schoolId > 0 ? schoolId : 
        (schools.length > 0 ? schools[0].id : 1);
      
      console.log('Opening add modal with school ID:', validSchoolId);
      
      // Initialize form for adding a new route
      setFormData({
        name: '',
        description: '',
        type: RouteType.MORNING_PICKUP,
        schoolId: validSchoolId, // Use the validated school ID
        stops: [{
          name: '',
          address: '',
          latitude: 0,
          longitude: 0,
          estimatedMinutesFromStart: 0,
          sequence: 1
        }]
      });
    } else if (type === 'edit' && route) {
      // Initialize form for editing an existing route
      setFormData({
        name: route.name || '',
        description: route.description || '',
        type: route.type as RouteType || RouteType.MORNING_PICKUP,
        schoolId: route.school?.id || getSchoolIdFromLocalStorage(),
        stops: (route.stops || []).map(stop => {
          // Ensure all stops have required fields
          return {
            name: stop.name || '',
            address: stop.address || stop.name || '',
            latitude: stop.latitude !== null ? stop.latitude : 0,
            longitude: stop.longitude !== null ? stop.longitude : 0,
            estimatedMinutesFromStart: stop.estimatedMinutesFromStart ?? 0,
            sequence: (stop as any).sequence || 0
          };
        })
      });
    }
    
    // Reset any error or success messages
    setErrorMessage('');
    setSuccessMessage('');
    
    // Open the modal
    setIsModalOpen(true);
    setModalVisible(true);
  };

  // Close modal
  const closeModal = () => {
    setModalVisible(false);
    setIsModalOpen(false);
    
    // Reset messages
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // Ensure schoolId is set and valid
      let schoolId: number = formData.schoolId;
      
      // If schoolId is missing or invalid, try to get it from localStorage
      if (!schoolId || schoolId <= 0 || isNaN(schoolId)) {
        schoolId = getSchoolIdFromLocalStorage();
        
        // Log the school ID we found
        console.log('Using school ID from localStorage/fallback:', schoolId);
        
        // Update the form data with the found school ID
        setFormData(prev => ({
          ...prev,
          schoolId: schoolId
        }));
      }
      
      // Final check before any operation
      if (!schoolId || schoolId <= 0 || isNaN(schoolId)) {
        console.error('Invalid school ID after all attempts:', schoolId);
        throw new Error("No valid school ID available. Please check your profile settings or create a school first.");
      }

      console.log('Using validated school ID:', schoolId, 'Type:', typeof schoolId);

      // Handle different modal types
      if (modalType === 'add') {
        // Validate that there's at least one stop
        if (!formData.stops || formData.stops.length === 0) {
          throw new Error("At least one stop is required for a route");
        }

        // Validate and prepare each stop
        const preparedStops = formData.stops.map((stop, index) => {
          if (!stop.name || stop.name.trim() === '') {
            throw new Error(`Stop #${index + 1} must have a name`);
          }
          
          // Ensure required fields have values
          return {
            name: stop.name,
            address: stop.address || stop.name, // Default to name if no address is provided
            latitude: stop.latitude || 0,
            longitude: stop.longitude || 0,
            estimatedMinutesFromStart: 
              stop.estimatedMinutesFromStart !== undefined ? stop.estimatedMinutesFromStart : index * 5, // Default to 5-minute intervals
            sequence: index + 1 // Ensure sequence is 1-based and in proper order
          };
        });

        const routeData = {
          name: formData.name,
          description: formData.description || '',
          type: formData.type,
          schoolId: schoolId, // Ensure we're using the validated schoolId as a number
          stops: preparedStops
        };
        
        console.log('Creating route with data:', routeData);
        console.log('School ID being used:', schoolId, 'Type:', typeof schoolId);
        console.log('Stops with sequences:', preparedStops.map(s => `${s.name} (seq: ${s.sequence}, mins: ${s.estimatedMinutesFromStart})`));
        
        // Try creating the route with explicit schoolId
        const result = await routeService.createRouteWithSchool(routeData);
        console.log('Route created successfully:', result);
        setSuccessMessage("Route created successfully");
      } 
      else if (modalType === 'edit' && selectedRoute) {
        // Include required fields (schoolId and stops) that are required by the backend validation
        const routeData = {
          name: formData.name,
          description: formData.description || '',
          type: formData.type,
          schoolId: formData.schoolId || getSchoolIdFromLocalStorage(),
          stops: selectedRoute.stops || []
        };
        
        console.log('Updating route with data:', routeData);
        
        // Update the route
        await routeService.updateRoute(selectedRoute.id, routeData);
        
        // If school has changed, update the assignment
        if (formData.schoolId !== selectedRoute.school?.id) {
          if (formData.schoolId) {
            await routeService.assignToSchool(selectedRoute.id, formData.schoolId);
          } else {
            await routeService.removeFromSchool(selectedRoute.id);
          }
        }
        
        setSuccessMessage("Route updated successfully");
      } 
      else if (modalType === 'delete' && selectedRoute) {
        try {
          // First check if route is associated with any trips
          const tripAssociations = await routeService.checkRouteTrips(selectedRoute.id);
          
          if (tripAssociations && tripAssociations.tripCount > 0) {
            console.log(`Route ${selectedRoute.id} has ${tripAssociations.tripCount} trips, cannot be deleted`);
            throw new Error(`Cannot delete route: it is associated with ${tripAssociations.tripCount} trip(s).`);
          }
          
          // No trips, proceed with deletion
          console.log('Deleting route:', selectedRoute.id);
          await routeService.deleteRoute(selectedRoute.id);
          
          // Remove the route from state immediately
          setRoutes(prevRoutes => prevRoutes.filter(r => r.id !== selectedRoute.id));
          
          setSuccessMessage("Route deleted successfully");
          
          // Close the modal after successful operation
          setIsModalOpen(false);
          setModalVisible(false);
        } catch (err) {
          console.error('Error in delete operation:', err);
          setErrorMessage(`Operation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
          // Don't close modal on error
          return;
        }
      }
      
      // Common operations for all types
      resetForm();
      if (modalType !== 'delete') {
        // Only fetch routes again for non-delete operations
        // For delete, we already updated the state
        await fetchRoutes();
      }
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: unknown) {
      console.error(`Error ${modalType === 'add' ? 'creating' : modalType === 'edit' ? 'updating' : 'deleting'} route:`, error);
      setErrorMessage(error instanceof Error ? error.message : `Failed to ${modalType === 'add' ? 'create' : modalType === 'edit' ? 'update' : 'delete'} route`);
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Modify the resetForm function to set schoolId from localStorage
  const resetForm = () => {
    const schoolId = getSchoolIdFromLocalStorage();
    
    console.log('Resetting form with school ID:', schoolId);
    
    // Ensure we have a valid school ID - use the first school from the list if available
    const defaultSchoolId = schoolId > 0 ? schoolId : 
      (schools.length > 0 ? schools[0].id : 1);
      
    setFormData({
      name: '',
      description: '',
      type: RouteType.MORNING_PICKUP,
      schoolId: defaultSchoolId, // Use the validated school ID
      stops: [{
        name: 'Initial Stop',
        address: 'Default Address',
        latitude: 0,
        longitude: 0,
        estimatedMinutesFromStart: 0,
        sequence: 1 // Ensure sequence is set
      }]
    });
    setSelectedRoute(null);
  };

  const getSchoolId = () => {
    const schoolFromStorage = JSON.parse(localStorage.getItem('school') || '{}');
    return schoolFromStorage.id;
  };

  // Filter routes
  const getFilteredRoutes = () => {
    const currentSchoolId = getSchoolIdFromLocalStorage();
    console.log('Current school ID:', currentSchoolId);
    console.log('Total routes before filtering:', routes.length);
    console.log('Search query:', searchQuery);
    console.log('Filter type:', filterType);
    
    const filtered = routes.filter(route => {
      const nameMatch = route.name.toLowerCase().includes(searchQuery.toLowerCase());
      const typeMatch = !filterType || route.type === filterType;
      const schoolMatch = route.school && route.school.id === currentSchoolId;
      
      console.log(`Route ${route.id}:`, {
        name: route.name,
        schoolId: route.school?.id,
        nameMatch,
        typeMatch,
        schoolMatch
      });
      
      return nameMatch && typeMatch && schoolMatch;
    });
    
    console.log('Routes after filtering:', filtered.length);
    return filtered;
  };

  const filteredRoutes = getFilteredRoutes();

  // Add a function to handle adding stops to an existing route
  const handleAddStopToExistingRoute = async (routeId: number, stop: RouteStop) => {
    try {
      setIsLoading(true);
      
      // Format the stop data
      const stopData = {
        name: stop.name,
        latitude: stop.latitude || 0,
        longitude: stop.longitude || 0,
        sequence: stop.sequence || (formData.stops?.length ?? 0) + 1 // Set sequence if not provided
      };
      
      console.log('Adding stop to route:', routeId, stopData);
      
      // Use the addStop API method
      await routeService.addStop(routeId, stopData);
      
      // Refresh route data
      await fetchRoutes();
      
      setSuccessMessage("Stop added successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
      
      // Close modal
      setIsModalOpen(false);
    } catch (error: unknown) {
      console.error("Error adding stop:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to add stop");
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Update openAddStopModal to handle the estimatedMinutesFromStart property correctly
  const openAddStopModal = (route: Route) => {
    setSelectedRoute(route);
    setModalType('add-stop');
    
    // Initialize the new stop form with default values
    const nextSequence = route.stops ? route.stops.length + 1 : 1;
    
    // Get the last stop's estimated minutes, using type assertion to ensure TypeScript knows the property exists
    const lastStopMinutes = route.stops && route.stops.length > 0 
      ? (route.stops[route.stops.length - 1] as unknown as { estimatedMinutesFromStart?: number })?.estimatedMinutesFromStart || 0
      : 0;
    
    setNewStopForm({
      name: '',
      address: '',
      latitude: 0,
      longitude: 0,
      estimatedMinutesFromStart: lastStopMinutes + 5,
      sequence: nextSequence
    });
    
    // Reset any error or success messages
    setErrorMessage('');
    setSuccessMessage('');
    
    // Open the modal
    setIsModalOpen(true);
    setModalVisible(true);
  };

  // Handle input changes for new stop form
  const handleNewStopInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric fields
    if (name === 'latitude' || name === 'longitude' || name === 'estimatedMinutesFromStart' || name === 'sequence') {
      const numericValue = value === '' ? 0 : parseFloat(value);
      setNewStopForm(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      // Handle string fields
      setNewStopForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Create a handler for submitting a new stop to an existing route
  const handleAddStopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      if (!selectedRoute) {
        throw new Error("No route selected");
      }
      
      // Validate the stop
      if (!newStopForm.name || newStopForm.name.trim() === '') {
        throw new Error("Stop name is required");
      }
      
      // Format the stop data according to the StopRequest Java class
      // The backend StopRequest requires: name, latitude, longitude, sequence
      const stopData = {
        name: newStopForm.name,
        latitude: newStopForm.latitude || 0,
        longitude: newStopForm.longitude || 0,
        sequence: newStopForm.sequence || 1
      };
      
      console.log('Adding stop to route:', selectedRoute.id, stopData);
      
      // Use the addStop API method
      await routeService.addStop(selectedRoute.id, stopData);
      
      // Refresh route data
      await fetchRoutes();
      
      setSuccessMessage("Stop added successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
      
      // Close modal
      setIsModalOpen(false);
      setModalVisible(false);
    } catch (error: unknown) {
      console.error("Error adding stop:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to add stop");
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Modify the addStop function to properly initialize the new stop
  const addStop = () => {
    // Calculate the next sequence number
    const nextSequence = formData.stops.length + 1;
    
    // Calculate estimated minutes based on the last stop (if any)
    const lastStop = formData.stops.length > 0 
      ? formData.stops[formData.stops.length - 1] 
      : null;
    
    // Default to previous stop + 5 minutes, or 0 for the first stop
    const estimatedMinutes = lastStop 
      ? (lastStop.estimatedMinutesFromStart || 0) + 5 
      : 0;
    
    // Add the new stop with all required fields properly initialized
    setFormData({
      ...formData,
      stops: [
        ...formData.stops,
        {
          name: '',
          address: '',
          latitude: 0,
          longitude: 0,
          estimatedMinutesFromStart: estimatedMinutes,
          sequence: nextSequence
        }
      ]
    });
    
    console.log('Added new stop with sequence:', nextSequence, 'and estimated minutes:', estimatedMinutes);
  };

  // Update the renderModalContent function signature to use the defined ModalType
  const renderModalContent = (type: ModalType) => {
    switch (type) {
      case 'add':
        return (
          <div className="modal-content">
            <h3>Add New Route</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Route Name <span className="required">*</span></label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label htmlFor="type">Route Type <span className="required">*</span></label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value={RouteType.MORNING_PICKUP}>Morning Pickup</option>
                  <option value={RouteType.AFTERNOON_DROPOFF}>Afternoon Dropoff</option>
                </select>
              </div>
              <div className="form-group">
                <label>School</label>
                <div className="static-field">
                  {schools.find(s => s.id === formData.schoolId)?.name || 'Using default school'}
                  <input type="hidden" name="schoolId" value={formData.schoolId} />
                </div>
              </div>
              <div className="form-group">
                <h4>Stops</h4>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={addStop}
                >
                  Add Stop
                </button>
              </div>
              {formData.stops.map((stop, index) => (
                <div key={index} className="stop-container">
                  <h4>Stop #{index + 1}</h4>
                  <div className="form-group">
                    <label htmlFor={`stopName${index}`}>Stop Name <span className="required">*</span></label>
                    <input
                      type="text"
                      id={`stopName${index}`}
                      name={`stops.${index}.name`}
                      value={stop.name}
                      onChange={handleStopInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor={`stopAddress${index}`}>Address <span className="required">*</span></label>
                    <input
                      type="text"
                      id={`stopAddress${index}`}
                      name={`stops.${index}.address`}
                      value={stop.address}
                      onChange={handleStopInputChange}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group half">
                      <label htmlFor={`latitude${index}`}>Latitude <span className="required">*</span></label>
                      <input
                        type="number"
                        id={`latitude${index}`}
                        name={`stops.${index}.latitude`}
                        value={stop.latitude}
                        onChange={handleStopInputChange}
                        step="0.000001"
                        required
                      />
                    </div>
                    <div className="form-group half">
                      <label htmlFor={`longitude${index}`}>Longitude <span className="required">*</span></label>
                      <input
                        type="number"
                        id={`longitude${index}`}
                        name={`stops.${index}.longitude`}
                        value={stop.longitude}
                        onChange={handleStopInputChange}
                        step="0.000001"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor={`estimatedMinutes${index}`}>Minutes from Start <span className="required">*</span></label>
                    <input
                      type="number"
                      id={`estimatedMinutes${index}`}
                      name={`stops.${index}.estimatedMinutesFromStart`}
                      value={stop.estimatedMinutesFromStart}
                      onChange={handleStopInputChange}
                      min="0"
                      required
                    />
                  </div>
                  <div className="stop-actions">
                    {index > 0 && (
                      <button
                        type="button"
                        className="btn-icon"
                        title="Move up"
                        onClick={() => {
                          const newStops = [...formData.stops];
                          [newStops[index-1], newStops[index]] = [newStops[index], newStops[index-1]];
                          setFormData({...formData, stops: newStops});
                        }}
                      >
                        ↑
                      </button>
                    )}
                    {index < formData.stops.length - 1 && (
                      <button
                        type="button"
                        className="btn-icon"
                        title="Move down"
                        onClick={() => {
                          const newStops = [...formData.stops];
                          [newStops[index], newStops[index+1]] = [newStops[index+1], newStops[index]];
                          setFormData({...formData, stops: newStops});
                        }}
                      >
                        ↓
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-icon btn-danger"
                      title="Remove stop"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          stops: formData.stops.filter((_, i) => i !== index)
                        });
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add Route'}
                </button>
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
              </div>
              {/* Debug section without using process.env */}
              {import.meta.env.DEV && (
                <div className="debug-section">
                  <h4>Debug Tools</h4>
                  <button 
                    type="button"
                    className="btn-secondary" 
                    onClick={() => {
                      const schoolId = formData.schoolId;
                      const fallbackId = getSchoolIdFromLocalStorage();
                      alert(`Current schoolId: ${schoolId} (${typeof schoolId})\n` +
                            `Fallback ID: ${fallbackId} (${typeof fallbackId})\n` +
                            `Number of schools loaded: ${schools.length}\n` +
                            `First school ID: ${schools.length > 0 ? schools[0].id : 'none'}`);
                    }}
                  >
                    Validate School ID
                  </button>
                </div>
              )}
              {errorMessage && (
                <div className="operation-message error">
                  {errorMessage}
                </div>
              )}
            </form>
          </div>
        );
        
      case 'edit':
        return (
          <div className="modal-content">
            <h3>Edit Route</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Route Name <span className="required">*</span></label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label htmlFor="type">Route Type <span className="required">*</span></label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value={RouteType.MORNING_PICKUP}>Morning Pickup</option>
                  <option value={RouteType.AFTERNOON_DROPOFF}>Afternoon Dropoff</option>
                </select>
              </div>
              <div className="form-group">
                <label>School</label>
                <div className="static-field">
                  {schools.find(s => s.id === formData.schoolId)?.name || 'Using default school'}
                  <input type="hidden" name="schoolId" value={formData.schoolId} />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Route'}
                </button>
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
              </div>
              {errorMessage && (
                <div className="operation-message error">
                  {errorMessage}
                </div>
              )}
            </form>
          </div>
        );
        
      case 'view':
        return selectedRoute ? (
          <div className="modal-content view-mode">
            <h3>Route Details</h3>
            <div className="route-details">
              <div className="details-row">
                <span className="label">ID:</span>
                <span className="value">{selectedRoute.id}</span>
              </div>
              <div className="details-row">
                <span className="label">Name:</span>
                <span className="value">{selectedRoute.name}</span>
              </div>
              <div className="details-row">
                <span className="label">Description:</span>
                <span className="value">{selectedRoute.description || 'Not provided'}</span>
              </div>
              <div className="details-row">
                <span className="label">Type:</span>
                <span className="value">
                  {selectedRoute.type === RouteType.MORNING_PICKUP ? 'Morning Pickup' : 
                   selectedRoute.type === RouteType.AFTERNOON_DROPOFF ? 'Afternoon Dropoff' : selectedRoute.type}
                </span>
              </div>
              <div className="details-row">
                <span className="label">School:</span>
                <span className="value">{selectedRoute.school?.name || 'Not assigned'}</span>
              </div>
              <div className="details-row">
                <span className="label">Status:</span>
                <span className={`value status-indicator ${selectedRoute.active ? 'active' : 'inactive'}`}>
                  {selectedRoute.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="details-row">
                <span className="label">Created:</span>
                <span className="value">
                  {selectedRoute.createdAt ? new Date(selectedRoute.createdAt).toLocaleString() : 'Unknown'}
                </span>
              </div>
            </div>
            
            <div className="section-title">
              <h4>Stops Information</h4>
              <button
                className="btn-secondary btn-sm"
                onClick={() => {
                  closeModal();
                  openAddStopModal(selectedRoute);
                }}
              >
                Add Stop
              </button>
              {selectedRoute.stops && selectedRoute.stops.length > 0 ? (
                <div className="route-stops">
                  <table className="stops-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Name</th>
                        <th>Address</th>
                        <th>Minutes from Start</th>
                        <th>Coordinates</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRoute.stops.map((stop, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{stop.name}</td>
                          <td>{stop.address || 'N/A'}</td>
                          <td>{stop.estimatedMinutesFromStart || '0'}</td>
                          <td>
                            {stop.latitude !== null && stop.longitude !== null 
                              ? `${stop.latitude.toFixed(6)}, ${stop.longitude.toFixed(6)}` 
                              : 'Not set'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="no-stops-message">No stops have been added to this route yet.</p>
              )}
            </div>
            
            <div className="form-actions">
              <button
                className="btn-secondary"
                onClick={() => {
                  setSelectedRoute(null);
                  closeModal();
                }}
              >
                Close
              </button>
              <button 
                className="btn-primary"
                onClick={() => {
                  closeModal();
                  openModal('edit', selectedRoute);
                }}
              >
                Edit
              </button>
            </div>
          </div>
        ) : null;
        
      case 'delete':
        return selectedRoute ? (
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this route?</p>
            
            <div className="route-details">
              <div className="details-row">
                <span className="label">Name:</span>
                <span className="value">{selectedRoute.name}</span>
              </div>
              <div className="details-row">
                <span className="label">School:</span>
                <span className="value">{selectedRoute.school?.name || 'Not assigned'}</span>
              </div>
            </div>
            
            <p className="warning">⚠️ This action cannot be undone. Routes with trips cannot be deleted.</p>
            
            {errorMessage && (
              <div className="operation-message error">
                {errorMessage}
              </div>
            )}
            
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-danger" 
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Delete Route'}
              </button>
            </div>
          </div>
        ) : null;
        
      case 'add-stop':
        return (
          <div className="modal-content">
            <h3>Add Stop to Route: {selectedRoute?.name}</h3>
            <form onSubmit={handleAddStopSubmit}>
              <div className="form-group">
                <label htmlFor="stopName">Stop Name <span className="required">*</span></label>
                <input
                  type="text"
                  id="stopName"
                  name="name"
                  value={newStopForm.name}
                  onChange={handleNewStopInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="stopAddress">Address <span className="required">*</span></label>
                <input
                  type="text"
                  id="stopAddress"
                  name="address"
                  value={newStopForm.address}
                  onChange={handleNewStopInputChange}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="latitude">Latitude <span className="required">*</span></label>
                  <input
                    type="number"
                    id="latitude"
                    name="latitude"
                    value={newStopForm.latitude}
                    onChange={handleNewStopInputChange}
                    step="0.000001"
                    required
                  />
                </div>
                <div className="form-group half">
                  <label htmlFor="longitude">Longitude <span className="required">*</span></label>
                  <input
                    type="number"
                    id="longitude"
                    name="longitude"
                    value={newStopForm.longitude}
                    onChange={handleNewStopInputChange}
                    step="0.000001"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="estimatedMinutes">Minutes from Start <span className="required">*</span></label>
                <input
                  type="number"
                  id="estimatedMinutes"
                  name="estimatedMinutesFromStart"
                  value={newStopForm.estimatedMinutesFromStart}
                  onChange={handleNewStopInputChange}
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="sequence">Order/Sequence <span className="required">*</span></label>
                <input
                  type="number"
                  id="sequence"
                  name="sequence"
                  value={newStopForm.sequence}
                  onChange={handleNewStopInputChange}
                  min="1"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add Stop'}
                </button>
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
              </div>
              {errorMessage && (
                <div className="operation-message error">
                  {errorMessage}
                </div>
              )}
            </form>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Main render
  if (!isAuthenticated) {
    return (
      <div className="authentication-reminder">
        <h3>Authentication Required</h3>
        <p>Please log in to access the routes management system.</p>
        <button className="btn-primary" onClick={() => {
          // This is just for development
          localStorage.setItem('token', 'test-token');
          setIsAuthenticated(true);
          fetchRoutes();
          fetchSchools();
        }}>
          Login with Test Token
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <span>Loading routes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button className="btn-primary" onClick={fetchRoutes}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="routes-list-container">
      <div className="search-filter-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filters">
            <select
              className="filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            aria-label="Filter by type"
            >
            <option value="">All Types</option>
            <option value={RouteType.MORNING_PICKUP}>Morning Pickup</option>
            <option value={RouteType.AFTERNOON_DROPOFF}>Afternoon Dropoff</option>
            </select>
          
          <button className="btn-primary add-button" onClick={() => openModal('add')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add Route</span>
          </button>
        </div>
      </div>

      {filteredRoutes.length === 0 ? (
        <div className="empty-state">
          <p>No routes found matching your criteria.</p>
          {(searchQuery || filterType || filterSchool) ? (
            <button className="btn-secondary" onClick={() => {
              setSearchQuery('');
              setFilterType('');
              setFilterSchool(0);
            }}>
              Clear Filters
            </button>
          ) : (
            <button className="btn-primary" onClick={() => openModal('add')}>
              Add New Route
            </button>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="routes-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>School</th>
                <th>Stops</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoutes.map(route => (
                <tr key={route.id} className={!route.active ? 'inactive-row' : ''}>
                  <td>{route.id}</td>
                  <td>{route.name}</td>
                  <td>
                    {route.type === RouteType.MORNING_PICKUP ? 'Morning Pickup' : 
                     route.type === RouteType.AFTERNOON_DROPOFF ? 'Afternoon Dropoff' : route.type}
                  </td>
                  <td>{route.school?.name || 'Not assigned'}</td>
                  <td>{route.stops?.length || 0}</td>
                  <td className="actions-cell">
                    <button
                      className="action-btn view"
                      onClick={() => openModal('view', route)}
                      aria-label="View route details"
                    >
                      View
                    </button>
                    <button
                      className="action-btn edit"
                      onClick={() => openModal('edit', route)}
                      aria-label="Edit route"
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => openModal('delete', route)}
                      aria-label="Delete route"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {(modalVisible || isModalOpen) && (
        <div className="modal-overlay">
          <div className="modal">
            {renderModalContent(modalType)}
              </div>
                  </div>
                )}

      {/* Success and error messages - fixed positioning */}
      {successMessage && (
        <div className="success-message">
          {successMessage}
                  </div>
                )}

      {/* Only show floating error message when no modal is open */}
      {errorMessage && !isModalOpen && !modalVisible && (
        <div className="error-message floating">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default RoutesList; 