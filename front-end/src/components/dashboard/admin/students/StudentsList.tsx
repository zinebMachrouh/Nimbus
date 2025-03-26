import React, { FC, useState, useEffect } from 'react';
import './StudentsList.css';
import { QRCodeSVG } from 'qrcode.react';
import { 
  useAdminService, 
  useStudentService, 
  useTripService, 
  useAuthService,
  useAttendanceService 
} from '../../../../contexts/ServiceContext';
import { useToast } from '../../../../contexts/ToastContext';
import { Student } from '../../../../core/entities/student.entity';
import { AttendanceStatus } from '../../../../core/entities/attendance.entity';
import { Parent } from '../../../../core/entities/parent.entity';
import { School } from '../../../../core/entities/school.entity';

// Types
interface FormData {
  id?: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  grade: string;
  parentId: number;
  schoolId: number;
  seatNumber?: number | null;
  active: boolean;
  parent?: Parent;
  school?: School;
}

interface OperationStatus {
  loading: boolean;
  success: boolean;
  error: string | null;
  message?: string;
}

type ModalType = 'add' | 'edit' | 'view' | 'delete' | 'restore' | 'record-attendance';

// Constants
const GRADES = [
  'Grade 01', 'Grade 02', 'Grade 03', 'Grade 04', 'Grade 05', 'Grade 06',
  'Grade 07', 'Grade 08', 'Grade 09', 'Grade 10', 'Grade 11', 'Grade 12'
];

const StudentsList: FC = () => {
  // Services
  const adminService = useAdminService();
  const tripService = useTripService();
  const studentService = useStudentService();
  const authService = useAuthService();
  const attendanceService = useAttendanceService();
  const { showToast } = useToast();

  // State
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('add');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [parents, setParents] = useState<Parent[]>([]);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    grade: '',
    parentId: 0,
    schoolId: 0,
    seatNumber: null,
    active: true
  });
  const [operationStatus, setOperationStatus] = useState<OperationStatus>({
    loading: false,
    success: false,
    error: null
  });
  const [filter, setFilter] = useState('');

  // Effects
  useEffect(() => {
    const initializeData = async () => {
      if (authService.isAuthenticated()) {
        await Promise.all([
          fetchStudents(),
          fetchParents()
        ]);
      } else {
        setError('Authentication required. Please log in to access this page.');
      }
    };
    
    initializeData();
  }, []);

  useEffect(() => {
    console.log('Filters changed:', { searchQuery, filterGrade, filter });
    const filtered = getFilteredStudents();
    console.log('Filtered students:', filtered.length);
    setFilteredStudents(filtered);
  }, [students, searchQuery, filterGrade, filter]);

  // Helper Functions
  function getInitialFormData(): FormData {
    const schoolId = getSchoolId();
    return {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        grade: '',
        parentId: 0,
      schoolId : schoolId,
        seatNumber: null,
        active: true
    };
  }

  function getSchoolId(): number {
    try {
      const schoolData = JSON.parse(localStorage.getItem('school') || '{}');
      return schoolData.id || 0;
    } catch (err) {
      console.error('Error parsing school data:', err);
      return 0;
    }
  }

  // Data Fetching Functions
  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
    
      const schoolId = getSchoolId();
      console.log('Fetching students for school:', schoolId);
      if (!schoolId) {
        throw new Error('School ID not found');
      }

      const studentsData = await studentService.findBySchoolId(schoolId);
      console.log('Raw students data:', studentsData);
      
      const studentsWithTripInfo = await Promise.all(
        studentsData.map(async (student) => {
          try {
            const trips = await tripService.findByStudentId(student.id);
            return {
              ...student,
              hasTrip: Boolean(trips && trips.length > 0),
              active: student.active === true,
              school: student.school || { id: schoolId },
              grade: student.grade || '',
              firstName: student.firstName || '',
              lastName: student.lastName || ''
            };
          } catch (err) {
            console.warn(`Could not fetch trips for student ${student.id}:`, err);
            return {
              ...student,
              hasTrip: false,
              active: student.active === true,
              school: student.school || { id: schoolId },
              grade: student.grade || '',
              firstName: student.firstName || '',
              lastName: student.lastName || ''
            };
          }
        })
      );
      
      console.log('Processed students with trip info:', studentsWithTripInfo);
      setStudents(studentsWithTripInfo);
      setFilteredStudents(studentsWithTripInfo);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error fetching students';
      console.error('Error in fetchStudents:', err);
      setError(errorMessage);
      showToast('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchParents = async () => {
    try {
      const parentsData = await adminService.getAllParents();
      setParents(Array.isArray(parentsData) ? parentsData : []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error fetching parents';
      showToast('error', errorMessage);
    }
  };

  // Event Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericFields = ['parentId', 'schoolId', 'seatNumber'];
    
    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? (value === '' ? null : Number(value)) : value
    }));
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilter(value);
    
    let filtered = students;
    if (value === 'active') {
      filtered = students.filter(student => student.active);
    } else if (value === 'inactive') {
      filtered = students.filter(student => !student.active);
    } else if (value === 'withTrip') {
      filtered = students.filter(student => student.hasTrip);
    } else if (value === 'withoutTrip') {
      filtered = students.filter(student => !student.hasTrip);
    }
    
    setFilteredStudents(filtered);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleSubmitAction();
  };

  const handleButtonClick = async () => {
    await handleSubmitAction();
  };

  const handleSubmitAction = async () => {
    setLoading(true);
    setError(null);

    try {
      const studentData = {
        ...formData,
        parent: { id: formData.parentId },
        school: { id: formData.schoolId }
      };

      if (selectedStudent) {
        await studentService.updateStudent(selectedStudent.id, studentData);
      } else {
        await studentService.createStudent(studentData);
      }

      await fetchStudents();
      closeModal();
      showToast('success', `Student successfully ${selectedStudent ? 'updated' : 'created'}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      showToast('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // CRUD Operations
  const handleCreate = async () => {
    validateFormData();
    await studentService.createStudent(formData);
  };

  const handleUpdate = async () => {
    if (!selectedStudent) return;
    validateFormData();
    await studentService.updateStudent(selectedStudent.id, formData);
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;
    await studentService.deleteStudent(selectedStudent.id);
  };

  const handleRestore = async () => {
    if (!selectedStudent) return;
    await studentService.updateStudent(selectedStudent.id, { ...formData, isActive: true });
  };

  const handleRecordAttendance = async () => {
    if (!selectedStudent || !formData.grade) return;
    
    await attendanceService.recordAttendance({
            studentId: selectedStudent.id,
      tripId: selectedStudent.hasTrip ? 1 : 0,
      status: formData.grade as AttendanceStatus,
      schoolId: getSchoolId(),
            notes: "Attendance recorded manually by admin"
    });
  };

  // QR Code Functions
  const generateQRCode = async (studentId: number) => {
    try {
      await studentService.generateQrCode(studentId);
      await fetchStudents();
      showToast('success', 'QR Code generated successfully');
        } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to generate QR Code');
    }
  };

  const downloadQRCode = async (studentId: number) => {
    try {
      const qrCodeElement = document.getElementById(`qrcode-${studentId}`);
      if (!qrCodeElement) throw new Error('QR code element not found');

      const svgData = new XMLSerializer().serializeToString(qrCodeElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      canvas.width = 300;
      canvas.height = 300;

      await new Promise((resolve, reject) => {
        img.onload = () => {
          if (ctx) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            const link = document.createElement('a');
            link.download = `student-qr-${studentId}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            resolve(true);
          } else {
            reject(new Error('Could not get canvas context'));
          }
        };
        img.onerror = () => reject(new Error('Error loading QR code image'));
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
      });

      showToast('success', 'QR Code downloaded successfully');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to download QR Code');
    }
  };

  // Modal Functions
  const openModal = (type: ModalType, student?: Student) => {
    setModalType(type);
    setModalVisible(true);
    setOperationStatus({ loading: false, success: false, error: null });
    
    if (student) {
      setSelectedStudent(student);
      setFormData({
        firstName: student.firstName,
        lastName: student.lastName,
        dateOfBirth: student.dateOfBirth,
        grade: student.grade,
        parentId: student.parent?.id,
        schoolId: student.school?.id,
        seatNumber: student.seatNumber,
        active: student.active
      });
    } else {
      setSelectedStudent(null);
      setFormData(getInitialFormData());
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedStudent(null);
    setFormData(getInitialFormData());
    setOperationStatus({ loading: false, success: false, error: null });
  };

  // Validation
  const validateFormData = () => {
    if (!formData.firstName?.trim()) throw new Error('First name is required');
    if (!formData.lastName?.trim()) throw new Error('Last name is required');
    if (!formData.parentId) throw new Error('Parent is required');
    if (!formData.grade?.trim()) throw new Error('Grade is required');
  };

  const getFilteredStudents = () => {
    console.log('Filtering students with:', {
      searchQuery,
      filterGrade,
      filter,
      totalStudents: students.length
    });

    if (!Array.isArray(students)) {
      console.warn('Students is not an array:', students);
      return [];
    }
    
    return students.filter(student => {
      if (!student) {
        console.warn('Found null student in array');
        return false;
      }
      
      // Name search filter
      const fullName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase();
      const searchText = searchQuery.toLowerCase();
      const matchesSearch = !searchText || fullName.includes(searchText);
      
      // Grade filter
      const matchesGrade = !filterGrade || student.grade === filterGrade;
      
      // School filter
      const schoolData = JSON.parse(localStorage.getItem('school') || '{}');
      const currentSchoolId = schoolData.id || 0;
      const matchesSchool = !currentSchoolId || student.school?.id === currentSchoolId;
      
      // Status and trip filters
      let matchesFilter = true;
      if (filter === 'active') {
        matchesFilter = Boolean(student.active);
      } else if (filter === 'inactive') {
        matchesFilter = !student.active;
      } else if (filter === 'withTrip') {
        matchesFilter = Boolean(student.hasTrip);
      } else if (filter === 'withoutTrip') {
        matchesFilter = !student.hasTrip;
      }

      const shouldInclude = matchesSearch && matchesGrade && matchesSchool && matchesFilter;
      console.log('Filter result for student:', {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        matchesSearch,
        matchesGrade,
        matchesSchool,
        matchesFilter,
        shouldInclude
      });
      
      return shouldInclude;
    });
  };

  const gradeOptions = Array.from(new Set(students.map(s => s?.grade || ''))).filter(Boolean);

  const renderStudentListItem = (student: Student) => {
    const initials = `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`;
    
        return (
      <div className={`student-card ${!student.active ? 'inactive-card' : ''}`} key={student.id}>
        <div className={`status-badge ${student.active ? 'active' : 'inactive'}`}>
          {student.active ? 'Active' : 'Inactive'}
              </div>
        <div className="student-info">
          <div className="student-header">
            <div className="student-avatar">{initials}</div>
            <h3>{student.firstName} {student.lastName}</h3>
              </div>
          <div className="student-details-list">
            <p><strong>Grade</strong> <span>{student.grade || 'Not assigned'}</span></p>
            <p><strong>Seat</strong> <span>{student.currentTrip?.attendances?.find(a => a.student.id === student.id)?.seatNumber || 'Not assigned'}</span></p>
            <p><strong>QR Code</strong> <span>{student.qrCode ? 'Available' : 'Not available'}</span></p>
            <div className="trip-status">
              <strong>Trip Status</strong>
              <span className={`status-indicator ${student.hasTrip ? 'active' : 'inactive'}`}>
                {student.hasTrip ? 'Assigned to trip' : 'No trip assigned'}
              </span>
              </div>
              </div>
              </div>
        <div className="student-actions">
          <button className="action-btn view" onClick={() => openModal('view', student)}>
            View
                </button>
          <button className="action-btn edit" onClick={() => openModal('edit', student)}>
            Edit
                </button>
          {student.hasTrip && student.active && (
            <button className="action-btn record" onClick={() => openModal('record-attendance', student)}>
              Attendance
            </button>
          )}
          <button 
            className={`action-btn ${student.active ? 'delete' : 'restore'}`}
            onClick={() => openModal(student.active ? 'delete' : 'restore', student)}
          >
            {student.active ? 'Delete' : 'Restore'}
          </button>
        </div>
          </div>
        );
  };
        
  const renderModalContent = () => {
    switch (modalType) {
      case 'add':
        return renderAddEditForm('Add New Student');
      case 'edit':
        return renderAddEditForm('Edit Student');
      case 'view':
        return renderViewDetails();
      case 'delete':
        return renderDeleteConfirmation();
      case 'restore':
        return renderRestoreConfirmation();
      case 'record-attendance':
        return renderAttendanceForm();
      default:
        return null;
    }
  };

  const renderAddEditForm = (title: string) => (
    <div className="modal-content">
      <h3>{title}</h3>
      <form onSubmit={handleFormSubmit}>
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
          >
            <option value="">Select Grade</option>
            {GRADES.map(grade => (
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
          >
            <option value="">Select Parent</option>
            {parents.map(parent => (
              <option key={parent.id} value={parent.id}>
                {parent.firstName} {parent.lastName}
              </option>
            ))}
          </select>
        </div>
        {modalType === 'edit' && (
          <div className="form-group status-toggle">
            <label>
              <span>Status: </span>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={formData.active}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                />
                <label htmlFor="active" className="toggle-label">
                  <span className="toggle-inner"></span>
                  <span className="toggle-switch-label">{formData.active ? 'Active' : 'Inactive'}</span>
                </label>
              </div>
            </label>
          </div>
        )}
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
          >
            {loading ? `${modalType === 'add' ? 'Adding...' : 'Updating...'}` : `${modalType === 'add' ? 'Add Student' : 'Update Student'}`}
          </button>
          <button type="button" className="btn-secondary" onClick={closeModal}>
            Cancel
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
        
  const renderViewDetails = () => {
    if (!selectedStudent) return null;

    return (
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
                <span className="label">Status:</span>
                <span className={`value status-indicator ${selectedStudent.active ? 'active' : 'inactive'}`}>
                  {selectedStudent.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            
        {(selectedStudent.qrCode || selectedStudent.seatNumber) && (
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
            {selectedStudent.qrCode ? (
              <button className="btn-secondary" onClick={() => downloadQRCode(selectedStudent.id)}>
                    Download QR Code
                  </button>
            ) : selectedStudent.seatNumber && (
              <button className="btn-primary" onClick={() => generateQRCode(selectedStudent.id)}>
                    Generate QR Code
                  </button>
                )}
              </div>
            )}
            
            <div className="form-actions">
          <button className="btn-secondary" onClick={closeModal}>Close</button>
          <button className="btn-primary" onClick={() => {
                  closeModal();
                  openModal('edit', selectedStudent);
          }}>Edit</button>
            </div>
          </div>
    );
  };

  const renderDeleteConfirmation = () => {
    if (!selectedStudent) return null;

    return (
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
        <p className="warning">⚠️ This action cannot be undone.</p>
        {error && <div className="error-message">{error}</div>}
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
          <button 
            type="button" 
            className="btn-danger" 
            onClick={handleButtonClick}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete Student'}
          </button>
        </div>
      </div>
    );
  };

  const renderRestoreConfirmation = () => {
    if (!selectedStudent) return null;

    return (
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
              </div>
            {operationStatus.error && (
          <div className="operation-message error">{operationStatus.error}</div>
        )}
            <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
              <button 
                type="button" 
            className="btn-primary" 
            onClick={handleSubmitAction}
                disabled={operationStatus.loading}
              >
                {operationStatus.loading ? 'Restoring...' : 'Restore Student'}
              </button>
            </div>
          </div>
    );
  };

  const renderAttendanceForm = () => {
    if (!selectedStudent) return null;

    return (
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
              </div>
            <form onSubmit={handleFormSubmit}>
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
            <div className="operation-message error">{operationStatus.error}</div>
          )}
              <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={operationStatus.loading || !formData.grade}
            >
                  {operationStatus.loading ? 'Recording...' : 'Record Attendance'}
                </button>
              </div>
            </form>
      </div>
    );
  };

  return (
    <div className="students-list-container">
      {authService.isAuthenticated() && students.length > 0 && (
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
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
            <select
              className="filter-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="">All Students</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="withTrip">With Trip</option>
              <option value="withoutTrip">Without Trip</option>
            </select>
          </div>
          <button className="btn-primary add-button" onClick={() => openModal('add')} style={{backgroundColor: '#28887A'}}>
            <span>Add New Student</span>
          </button>
        </div>
      )}
      
      {loading ? (
        <div className="loading-container">
          <span>Loading students...</span>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchStudents}>Try Again</button>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="empty-state">
          <p>{students.length === 0 ? 'No students found in the database.' : 'No students match your search criteria.'}</p>
          {students.length === 0 ? (
            <button className="btn-primary" onClick={() => openModal('add')}>Add New Student</button>
          ) : (
            <button className="btn-secondary" onClick={() => {
              setSearchQuery('');
              setFilterGrade('');
            }}>Clear Filters</button>
          )}
        </div>
      ) : (
        <div className="students-grid">
          {filteredStudents.map(student => renderStudentListItem(student))}
        </div>
      )}
      
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