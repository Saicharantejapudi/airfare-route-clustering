import React, { createContext, useContext, useState, useEffect } from 'react';

const ModeContext = createContext();

export const ModeProvider = ({ children }) => {
  // Default mode is 'passenger' (Flight Advisor)
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('aerocluster_mode');
    if (saved === 'examiner') return 'analyst';
    return saved || 'passenger';
  });

  useEffect(() => {
    localStorage.setItem('aerocluster_mode', mode);
  }, [mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'passenger' ? 'analyst' : 'passenger'));
  };

  const isAnalyst = mode === 'analyst' || mode === 'examiner';

  return (
    <ModeContext.Provider value={{ 
      mode, 
      setMode, 
      toggleMode, 
      isAnalyst,
      isExaminer: isAnalyst // backward compatibility
    }}>
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

