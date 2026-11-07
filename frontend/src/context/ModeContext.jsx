import React, { createContext, useContext, useState, useEffect } from 'react';

const ModeContext = createContext();

export const ModeProvider = ({ children }) => {
  // Default mode is 'passenger' (consumer-first)
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('aerocluster_mode') || 'passenger';
  });

  useEffect(() => {
    localStorage.setItem('aerocluster_mode', mode);
  }, [mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'passenger' ? 'examiner' : 'passenger'));
  };

  return (
    <ModeContext.Provider value={{ mode, setMode, toggleMode, isExaminer: mode === 'examiner' }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
};

