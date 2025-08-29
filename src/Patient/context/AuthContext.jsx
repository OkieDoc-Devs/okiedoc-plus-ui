import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Dummy user data for demonstration
  const dummyUsers = [
    { email: 'patient@example.com', password: '123456', name: 'John Doe' },
    { email: 'test@example.com', password: 'password', name: 'Test User' }
  ];

  const login = (email, password) => {
    // Simulate backend authentication
    const foundUser = dummyUsers.find(
      user => user.email === email && user.password === password
    );

    if (foundUser) {
      setUser(foundUser);
      setIsAuthenticated(true);
      // Store in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(foundUser));
      localStorage.setItem('isAuthenticated', 'true');
      
      // Navigate to dashboard
      navigate('/patient-dashboard');
      return { success: true, message: 'Login successful!' };
    } else {
      return { success: false, message: 'Invalid credentials' };
    }
  };

  const register = (userData) => {
    // Simulate backend registration
    const existingUser = dummyUsers.find(user => user.email === userData.email);
    
    if (existingUser) {
      return { success: false, message: 'User already exists with this email' };
    }

    // Create new user (in real app, this would go to backend)
    const newUser = {
      email: userData.email,
      password: userData.password,
      name: userData.name
    };

    // Add to dummy users (in real app, this would be saved to backend)
    dummyUsers.push(newUser);

    // Auto-login after successful registration
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('isAuthenticated', 'true');

    // Navigate to dashboard
    navigate('/patient-dashboard');
    return { success: true, message: 'Registration successful!' };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    
    // Navigate back to login
    navigate('/');
  };

  const checkAuthStatus = () => {
    // Check if user is already logged in from localStorage
    const storedUser = localStorage.getItem('user');
    const storedAuth = localStorage.getItem('isAuthenticated');
    
    if (storedUser && storedAuth === 'true') {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const value = {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
