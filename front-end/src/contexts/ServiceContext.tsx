import React, { createContext, useContext } from 'react';
import { AuthService } from '../services/AuthService';
import { AuthServiceImpl } from '../services/impl/AuthServiceImpl';

interface ServiceContextType {
  authService: AuthService;
  // Add other services here as needed
}

// Create default implementations
const defaultServices: ServiceContextType = {
  authService: new AuthServiceImpl(),
  // Initialize other services here
};

// Create the context
const ServiceContext = createContext<ServiceContextType>(defaultServices);

// Provider component
export const ServiceProvider: React.FC<{
  children: React.ReactNode;
  services?: Partial<ServiceContextType>;
}> = ({ children, services }) => {
  // Merge provided services with defaults
  const value = {
    ...defaultServices,
    ...services,
  };

  return (
    <ServiceContext.Provider value={value}>
      {children}
    </ServiceContext.Provider>
  );
};

// Hook for using the services
export const useServices = () => useContext(ServiceContext);

// Utility hooks for specific services
export const useAuthService = () => useContext(ServiceContext).authService; 