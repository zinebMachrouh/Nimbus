import React, { useState, useEffect } from 'react';
import { useAdminService, useDriverService, useParentService } from '../../../../contexts/ServiceContext';
import { Driver, DriverStatus } from '../../../../core/entities/driver.entity';
import { User, UserRole } from '../../../../core/entities/user.entity';
import { Vehicle } from '../../../../core/entities/vehicle.entity';
import { VehicleServiceImpl } from '../../../../services/impl/VehicleServiceImpl';
import { FaSearch, FaEye, FaPencilAlt, FaTrash, FaPlus, FaFilter } from 'react-icons/fa';
import './UsersList.css';

type UserDisplayType = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    address?: string;
    licenseNumber?: string;
    licenseExpiryDate?: string;
    vehicleId?: string | number;
    status?: DriverStatus;
    emergencyContact?: string;
    emergencyPhone?: string;
    active: boolean;
    profileImage?: string;
    userType: 'driver' | 'parent';
};

type ModalType = 'add' | 'edit' | 'view' | 'delete' | null;

const UsersList: React.FC = () => {
    const [users, setUsers] = useState<UserDisplayType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<'driver' | 'parent'>('driver');
    const [error, setError] = useState<string | null>(null);
    
    const [selectedUser, setSelectedUser] = useState<UserDisplayType | null>(null);
    
    const [modalType, setModalType] = useState<ModalType>(null);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    
    // Search and filter state
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: '',
        password: '',
        confirmPassword: '',
        role: 'ROLE_DRIVER',
        licenseNumber: '',
        licenseExpiryDate: '',
        vehicleId: '', 
        status: DriverStatus.AVAILABLE,
        emergencyContact: '',
        emergencyPhone: '',
    });

    const [operationStatus, setOperationStatus] = useState<{
        loading: boolean;
        success: boolean;
        message: string;
    }>({
        loading: false,
        success: false,
        message: '',
    });

    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loadingVehicles, setLoadingVehicles] = useState<boolean>(false);

    const driverService = useDriverService();
    const parentService = useParentService();
    const adminService = useAdminService();

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const schoolData = localStorage.getItem('school');
            if (!schoolData) {
                throw new Error('School data not found');
            }
            const schoolId = JSON.parse(schoolData).id;
            console.log('Fetching users for school ID:', schoolId);
            
            let allUsers: UserDisplayType[] = [];
            
            // First attempt to fetch drivers - log detailed progress
            try {
                console.log('Fetching drivers...');
                // Make sure to use the correct service method
                const driversData = await driverService.getAllDriversBySchoolId(schoolId);
                console.log('Raw drivers data received:', driversData);
                
                if (driversData && Array.isArray(driversData)) {
                    console.log(`Found ${driversData.length} drivers`);
                    const formattedDrivers: UserDisplayType[] = driversData.map(driver => {
                        console.log('Processing driver:', driver);
                        // Ensure consistency with isActive/active - using type assertion for properties that might not exist
                        const isActive = typeof (driver as any).isActive !== 'undefined' ? 
                                      (driver as any).isActive : 
                                      typeof (driver as any).active !== 'undefined' ? 
                                      (driver as any).active : true;
                        
                        return {
                            id: driver.id,
                            firstName: driver.firstName || '',
                            lastName: driver.lastName || '',
                            email: driver.email || '',
                            phoneNumber: driver.phoneNumber || '',
                            address: driver.address || '',
                            licenseNumber: driver.licenseNumber || '',
                            licenseExpiryDate: driver.licenseExpiryDate || '',
                            vehicleId: driver.vehicle?.id,
                            status: driver.status,
                            emergencyContact: undefined,
                            emergencyPhone: undefined,
                            active: isActive,
                            profileImage: driver.profileImage || '',
                            userType: 'driver'
                        };
                    });
                    allUsers = [...formattedDrivers];
                    console.log('Formatted drivers:', formattedDrivers);
                } else {
                    console.warn('No drivers found or invalid data format:', driversData);
                    // Try alternate method for fetching drivers if the first one fails or returns empty
                    try {
                        console.log('Attempting to fetch drivers using adminService...');
                        const adminDriversData = await adminService.getUsersByRole('DRIVER');
                        console.log('Admin drivers data:', adminDriversData);
                        
                        if (adminDriversData && Array.isArray(adminDriversData) && adminDriversData.length > 0) {
                            const formattedDrivers: UserDisplayType[] = adminDriversData.map(driver => {
                                const isActive = typeof (driver as any).isActive !== 'undefined' ? 
                                              (driver as any).isActive : 
                                              typeof (driver as any).active !== 'undefined' ? 
                                              (driver as any).active : true;
                                
                                return {
                                    id: driver.id,
                                    firstName: driver.firstName || '',
                                    lastName: driver.lastName || '',
                                    email: driver.email || '',
                                    phoneNumber: driver.phoneNumber || '',
                                    address: (driver as any).address || '',
                                    licenseNumber: (driver as any).licenseNumber || '',
                                    licenseExpiryDate: (driver as any).licenseExpiryDate || '',
                                    vehicleId: (driver as any).vehicle?.id,
                                    status: (driver as any).status,
                                    emergencyContact: undefined,
                                    emergencyPhone: undefined,
                                    active: isActive,
                                    profileImage: driver.profileImage || '',
                                    userType: 'driver'
                                };
                            });
                            allUsers = [...formattedDrivers];
                            console.log('Formatted admin drivers:', formattedDrivers);
                        }
                    } catch (adminDriverErr) {
                        console.error('Error fetching drivers using adminService:', adminDriverErr);
                    }
                }
            } catch (driverErr) {
                console.error('Error fetching drivers:', driverErr);
            }
            
            try {
                console.log('Fetching parents...');
                const parentsData = await adminService.getAllParents();
                console.log('Parents data received:', parentsData);
                
                if (parentsData && Array.isArray(parentsData)) {
                    console.log(`Found ${parentsData.length} parents`);
                    const formattedParents: UserDisplayType[] = parentsData.map(parent => {
                        // Log the parent data to see if isActive or active fields are set
                        console.log('Parent raw data:', parent);
                        
                        // Ensure isActive is properly set (default to true if undefined)
                        const isActive = typeof (parent as any).isActive !== 'undefined' ? 
                                      (parent as any).isActive : 
                                      typeof (parent as any).active !== 'undefined' ? 
                                      (parent as any).active : true;
                        console.log(`Parent ${parent.id} (${parent.firstName} ${parent.lastName}) active status: ${isActive}`);
                        
                        return {
                            id: parent.id,
                            firstName: parent.firstName || '',
                            lastName: parent.lastName || '',
                            email: parent.email || '',
                            phoneNumber: parent.phoneNumber || '',
                            address: (parent as any).address || '',
                            emergencyContact: (parent as any).emergencyContact || '',
                            emergencyPhone: (parent as any).emergencyPhone || '',
                            active: isActive,
                            profileImage: parent.profileImage || '',
                            userType: 'parent'
                        };
                    });
                    allUsers = [...allUsers, ...formattedParents];
                    console.log('Formatted parents:', formattedParents);
                } else {
                    console.warn('No parents found or invalid data format:', parentsData);
                }
            } catch (parentErr) {
                console.error('Error fetching parents:', parentErr);
            }
            
            console.log('Final user list:', allUsers);
            if (allUsers.length === 0) {
                setError('No users found for this school');
            }
            
            setUsers(allUsers);
            
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const fetchVehicles = async () => {
        setLoadingVehicles(true);
        try {
            const schoolData = localStorage.getItem('school');
            if (!schoolData) {
                throw new Error('School data not found');
            }
            const schoolId = JSON.parse(schoolData).id;
            
            const vehicleService = new VehicleServiceImpl();
            const vehiclesData = await vehicleService.findVehiclesBySchool(schoolId);
            
            const availableVehicles = vehiclesData.filter((vehicle: Vehicle) => 
                vehicle.status === 'AVAILABLE' || vehicle.status === 'OUT_OF_SERVICE'
            );
            
            setVehicles(availableVehicles);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        } finally {
            setLoadingVehicles(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [driverService, parentService]);

    useEffect(() => {
        if (modalType === 'add' && activeTab === 'driver') {
            fetchVehicles();
        }
    }, [modalType, activeTab]);

    // Filter users based on search term and status filter
    const filteredUsers = users
        .filter(user => user.userType === activeTab)
        .filter(user => {
            if (searchTerm === '') return true;
            
            const searchLower = searchTerm.toLowerCase();
            return (
                user.firstName.toLowerCase().includes(searchLower) ||
                user.lastName.toLowerCase().includes(searchLower) ||
                user.email.toLowerCase().includes(searchLower) ||
                (user.phoneNumber && user.phoneNumber.toLowerCase().includes(searchLower))
            );
        })
        .filter(user => {
            if (statusFilter === 'all') return true;
            return statusFilter === 'active' ? user.active : !user.active;
        });

    const openModal = (type: ModalType, user?: UserDisplayType) => {
        setModalType(type);
        setModalVisible(true);
        
        if (user && (type === 'edit' || type === 'view' || type === 'delete')) {
            setSelectedUser(user);
            
            if (type === 'edit') {
                const role = user.userType === 'driver' ? UserRole.DRIVER : UserRole.PARENT;
                
                setFormData({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phoneNumber: user.phoneNumber || '',
                    address: user.address || '',
                    password: '',
                    confirmPassword: '',
                    role,
                    licenseNumber: user.licenseNumber || '',
                    licenseExpiryDate: user.licenseExpiryDate || '',
                    vehicleId: user.vehicleId ? String(user.vehicleId) : '',
                    status: user.status || DriverStatus.AVAILABLE,
                    emergencyContact: user.emergencyContact || '',
                    emergencyPhone: user.emergencyPhone || '',
                });
                
                if (user.userType === 'driver') {
                    fetchVehicles();
                }
            }
        } else if (type === 'add') {
            const role = activeTab === 'driver' ? UserRole.DRIVER : UserRole.PARENT;
            
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phoneNumber: '',
                address: '',
                password: '',
                confirmPassword: '',
                role,
                licenseNumber: '',
                licenseExpiryDate: '',
                vehicleId: '',
                status: DriverStatus.AVAILABLE,
                emergencyContact: '',
                emergencyPhone: '',
            });
            
            setSelectedUser(null);
            
            if (activeTab === 'driver') {
                fetchVehicles();
            }
        }
    };

    const closeModal = () => {
        setModalVisible(false);
        setModalType(null);
        setSelectedUser(null);
        setOperationStatus({
            loading: false,
            success: false,
            message: '',
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateForm = () => {
        setOperationStatus({
            loading: false,
            success: false,
            message: '',
        });

        const { firstName, lastName, email, password, confirmPassword } = formData;
        
        if (!firstName || !lastName || !email) {
            setOperationStatus({
                loading: false,
                success: false,
                message: 'Please fill in all required fields.',
            });
            return false;
        }
        
        if (modalType === 'add' && (!password || password.length < 6)) {
            setOperationStatus({
                loading: false,
                success: false,
                message: 'Password must be at least 6 characters.',
            });
            return false;
        }
        
        if (modalType === 'add' && password !== confirmPassword) {
            setOperationStatus({
                loading: false,
                success: false,
                message: 'Passwords do not match.',
            });
            return false;
        }
        
        return true;
    };

    const generateUsername = (firstName: string, lastName: string): string => {
        // Remove spaces and special characters, then combine first and last name
        const cleanFirstName = firstName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const cleanLastName = lastName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        return `${cleanFirstName}.${cleanLastName}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setOperationStatus({
            loading: true,
            success: false,
            message: '',
        });
        
        try {
            const schoolData = localStorage.getItem('school');
            if (!schoolData) {
                throw new Error('School data not found');
            }
            const schoolId = JSON.parse(schoolData).id;
            
            const username = generateUsername(formData.firstName, formData.lastName);
            
            const formatDateForBackend = (dateString: string): string => {
                if (!dateString) return '';
                return `${dateString}T00:00:00`;
            };
            
            if (modalType === 'add') {
                if (activeTab === 'driver') {
                    const driverData = {
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        phoneNumber: formData.phoneNumber,
                        password: formData.password,
                        active:true,
                        address: formData.address,
                        licenseNumber: formData.licenseNumber,
                        licenseExpiryDate: formatDateForBackend(formData.licenseExpiryDate),
                        vehicleId: formData.vehicleId ? parseInt(formData.vehicleId) : undefined,
                        status: formData.status,
                        username,
                        role: UserRole.DRIVER,
                        schoolId,
                        isActive: true,
                    };
                    
                    console.log("Creating driver with status:", formData.status);
                    await adminService.createDriver(driverData);
                } else {
                    const parentData = {
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        phoneNumber: formData.phoneNumber,
                        address: formData.address,
                        emergencyContact: formData.emergencyContact,
                        emergencyPhone: formData.emergencyPhone,
                        password: formData.password,
                        username,
                        role: UserRole.PARENT,
                        schoolId: JSON.parse(localStorage.getItem('school') || '{}').id,
                        isActive: true
                    };
                    console.log('Creating parent with data:', parentData);
                    await adminService.createParent(parentData);
                }
                
                setOperationStatus({
                    loading: false,
                    success: true,
                    message: `${activeTab === 'driver' ? 'Driver' : 'Parent'} created successfully.`,
                });
                
                await fetchUsers();
                
            } else if (modalType === 'edit' && selectedUser) {
                if (activeTab === 'driver') {
                    const driverData = {
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        phoneNumber: formData.phoneNumber,
                        active:true,
                        address: formData.address,
                        licenseNumber: formData.licenseNumber,
                        licenseExpiryDate: formatDateForBackend(formData.licenseExpiryDate),
                        vehicleId: formData.vehicleId ? parseInt(formData.vehicleId) : undefined,
                        status: formData.status,
                    };
                    
                    console.log("Updating driver with status:", formData.status);
                    await driverService.updateDriver(selectedUser.id, driverData);
                } else {
                    const parentData = {
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        phoneNumber: formData.phoneNumber,
                        address: formData.address,
                        emergencyContact: formData.emergencyContact,
                        emergencyPhone: formData.emergencyPhone,
                        schoolId: JSON.parse(localStorage.getItem('school') || '{}').id,
                        isActive: true
                    };
                    console.log('Updating parent with data:', parentData);
                    await adminService.updateParent(selectedUser.id, parentData);
                }
                
                setOperationStatus({
                    loading: false,
                    success: true,
                    message: `${activeTab === 'driver' ? 'Driver' : 'Parent'} updated successfully.`,
                });
                
                await fetchUsers();
            }
            
            setTimeout(() => {
                closeModal();
            }, 1500);
            
        } catch (error) {
            console.error('Operation failed:', error);
            setOperationStatus({
                loading: false,
                success: false,
                message: `Failed to ${modalType} ${activeTab === 'driver' ? 'driver' : 'parent'}.`,
            });
        }
    };

    const handleDelete = async () => {
        if (!selectedUser) return;
        
        setOperationStatus({
            loading: true,
            success: false,
            message: '',
        });
        
        try {
            if (selectedUser.userType === 'driver') {
                await driverService.deleteDriver(selectedUser.id);
            } else {
                // Enhanced error handling for parent deletion
                try {
                    console.log('Attempting to delete parent with ID:', selectedUser.id);
                    await adminService.deleteParent(selectedUser.id);
                    console.log('Parent deletion API call completed');
                } catch (error: any) {
                    console.error('Error deleting parent:', error);
                    
                    // Check for specific error message or try to parse response data
                    const errorMessage = 
                        (error.response && error.response.data && error.response.data.message) 
                            ? error.response.data.message 
                            : error.message || 'Unknown error';
                    
                    console.log('Error message:', errorMessage);
                    
                    if (errorMessage.includes("associated students")) {
                        throw new Error("Cannot delete parent with associated students. Please remove the students first or deactivate the account instead.");
                    } else {
                        throw new Error(`Failed to delete parent: ${errorMessage}`);
                    }
                }
            }
            
            setOperationStatus({
                loading: false,
                success: true,
                message: `${selectedUser.userType === 'driver' ? 'Driver' : 'Parent'} deleted successfully.`,
            });
            
            await fetchUsers();
            
            setTimeout(() => {
                closeModal();
            }, 1500);
            
        } catch (error: any) {
            console.error('Delete operation failed:', error);
            setOperationStatus({
                loading: false,
                success: false,
                message: typeof error === 'object' && error.message ? error.message : 
                    `Failed to delete ${selectedUser.userType === 'driver' ? 'driver' : 'parent'}.`,
            });
        }
    };

    const handleToggleStatus = async (user: UserDisplayType) => {
        try {
            // Support both active and isActive for backward compatibility
            const newStatus = !user.active;
            
            if (user.userType === 'driver') {
                await driverService.toggleDriverStatus(user.id, newStatus);
            } else {
                await adminService.toggleParentStatus(user.id, newStatus);
            }
            
            setUsers(prevUsers => 
                prevUsers.map(u => 
                    u.id === user.id && u.userType === user.userType
                        ? { ...u, active: newStatus, isActive: newStatus }
                        : u
                )
            );
            
        } catch (error) {
            console.error('Status toggle failed:', error);
            alert(`Failed to ${user.active ? 'deactivate' : 'activate'} the ${user.userType}.`);
        }
    };

    const renderUserCard = (user: UserDisplayType) => {
        const userInitials = `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`;
        
        return (
            <div className="user-card" key={user.id}>
                <div className="user-card-content">
                    <div className="user-avatar">
                        {user.profileImage ? (
                            <img src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} />
                        ) : (
                            <div className="user-initials">{userInitials}</div>
                        )}
                    </div>
                    
                    <div className="user-details">
                        <h3 className="user-name">{user.firstName} {user.lastName}</h3>
                        <div className="user-email">{user.email}</div>
                        {user.phoneNumber && (
                            <div className="user-phone">{user.phoneNumber}</div>
                        )}
                        
                        <div className="user-info-badges">
                            <span className="user-badge user-type-badge">
                                {user.userType === 'driver' ? 'Driver' : 'Parent'}
                            </span>
                            <span className={`user-badge user-status-badge ${!user.active ? 'inactive' : ''}`}>
                                {user.active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="user-card-actions">
                    <button 
                        className="action-button view-button" 
                        onClick={() => openModal('view', user)}
                        aria-label={`View ${user.firstName} ${user.lastName}`}
                    >
                        View
                    </button>
                    <button 
                        className="action-button edit-button" 
                        onClick={() => openModal('edit', user)}
                        aria-label={`Edit ${user.firstName} ${user.lastName}`}
                    >
                        Edit
                    </button>
                    <button 
                        className="action-button delete-button" 
                        onClick={() => openModal('delete', user)}
                        aria-label={`Delete ${user.firstName} ${user.lastName}`}
                    >
                        Delete
                    </button>
                </div>
            </div>
        );
    };

    const renderModalContent = () => {
        switch (modalType) {
            case 'add':
            case 'edit':
                const isAddMode = modalType === 'add';
                return (
                    <div className="modal-content">
                        <h2>{isAddMode ? 'Add' : 'Edit'} {activeTab === 'driver' ? 'Driver' : 'Parent'}</h2>
                        <form onSubmit={handleSubmit}>
                            {/* Common fields for both driver and parent */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="firstName">First Name *</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="lastName">Last Name *</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="email">Email *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="phoneNumber">Phone Number *</label>
                                    <input
                                        type="tel"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="address">Address *</label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            
                            {(formData.firstName && formData.lastName) && (
                                <div className="form-group username-display">
                                    <label>Username (auto-generated)</label>
                                    <div className="generated-username">{generateUsername(formData.firstName, formData.lastName)}</div>
                                </div>
                            )}
                            
                            {activeTab === 'driver' && (
                                <>
                                    <h3 className="form-section-title">Driver Details</h3>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="licenseNumber">License Number *</label>
                                            <input
                                                type="text"
                                                id="licenseNumber"
                                                name="licenseNumber"
                                                value={formData.licenseNumber}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="licenseExpiryDate">License Expiry Date *</label>
                                            <input
                                                type="date"
                                                id="licenseExpiryDate"
                                                name="licenseExpiryDate"
                                                value={formData.licenseExpiryDate}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="vehicleId">Assign Vehicle</label>
                                            <select
                                                id="vehicleId"
                                                name="vehicleId"
                                                value={formData.vehicleId}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">-- Select Vehicle --</option>
                                                {vehicles.map(vehicle => (
                                                    <option key={vehicle.id} value={vehicle.id}>
                                                        {vehicle.licensePlate} - {vehicle.make} {vehicle.model}
                                                    </option>
                                                ))}
                                            </select>
                                            {loadingVehicles && <div className="loading-inline">Loading vehicles...</div>}
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="status">Status *</label>
                                            <select
                                                id="status"
                                                name="status"
                                                value={formData.status}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value={DriverStatus.AVAILABLE}>Available</option>
                                                <option value={DriverStatus.ON_TRIP}>On Trip</option>
                                                <option value={DriverStatus.OFF_DUTY}>Off Duty</option>
                                                <option value={DriverStatus.ON_LEAVE}>On Leave</option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}
                            
                            {activeTab === 'parent' && (
                                <>
                                    <h3 className="form-section-title">Parent Details</h3>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="emergencyContact">Emergency Contact</label>
                                            <input
                                                type="text"
                                                id="emergencyContact"
                                                name="emergencyContact"
                                                value={formData.emergencyContact}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="emergencyPhone">Emergency Phone</label>
                                            <input
                                                type="text"
                                                id="emergencyPhone"
                                                name="emergencyPhone"
                                                value={formData.emergencyPhone}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                            
                            {isAddMode && (
                                <>
                                    <h3 className="form-section-title">Account Security</h3>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="password">Password *</label>
                                            <input
                                                type="password"
                                                id="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                required
                                                minLength={6}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="confirmPassword">Confirm Password *</label>
                                            <input
                                                type="password"
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                            
                            {operationStatus.message && (
                                <div className={`status-message ${operationStatus.success ? 'success' : 'error'}`}>
                                    {operationStatus.message}
                                </div>
                            )}
                            
                            <div className="modal-actions">
                                <button 
                                    type="button" 
                                    className="cancel-button" 
                                    onClick={closeModal}
                                    disabled={operationStatus.loading}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="submit-button"
                                    disabled={operationStatus.loading}
                                >
                                    {operationStatus.loading ? isAddMode ? 'Adding...' : 'Saving...' : isAddMode ? 'Add' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                );
                
            case 'view':
                return selectedUser ? (
                    <div className="modal-content view-content">
                        <h2>{selectedUser.userType === 'driver' ? 'Driver' : 'Parent'} Details</h2>
                        <div className="user-details">
                            <div className="user-detail-avatar">
                                {selectedUser.profileImage ? (
                                    <img 
                                        src={selectedUser.profileImage} 
                                        alt={`${selectedUser.firstName} ${selectedUser.lastName}`} 
                                        className="user-detail-image"
                                    />
                                ) : (
                                    <span className="user-detail-initials">
                                        {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                                    </span>
                                )}
                            </div>
                            
                            <div className="detail-row">
                                <span className="detail-label">Name:</span>
                                <span className="detail-value">{selectedUser.firstName} {selectedUser.lastName}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Email:</span>
                                <span className="detail-value">{selectedUser.email}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Phone:</span>
                                <span className="detail-value">{selectedUser.phoneNumber || 'Not provided'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Address:</span>
                                <span className="detail-value">{selectedUser.address || 'Not provided'}</span>
                            </div>
                            
                            {selectedUser.userType === 'driver' && (
                                <>
                                    <div className="detail-row">
                                        <span className="detail-label">License:</span>
                                        <span className="detail-value">{selectedUser.licenseNumber || 'Not provided'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">License Exp:</span>
                                        <span className="detail-value">{selectedUser.licenseExpiryDate || 'Not provided'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Vehicle ID:</span>
                                        <span className="detail-value">{selectedUser.vehicleId || 'Not assigned'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Status:</span>
                                        <span className="detail-value">{selectedUser.status || 'Not set'}</span>
                                    </div>
                                </>
                            )}
                            
                            <div className="detail-row">
                                <span className="detail-label">Emergency:</span>
                                <span className="detail-value">
                                    {selectedUser.emergencyContact ? `${selectedUser.emergencyContact} (${selectedUser.emergencyPhone || 'No phone'})` : 'Not provided'}
                                </span>
                            </div>
                            
                            <div className="detail-row">
                                <span className="detail-label">Account:</span>
                                <span className={`detail-value status-${selectedUser.active ? 'active' : 'inactive'}`}>
                                    {selectedUser.active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Type:</span>
                                <span className="detail-value">{selectedUser.userType === 'driver' ? 'Driver' : 'Parent'}</span>
                            </div>
                        </div>
                        
                        <div className="modal-actions">
                            <button 
                                type="button" 
                                className="close-button" 
                                onClick={closeModal}
                            >
                                Close
                            </button>
                            <button 
                                type="button" 
                                className="edit-button"
                                onClick={() => {
                                    closeModal();
                                    openModal('edit', selectedUser);
                                }}
                            >
                                Edit
                            </button>
                        </div>
                    </div>
                ) : null;
                
            case 'delete':
                return selectedUser ? (
                    <div className="modal-content delete-content">
                        <h2>Delete {selectedUser.userType === 'driver' ? 'Driver' : 'Parent'}</h2>
                        
                        {selectedUser.userType === 'parent' && (
                            <div className="delete-warning">
                                <p>
                                    <strong>Important:</strong> Parents with associated students cannot be deleted.
                                    Please use the "Deactivate" button instead, which will hide the parent account
                                    but preserve its data.
                                </p>
                            </div>
                        )}
                        
                        <p className="delete-message">
                            Are you sure you want to {selectedUser.userType === 'parent' ? 'attempt to ' : ''}
                            delete {selectedUser.firstName} {selectedUser.lastName}?
                            This action cannot be undone.
                        </p>
                        
                        {operationStatus.message && (
                            <div className={`status-message ${operationStatus.success ? 'success' : 'error'}`}>
                                {operationStatus.message}
                            </div>
                        )}
                        
                        <div className="modal-actions">
                            <button 
                                type="button" 
                                className="cancel-button" 
                                onClick={closeModal}
                                disabled={operationStatus.loading}
                            >
                                Cancel
                            </button>
                            
                            {selectedUser.userType === 'parent' && !operationStatus.success && (
                                <button
                                    type="button"
                                    className="deactivate-button"
                                    onClick={() => {
                                        // Directly deactivate the parent instead of trying to delete
                                        handleToggleStatus(selectedUser);
                                        setOperationStatus({
                                            loading: false,
                                            success: true,
                                            message: "Parent deactivated successfully. Deactivated parents will not show in the regular parents list."
                                        });
                                        setTimeout(() => {
                                            closeModal();
                                            // Refresh the user list after deactivation
                                            fetchUsers();
                                        }, 1500);
                                    }}
                                    disabled={operationStatus.loading}
                                >
                                    Deactivate Instead
                                </button>
                            )}
                            
                            <button 
                                type="button" 
                                className="delete-confirm-button"
                                onClick={handleDelete}
                                disabled={operationStatus.loading || operationStatus.success}
                            >
                                {operationStatus.loading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                ) : null;
                
            default:
                return null;
        }
    };

    return ( 
        <div className="users-list-container">
            <div className="search-filter-container">
                <button 
                    className={`tab-button ${activeTab === 'driver' ? 'active' : ''}`}
                    onClick={() => setActiveTab('driver')}
                >
                    Drivers
                </button>
                <button 
                    className={`tab-button ${activeTab === 'parent' ? 'active' : ''}`}
                    onClick={() => setActiveTab('parent')}
                >
                    Parents
                </button>
                <div className="search-input-container">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-select-container">
                    <select 
                        className="filter-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                        aria-label="Filter users by status"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                    </select>
                    <FaFilter className="filter-icon" />
                </div>
                <button className="add-user-button" onClick={() => openModal('add')}>
                    <FaPlus />
                    <span>Add New User</span>
                </button>
            </div>

            {loading ? (
                <div className="loading-message">Loading users...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : (
                <div className="users-cards-container">
                    {filteredUsers.length > 0 ? (
                        <div className="users-grid">
                            {filteredUsers.map(user => renderUserCard(user))}
                        </div>
                    ) : (
                        <div className="no-users-message">
                            <span className="no-users-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
                                </svg>
                            </span>
                            {searchTerm || statusFilter !== 'all' 
                                ? `No ${activeTab === 'driver' ? 'drivers' : 'parents'} found matching your criteria` 
                                : `No ${activeTab === 'driver' ? 'drivers' : 'parents'} found for this school`}
                        </div>
                    )}
                </div>
            )}
            
            {/* Modal */}
            {modalVisible && (
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
 
export default UsersList;