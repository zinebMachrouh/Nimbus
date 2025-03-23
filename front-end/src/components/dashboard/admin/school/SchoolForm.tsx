import { useState, useEffect, FormEvent } from 'react';
import { School } from '../../../../core/entities/school.entity';
import { useSchoolService } from '../../../../contexts/ServiceContext';
import './SchoolForm.css';

interface SchoolFormProps {
  isOpen: boolean;
  onClose: () => void;
  school: School | null;
}

const SchoolForm = ({ isOpen, onClose, school }: SchoolFormProps) => {
  const schoolService = useSchoolService();
  const [formData, setFormData] = useState<Partial<School>>({
    name: '',
    address: '',
    phoneNumber: '',
    latitude: 0.,
    longitude: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (school) {
      setFormData({
        id: school.id,
        name: school.name || '',
        address: school.address || '',
        phoneNumber: school.phoneNumber || '',
      });
    }
  }, [school]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (school?.id) {
        await schoolService.update(school.id, formData);
        const updatedSchool = { ...school, ...formData };
        localStorage.setItem('school', JSON.stringify(updatedSchool));
      } else {
        setError('School ID is missing');
      }
      onClose();
      //window.location.reload();
    } catch (err) {
      setError('Failed to update school information. Please try again.');
      console.error('Error updating school:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

    return (  
    <div className="school-form-overlay">
      <div className="school-form-modal">
        <div className="school-form-header">
          <h2>Update School Information</h2>
          <button type="button" className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">School Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>
          
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="save-button"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
        </div>
    );
}
 
export default SchoolForm;