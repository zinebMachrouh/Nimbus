import React, { useState, useEffect } from 'react';
import './StudentsList.css';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import { useAdminService, useStudentService, useTripService } from '../../../../contexts/ServiceContext';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  grade: string;
  parentId: number;
  schoolId: number;
  seatNumber?: number | null;
  qrCode?: string;
  hasTrip?: boolean;
  isActive: boolean;
}

interface FormData {
  id?: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  grade: string;
  parentId: number;
  schoolId: number;
  seatNumber?: number | null;
  isActive?: boolean;
}

interface OperationStatus {
  loading: boolean;
  success: boolean;
  error: string | null;
}

interface UpdateStudentData {
  firstName: string;
  lastName: string;
  parentId: number;
  schoolId: number;
  isActive: boolean;
  dateOfBirth?: string;
  grade?: string;
}

const StudentsList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterAttendance, setFilterAttendance] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view' | 'delete' | 'restore' | 'record-attendance'>('add');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    grade: '',
    parentId: 0,
    schoolId: 1,
    seatNumber: null,
    isActive: true
  });
  const [operationStatus, setOperationStatus] = useState<OperationStatus>({
    loading: false,
    success: false,
    error: null
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [parents, setParents] = useState<{id: number, firstName: string, lastName: string}[]>([]);
  const [grades] = useState<string[]>([
    'Grade 01', 'Grade 02', 'Grade 03', 'Grade 04', 'Grade 05', 'Grade 06',
    'Grade 07', 'Grade 08', 'Grade 09', 'Grade 10', 'Grade 11', 'Grade 12'
  ]);
  const adminService = useAdminService();
  const tripService = useTripService();
  const studentService = useStudentService();

  // Check authentication on component mount
  useEffect(() => {
    const checkAndLoad = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setError('Authentication required. Please log in to access this page.');
        setLoading(false);
      } else {
        setIsAuthenticated(true);
        await fetchStudents();
        await fetchParents();
      }
    };
    
    checkAndLoad();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Convert numeric strings to numbers for number fields
    if (name === 'parentId' || name === 'schoolId' || name === 'seatNumber') {
      const numValue = value === '' ? null : Number(value);
      setFormData({
        ...formData,
        [name]: numValue
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Open modal with specified type
  const openModal = (type: 'add' | 'edit' | 'view' | 'delete' | 'restore' | 'record-attendance', student?: Student) => {
    setModalType(type);
    setModalVisible(true);
    setOperationStatus({
      loading: false,
      success: false,
      error: null
    });
    
    // Get school ID from localStorage
    const schoolIdFromStorage = localStorage.getItem('schoolId');
    const schoolId = schoolIdFromStorage ? parseInt(schoolIdFromStorage, 10) : 1;
    
    if (student) {
      setSelectedStudent(student);
      
      if (type === 'edit' || type === 'view') {
        setFormData({
          firstName: student.firstName || '',
          lastName: student.lastName || '',
          dateOfBirth: student.dateOfBirth || '',
          grade: student.grade || '',
          parentId: student.parentId,
          schoolId: student.schoolId || schoolId,
          seatNumber: student.seatNumber || null,
          isActive: student.isActive
        });
      } else if (type === 'record-attendance') {
        setFormData({
          ...formData,
          firstName: student.firstName || '',
          lastName: student.lastName || '',
          grade: student.grade || '',
        });
      }
    } else {
      setSelectedStudent(null);
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        grade: '',
        parentId: 0,
        schoolId: schoolId,
        seatNumber: null,
        isActive: true
      });
    }
  };

  // Close modal
  const closeModal = () => {
    setModalVisible(false);
  };

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

  // Fetch all students from API
  const fetchStudents = async () => {
    // Only proceed if authenticated
    if (!checkAuthentication()) return;
    
    setLoading(true);
    setError(null);
    
    try {

      const response = await studentService.findBySchoolId(getSchoolId());
      console.log("API response received:", response);
      
      const studentsData = response;
      
      // Check if each student has trips assigned
      const studentsWithTripInfo = await Promise.all(
        studentsData.map(async (student: any) => {
          try {
            const trips = await tripService.findByStudentId(student.id);
            
            // Determine if the student is active, with a safe fallback to false
            let isActive = false;
            
            if (student.isActive !== undefined) {
              isActive = Boolean(student.isActive);
            } else if (student.active !== undefined) {
              isActive = Boolean(student.active);
            } else if (student.status !== undefined) {
              isActive = student.status === 'ACTIVE';
            }
            
            console.log(`Student ${student.id} (${student.firstName}): isActive=${isActive}`);
            
            return {
              ...student,
              hasTrip: trips && trips.length > 0,
              isActive: isActive,
              schoolId: getSchoolId()
            };
          } catch (err) {
            console.warn(`Could not fetch trips for student ${student.id}:`, err);
            
            // Default to inactive if there was an error
            return {
              ...student,
              hasTrip: false,
              isActive: false,
              schoolId: getSchoolId()
            };
          }
        })
      );
      
      // Debug the students data to verify isActive property
      console.log('Processed students with isActive:', studentsWithTripInfo);
      
      setStudents(studentsWithTripInfo);
    } catch (err: any) {
      console.error('Error fetching students', err);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        setIsAuthenticated(false);
        setError('Authentication required or session expired. Please log in again.');
      } else {
        setError('Error fetching students. Please try again later.');
      }
      
      // Always set students to an empty array on error to avoid filtering errors
      setStudents([]);
    } finally {
      console.log("Setting loading to false");
      setLoading(false);
    }
  };

  const getSchoolId = () => {
    const schoolFromStorage = JSON.parse(localStorage.getItem('school') || '{}');
    return schoolFromStorage.id;
  };

  // Fetch all parents using adminService
  const fetchParents = async () => {
    // Only proceed if authenticated
    if (!checkAuthentication()) return;
    
    try {
      console.log("Fetching parents using adminService...");
      const parentsData = await adminService.getAllParents();
      console.log("Parents data received:", parentsData);
      
      if (Array.isArray(parentsData)) {
        setParents(parentsData);
        console.log("Parents loaded:", parentsData.length);
      } else {
        console.warn('Unexpected API response format for parents:', parentsData);
        setParents([]);
      }
    } catch (err: any) {
      console.error('Error fetching parents', err);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        setIsAuthenticated(false);
        setError('Authentication required or session expired. Please log in again.');
      } else {
        console.error('Error fetching parents list. Please try again later.');
      }
      
      // Set parents to an empty array on error
      setParents([]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Set loading state
    setOperationStatus({
      loading: true,
      success: false,
      error: null
    });
    
    // Create validations
    if (modalType === 'add' || modalType === 'edit') {
      if (!formData.firstName.trim()) {
        setOperationStatus({
          loading: false,
          success: false,
          error: 'First name is required'
        });
        return;
      }
      
      if (!formData.lastName.trim()) {
        setOperationStatus({
          loading: false,
          success: false,
          error: 'Last name is required'
        });
        return;
      }

      if (!formData.parentId) {
        setOperationStatus({
          loading: false,
          success: false,
          error: 'Parent ID is required'
        });
        return;
      }
    }
    
    try {
      // Get the JWT token from localStorage
      const token = localStorage.getItem('token');
      
      // Create headers with the JWT token
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      
      if (modalType === 'add') {
        console.log('Creating student with data:', formData);
        
        // Format the date properly if it's provided
        let dateOfBirth = formData.dateOfBirth;
        if (dateOfBirth && dateOfBirth.includes('-')) {
          // Keep the date as is, it's already in ISO format
        } else if (dateOfBirth) {
          // Try to convert it to ISO format if needed
          const date = new Date(dateOfBirth);
          if (!isNaN(date.getTime())) {
            dateOfBirth = date.toISOString().split('T')[0];
          }
        }
        
        // Create the request payload
        const studentData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: dateOfBirth,
          grade: formData.grade,
          parentId: formData.parentId,
          schoolId: formData.schoolId,
          isActive: formData.isActive
        };
        
        console.log('Sending student data:', studentData);
        
        // Note: seatNumber is not sent during creation as it's assigned later with a route
        const response = await axios.post('http://localhost:8080/api/v1/students', studentData, { headers });
        
        console.log('Student creation response:', response);
        
        setOperationStatus({
          loading: false,
          success: true,
          error: null
        });
        
        // Reset form and close modal
        resetForm();
        closeModal();
        
        // Refresh the list
        await fetchStudents();
      } else if (modalType === 'edit' && selectedStudent) {
        console.log('Updating student with data:', formData);
        
        // Format the date properly if it's provided
        let dateOfBirth = formData.dateOfBirth;
        if (dateOfBirth && dateOfBirth.includes('-')) {
          // Keep the date as is, it's already in ISO format
        } else if (dateOfBirth) {
          // Try to convert it to ISO format if needed
          const date = new Date(dateOfBirth);
          if (!isNaN(date.getTime())) {
            dateOfBirth = date.toISOString().split('T')[0];
          }
        }
        
        // Create the request payload
        const studentData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: dateOfBirth,
          grade: formData.grade,
          parentId: formData.parentId,
          schoolId: formData.schoolId,
          isActive: formData.isActive
        };
        
        await axios.put(`http://localhost:8080/api/v1/students/${selectedStudent.id}`, studentData, { headers });
        
        setOperationStatus({
          loading: false,
          success: true,
          error: null
        });
        
        // Reset form and close modal
        resetForm();
        closeModal();
        
        // Refresh the list
        await fetchStudents();
      } else if (modalType === 'record-attendance' && selectedStudent) {
        if (!selectedStudent.hasTrip) {
          setOperationStatus({
            loading: false,
            success: false,
            error: "Cannot record attendance for a student who is not assigned to a trip."
          });
          return;
        }
        
        try {
          await axios.post(`http://localhost:8080/api/v1/attendance/record`, {
            studentId: selectedStudent.id,
            tripId: 1, // Use a default tripId or fetch from an API if available
            status: formData.grade,
            notes: "Attendance recorded manually by admin"
          }, { headers });
          
          setOperationStatus({
            loading: false,
            success: true,
            error: null
          });
          
          // Reset form and close modal
          setFormData({
            ...formData,
            grade: ''
          });
          setTimeout(() => {
            closeModal();
            fetchStudents();
          }, 1000);
        } catch (err: any) {
          console.error('Error recording attendance:', err);
          
          let errorMessage = 'Failed to record attendance.';
          
          if (err.response?.data?.message) {
            errorMessage = err.response.data.message;
          }
          
          setOperationStatus({
            loading: false,
            success: false,
            error: errorMessage
          });
        }
      } else if (modalType === 'delete' && selectedStudent) {
        try {
          await axios.delete(`http://localhost:8080/api/v1/students/${selectedStudent.id}`, 
            { headers }
          );
          
          setOperationStatus({
            loading: false,
            success: true,
            error: null
          });
          
          // Close modal and refresh list
          setTimeout(() => {
            closeModal();
            fetchStudents();
          }, 1000);
        } catch (err: any) {
          console.error('Error deleting student:', err);
          
          let errorMessage = 'Failed to delete student.';
          
          if (err.response?.status === 409 || (err.response?.data?.message && err.response?.data?.message.includes('constraint'))) {
            errorMessage = 'Cannot delete student because they have related records (attendance or trips). Try deactivating the student instead.';
          } else if (err.response?.data?.message) {
            errorMessage = err.response.data.message;
          }
          
          setOperationStatus({
            loading: false,
            success: false,
            error: errorMessage
          });
        }
      } else if (modalType === 'restore' && selectedStudent) {
        await handleRestore(selectedStudent.id);
      }
    } catch (err: any) {
      console.error('Error during operation', err);
      
      let errorMessage = 'Error during operation. Please try again.';
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        errorMessage = 'Authentication required or session expired. Please log in again.';
        setIsAuthenticated(false);
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setOperationStatus({
        loading: false,
        success: false,
        error: errorMessage
      });
    }
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      grade: '',
      parentId: 0,
      schoolId: 1,
      seatNumber: null,
      isActive: true
    });
    setSelectedStudent(null);
  };

  // Safe filter function with null/undefined checks
  const getFilteredStudents = () => {
    if (!Array.isArray(students)) {
      console.warn('students is not an array:', students);
      return [];
    }
    
    return students.filter(student => {
      if (!student) return false;
      
      const fullName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase();
      const searchText = searchQuery.toLowerCase();
      
      const matchesSearch = searchQuery === '' || 
        fullName.includes(searchText);
        
      const matchesGrade = filterGrade === '' || student.grade === filterGrade;
      
      const matchesAttendance = filterAttendance === '' || 
        student.grade === filterAttendance;

      const matchesSchool = getSchoolId() === '' || student.schoolId === getSchoolId();
        
      return matchesSearch && matchesGrade && matchesAttendance && matchesSchool;
    });
  };

  // Get filtered students safely
  const filteredStudents = getFilteredStudents();

  // Get unique grade values for filter dropdown (with safety check)
  const gradeOptions = Array.isArray(students) 
    ? Array.from(new Set(students.map(student => student?.grade || ''))).filter(Boolean)
    : [];

  // Render modal content based on type
  const renderModalContent = () => {
    switch (modalType) {
      case 'add':
        return (
          <div className="modal-content">
            <h3>Add New Student</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="firstName">First Name <span className="required">*</span></label>
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
                <label htmlFor="lastName">Last Name <span className="required">*</span></label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth <span className="required">*</span></label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="grade">Grade <span className="required">*</span></label>
                <select
                  id="grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  required
                  aria-label="Select student grade"
                >
                  <option value="">Select Grade</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="parentId">Parent <span className="required">*</span></label>
                <select
                  id="parentId"
                  name="parentId"
                  value={formData.parentId || ''}
                  onChange={handleInputChange}
                  required
                  aria-label="Select student's parent"
                >
                  <option value="">Select Parent</option>
                  {parents.map(parent => (
                    <option key={parent.id} value={parent.id}>
                      {parent.firstName} {parent.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="seatNumber">Seat Number</label>
                <input
                  type="number"
                  id="seatNumber"
                  name="seatNumber"
                  value={formData.seatNumber || ''}
                  onChange={handleInputChange}
                  disabled
                />
                <small className="field-note">Seat number is assigned when a route is assigned to the student.</small>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={operationStatus.loading}>
                  {operationStatus.loading ? 'Adding...' : 'Add Student'}
                </button>
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
              </div>
              {operationStatus.error && (
                <div className="operation-message error">
                  {operationStatus.error}
                </div>
              )}
            </form>
          </div>
        );
        
      case 'edit':
        return (
          <div className="modal-content">
            <h3>Edit Student</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="firstName">First Name <span className="required">*</span></label>
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
                <label htmlFor="lastName">Last Name <span className="required">*</span></label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth <span className="required">*</span></label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="grade">Grade <span className="required">*</span></label>
                <select
                  id="grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  required
                  aria-label="Select student grade"
                >
                  <option value="">Select Grade</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="parentId">Parent <span className="required">*</span></label>
                <select
                  id="parentId"
                  name="parentId"
                  value={formData.parentId || ''}
                  onChange={handleInputChange}
                  required
                  aria-label="Select student's parent"
                >
                  <option value="">Select Parent</option>
                  {parents.map(parent => (
                    <option key={parent.id} value={parent.id}>
                      {parent.firstName} {parent.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="seatNumber">Seat Number</label>
                <input
                  type="number"
                  id="seatNumber"
                  name="seatNumber"
                  value={formData.seatNumber || ''}
                  onChange={handleInputChange}
                  disabled
                />
                <small className="field-note">Seat number is assigned when a route is assigned to the student.</small>
              </div>
              <div className="form-group status-toggle">
                <label>
                  <span>Status: </span>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    />
                    <label htmlFor="isActive" className="toggle-label">
                      <span className="toggle-inner"></span>
                      <span className="toggle-switch-label">{formData.isActive ? 'Active' : 'Inactive'}</span>
                    </label>
                  </div>
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={operationStatus.loading}>
                  {operationStatus.loading ? 'Updating...' : 'Update Student'}
                </button>
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
              </div>
              {operationStatus.error && (
                <div className="operation-message error">
                  {operationStatus.error}
                </div>
              )}
            </form>
          </div>
        );
        
      case 'view':
        return selectedStudent ? (
          <div className="modal-content view-mode">
            <h3>Student Details</h3>
            <div className="student-details">
              <div className="details-row">
                <span className="label">ID:</span>
                <span className="value">{selectedStudent.id}</span>
              </div>
              <div className="details-row">
                <span className="label">Name:</span>
                <span className="value">{selectedStudent.firstName} {selectedStudent.lastName}</span>
              </div>
              <div className="details-row">
                <span className="label">Date of Birth:</span>
                <span className="value">{selectedStudent.dateOfBirth || 'Not provided'}</span>
              </div>
              <div className="details-row">
                <span className="label">Grade:</span>
                <span className="value">{selectedStudent.grade || 'Not assigned'}</span>
              </div>
              <div className="details-row">
                <span className="label">Seat Number:</span>
                <span className="value">{selectedStudent.seatNumber || 'Not assigned'}</span>
              </div>
              <div className="details-row">
                <span className="label">Parent ID:</span>
                <span className="value">{selectedStudent.parentId}</span>
              </div>
              <div className="details-row">
                <span className="label">School ID:</span>
                <span className="value">{selectedStudent.schoolId}</span>
              </div>
              <div className="details-row">
                <span className="label">Trip Status:</span>
                <span className="value">{selectedStudent.hasTrip ? 'Assigned to trip' : 'No trip assigned'}</span>
              </div>
              <div className="details-row">
                <span className="label">Status:</span>
                <span className={`value status-indicator ${selectedStudent.isActive ? 'active' : 'inactive'}`}>
                  {selectedStudent.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            
            {/* Display QR code section only if QR code exists or seat number is assigned */}
            {(selectedStudent.qrCode || selectedStudent.seatNumber) ? (
              <div className="qr-code-container">
                <h4>Student QR Code</h4>
                <div className="qr-code">
                  <QRCodeSVG 
                    id={`qrcode-${selectedStudent.id}`}
                    value={selectedStudent.qrCode || `NIMBUS-STD-${selectedStudent.id}`} 
                    size={150}
                    level="H"
                  />
                </div>
                {/* Only show download button if student has QR code */}
                {selectedStudent.qrCode && (
                  <button 
                    className="btn-secondary"
                    onClick={() => downloadQRCode(selectedStudent.id)}
                  >
                    Download QR Code
                  </button>
                )}
                {/* Show generate button if student has seat number but no QR code */}
                {selectedStudent.seatNumber && !selectedStudent.qrCode && (
                  <button 
                    className="btn-primary"
                    onClick={() => generateQRCode(selectedStudent.id)}
                  >
                    Generate QR Code
                  </button>
                )}
              </div>
            ) : (
              <div className="qr-code-container">
                <h4>QR Code Not Available</h4>
                <p>QR code will be available after a seat number is assigned.</p>
              </div>
            )}
            
            <div className="form-actions">
              <button
                className="btn-secondary"
                onClick={() => {
                  setSelectedStudent(null);
                  closeModal();
                }}
              >
                Close
              </button>
              <button 
                className="btn-primary"
                onClick={() => {
                  closeModal();
                  openModal('edit', selectedStudent);
                }}
              >
                Edit
              </button>
            </div>
          </div>
        ) : null;
        
      case 'delete':
        return selectedStudent ? (
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this student?</p>
            
            <div className="student-details">
              <div className="details-row">
                <span className="label">Name:</span>
                <span className="value">{selectedStudent.firstName} {selectedStudent.lastName}</span>
              </div>
              <div className="details-row">
                <span className="label">Grade:</span>
                <span className="value">{selectedStudent.grade || 'Not assigned'}</span>
              </div>
            </div>
            
            <p className="warning">⚠️ This action cannot be undone. All associated data will be permanently deleted.</p>
            
            {operationStatus.error && (
              <div className="operation-message error">
                {operationStatus.error}
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
                disabled={operationStatus.loading}
              >
                {operationStatus.loading ? 'Deleting...' : 'Delete Student'}
              </button>
            </div>
          </div>
        ) : null;
        
      case 'restore':
        return selectedStudent ? (
          <div className="modal-content">
            <h3>Restore Student</h3>
            <p>Are you sure you want to restore this inactive student?</p>
            
            <div className="student-details">
              <div className="details-row">
                <span className="label">Name:</span>
                <span className="value">{selectedStudent.firstName} {selectedStudent.lastName}</span>
              </div>
              <div className="details-row">
                <span className="label">Grade:</span>
                <span className="value">{selectedStudent.grade || 'Not assigned'}</span>
              </div>
              <div className="details-row">
                <span className="label">Status:</span>
                <span className={`value status-indicator inactive`}>
                  Inactive
                </span>
              </div>
            </div>
            
            <p>Restoring this student will make them active in the system again.</p>
            
            {operationStatus.error && (
              <div className="operation-message error">
                {operationStatus.error}
              </div>
            )}
            
            {operationStatus.success && (
              <div className="operation-message success">
                Student restored successfully!
              </div>
            )}
            
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-primary restore-btn" 
                onClick={() => handleRestore(selectedStudent.id)}
                disabled={operationStatus.loading}
              >
                {operationStatus.loading ? 'Restoring...' : 'Restore Student'}
              </button>
            </div>
          </div>
        ) : null;
        
      case 'record-attendance':
        return selectedStudent ? (
          <div className="modal-content">
            <h3>Record Attendance</h3>
            
            <div className="student-details">
              <div className="details-row">
                <span className="label">Student:</span>
                <span className="value">{selectedStudent.firstName} {selectedStudent.lastName}</span>
              </div>
              <div className="details-row">
                <span className="label">Grade:</span>
                <span className="value">{selectedStudent.grade || 'Not assigned'}</span>
              </div>
              <div className="details-row">
                <span className="label">Trip Status:</span>
                <span className="value">{selectedStudent.hasTrip ? 'Assigned to trip' : 'No trip assigned'}</span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="status">Attendance Status <span className="required">*</span></label>
                <select
                  id="status"
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Status</option>
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                  <option value="LATE">Late</option>
                  <option value="EXCUSED">Excused</option>
                </select>
              </div>
              
              {operationStatus.error && (
                <div className="operation-message error">
                  {operationStatus.error}
                </div>
              )}
              
              {operationStatus.success && (
                <div className="operation-message success">
                  Attendance recorded successfully!
                </div>
              )}
              
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={operationStatus.loading || !formData.grade}>
                  {operationStatus.loading ? 'Recording...' : 'Record Attendance'}
                </button>
              </div>
            </form>
          </div>
        ) : null;
        
      default:
        return null;
    }
  };

  // Render student list item
  const renderStudentListItem = (student: Student) => {
    // Get initials for the avatar
    const initials = student.firstName.charAt(0) + student.lastName.charAt(0);
    
    // Use the isActive property directly from the student object, which is now a boolean
    const isActive = student.isActive;
    
    console.log(`Rendering student ${student.id} (${student.firstName}): isActive=${isActive}`);
    
    return (
      <div className={`student-card ${!isActive ? 'inactive-card' : ''}`} key={student.id}>
        <div className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
          {isActive ? 'Active' : 'Inactive'}
        </div>
        <div className="student-info">
          <div className="student-header">
            <div className="student-avatar">
              {initials}
            </div>
            <h3>{student.firstName} {student.lastName}</h3>
          </div>
          
          <div className="student-details-list">
            <p>
              <strong>Grade:</strong>
              <span>{student.grade || 'Not assigned'}</span>
            </p>
            <p>
              <strong>Seat Number:</strong>
              <span>{student.seatNumber || 'Not assigned'}</span>
            </p>
            <p>
              <strong>QR Code:</strong>
              <span>{student.qrCode ? 'Available' : 'Not available'}</span>
            </p>
            <p>
              <strong>Trip Status:</strong>
              <span className={`status-indicator ${student.hasTrip ? 'active' : 'inactive'}`}>
                {student.hasTrip ? 'Assigned to trip' : 'No trip assigned'}
              </span>
            </p>
            <p>
              <strong>Status:</strong>
              <span className={`status-indicator ${isActive ? 'active' : 'inactive'}`}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </p>
          </div>
        </div>
        <div className="student-actions">
          <button 
            className="action-btn view"
            onClick={() => openModal('view', student)}
            aria-label="View student details"
          >
            View
          </button>
          <button 
            className="action-btn edit"
            onClick={() => openModal('edit', student)}
            aria-label="Edit student details"
          >
            Edit
          </button>
          {student.hasTrip && isActive && (
            <button 
              className="action-btn record"
              onClick={() => openModal('record-attendance', student)}
              aria-label="Record attendance"
            >
              Attendance
            </button>
          )}
          <button 
            className={`action-btn ${isActive ? 'delete' : 'restore'}`}
            onClick={() => openModal(isActive ? 'delete' : 'restore', student)}
            aria-label={isActive ? "Delete student" : "Restore student"}
          >
            {isActive ? 'Delete' : 'Restore'}
          </button>
        </div>
      </div>
    );
  };

  // Download QR code as image
  const downloadQRCode = (studentId: number) => {
    const qrCodeId = `qrcode-${studentId}`;
    const qrCodeElement = document.getElementById(qrCodeId);
    
    if (qrCodeElement) {
      // Get the SVG content
      const svgData = new XMLSerializer().serializeToString(qrCodeElement);
      
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Create an image element from the SVG
      const img = new Image();
      img.onload = () => {
        // Set canvas dimensions
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the image on the canvas
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          
          // Convert canvas to blob and download
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `student-qrcode-${studentId}.png`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }
          });
        }
      };
      
      // Set the image source to the SVG data
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  // Generate QR code for student
  const generateQRCode = async (studentId: number) => {
    // Only proceed if authenticated
    if (!checkAuthentication()) return;
    
    try {
      // Get the JWT token from localStorage
      const token = localStorage.getItem('token');
      
      // Create headers with the JWT token
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      
      // Call API to generate QR code
      await axios.post(`http://localhost:8080/api/v1/students/${studentId}/qrcode`, {}, { headers });
      
      // Refresh the students list to get the updated QR code
      await fetchStudents();
      
      // If modal is open with the same student, close and reopen to refresh
      if (selectedStudent && selectedStudent.id === studentId) {
        const student = students.find(s => s.id === studentId);
        if (student) {
          closeModal();
          openModal('view', student);
        }
      }
    } catch (err: any) {
      console.error('Error generating QR code', err);
      
      let errorMessage = 'Error generating QR code. Please try again.';
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        errorMessage = 'Authentication required or session expired. Please log in again.';
        setIsAuthenticated(false);
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      // Show error in alert for now
      alert(errorMessage);
    }
  };


  // Add a handler for the restore action
  const handleRestore = async (studentId: number) => {
    if (!selectedStudent) return;
    
    setOperationStatus({
      loading: true,
      success: false,
      error: null
    });
    
    try {
      // Get the JWT token from localStorage
      const token = localStorage.getItem('token');
      
      // Create headers with the JWT token
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      console.log('Attempting to restore student ID:', studentId);

      // Create a focused update payload with only the necessary fields
      // The controller is expecting a StudentRequest object
      const updateData = {
        firstName: selectedStudent.firstName,
        lastName: selectedStudent.lastName,
        dateOfBirth: selectedStudent.dateOfBirth,
        grade: selectedStudent.grade,
        parentId: selectedStudent.parentId, 
        schoolId: selectedStudent.schoolId
      };
      
      // Use a direct query with the student service first
      try {
        console.log('Sending direct update to activate student');
        await axios.put(
          `http://localhost:8080/api/v1/students/${studentId}/active?active=true`,
          null,
          { headers }
        );
      } catch (activateErr) {
        console.log('Direct activation failed, using standard update approach', activateErr);
        
        // Fall back to normal update - but this might not preserve parent/school relationships
        await axios.put(
          `http://localhost:8080/api/v1/students/${studentId}`,
          updateData,
          { headers }
        );
      }
      
      console.log('Student restored successfully');
      
      // Update was successful
      setOperationStatus({
        loading: false,
        success: true,
        error: null
      });
      
      // Close modal and refresh list after a short delay
      setTimeout(() => {
        closeModal();
        fetchStudents();
      }, 1000);
    } 
    catch (err: any) {
      console.error('Error restoring student:', err);
      
      let errorMessage = 'Failed to restore student. Try editing the student and changing the status directly.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (typeof err.response?.data === 'string') {
        errorMessage = err.response.data;
      }
      
      setOperationStatus({
        loading: false,
        success: false,
        error: errorMessage
      });
    }
  };

  const renderContent = () => {
    
    if (loading) {
      return (
        <div className="loading-container">
          <span>Loading students...</span>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="error-message">
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchStudents}>
            Try Again
          </button>
        </div>
      );
    }
    
    if (filteredStudents.length === 0) {
      // Different message based on whether there are any students or not
      if (students.length === 0) {
        return (
          <div className="empty-state">
            <p>No students found in the database.</p>
            <button className="btn-primary" onClick={() => openModal('add')}>
              Add New Student
            </button>
          </div>
        );
      } else {
        return (
          <div className="empty-state">
            <p>No students match your search criteria.</p>
            <button className="btn-secondary" onClick={() => {
              setSearchQuery('');
              setFilterGrade('');
              setFilterAttendance('');
            }}>
              Clear Filters
            </button>
          </div>
        );
      }
    }
    
    return (
      <div className="students-grid">
        {filteredStudents.map(student => renderStudentListItem(student))}
      </div>
    );
  };

  return (
    <div className="students-list-container">
      {isAuthenticated && students.length > 0 && (
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
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              aria-label="Filter by grade"
            >
              <option value="">All Grades</option>
              {gradeOptions.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>
          {isAuthenticated && (
            <button className="btn-primary add-button" onClick={() => openModal('add')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Add New Student</span>
            </button>
          )}
        </div>
      )}
      
      {renderContent()}
      
      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal">
            {renderModalContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsList;