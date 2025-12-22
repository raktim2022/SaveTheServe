'use client';

import { createContext, useContext, useState } from 'react';

const UserContext = createContext({});

export const UserProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState({
    notifications: true,
    emailAlerts: true,
    language: 'en',
  });

  const updateProfile = (data) => {
    setProfile(data);
  };

  const updatePreferences = (data) => {
    setPreferences((prev) => ({ ...prev, ...data }));
  };

  const value = {
    profile,
    preferences,
    updateProfile,
    updatePreferences,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;

