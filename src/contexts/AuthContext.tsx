import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Employee } from '../types';

interface AuthContextType {
  employee: Employee | null;
  login: (employee: Employee) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [employee, setEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    const savedEmployee = localStorage.getItem('employee_data');
    const savedToken = localStorage.getItem('auth_token');
    
    if (savedEmployee && savedToken) {
      setEmployee(JSON.parse(savedEmployee));
    }
  }, []);

  const login = (employeeData: Employee) => {
    setEmployee(employeeData);
    localStorage.setItem('employee_data', JSON.stringify(employeeData));
    localStorage.setItem('auth_token', employeeData.token);
  };

  const logout = () => {
    setEmployee(null);
    localStorage.removeItem('employee_data');
    localStorage.removeItem('auth_token');
  };

  const value = {
    employee,
    login,
    logout,
    isAuthenticated: !!employee,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};