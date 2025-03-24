const fetchDrivers = async () => {
  try {
    console.log('Starting to fetch drivers...');
    const schoolId = localStorage.getItem('schoolId');
    if (!schoolId) {
      console.error('No school ID found in localStorage');
      setError('School ID not found. Please log in again.');
      return;
    }

    const response = await driverService.getAllDrivers();
    console.log('Raw drivers response:', response);
    
    // Filter drivers by school ID
    const filteredDrivers = response.filter(driver => driver.schoolId === schoolId);
    console.log('Filtered drivers:', filteredDrivers);
    
    setDrivers(filteredDrivers);
    setLoading(false);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    setError('Failed to fetch drivers');
    setLoading(false);
  }
}; 