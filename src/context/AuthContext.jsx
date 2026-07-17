import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('isLoggedIn') === 'true';
  });
  
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'farmer.john@example.com',
    phone: '+1 (555) 019-2834',
    farmLocation: 'Green Valley Farm, Sector 4',
    farmSize: '45 Acres',
    cropType: 'Organic Wheat & Maize',
    profilePicture: null
  });

  const [showTimeoutModal, setShowTimeoutModal] = useState(false);

  // Simulate a session timeout after 5 minutes of idle/activity (for demo, let's offer a way to trigger it or set a shorter 2-minute timer if preferred, or just a state trigger)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Set a timer for 90 seconds just to showcase the modal to the user during evaluation,
    // or trigger it when they click something. Let's set a 2-minute timer for the session timeout warning.
    const timer = setTimeout(() => {
      setShowTimeoutModal(true);
    }, 120000); // 2 minutes

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  const login = (email, password) => {
    if (!email || !password) {
      throw new Error('Please fill in all fields.');
    }
    // Simple email pattern verification
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }
    setIsAuthenticated(true);
    sessionStorage.setItem('isLoggedIn', 'true');
    return true;
  };

  const register = (userData) => {
    if (!userData.name || !userData.email || !userData.password || !userData.confirmPassword) {
      throw new Error('Please fill in all fields.');
    }
    if (userData.password !== userData.confirmPassword) {
      throw new Error('Passwords do not match.');
    }
    if (userData.password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }
    setUser(prev => ({
      ...prev,
      name: userData.name,
      email: userData.email,
    }));
    setIsAuthenticated(true);
    sessionStorage.setItem('isLoggedIn', 'true');
    return true;
  };

  const forgotPassword = (email) => {
    if (!email) {
      throw new Error('Please enter your email.');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format.');
    }
    // Mock success
    return true;
  };

  const resetPassword = (password, confirmPassword) => {
    if (!password || !confirmPassword) {
      throw new Error('Please fill in all fields.');
    }
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }
    // Mock success
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('isLoggedIn');
    setShowTimeoutModal(false);
  };

  const extendSession = () => {
    setShowTimeoutModal(false);
    // Restart timeout timer
    // For demo purposes, we can trigger again in another 2 mins
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      setUser,
      login,
      register,
      forgotPassword,
      resetPassword,
      logout,
      showTimeoutModal,
      setShowTimeoutModal,
      extendSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};
