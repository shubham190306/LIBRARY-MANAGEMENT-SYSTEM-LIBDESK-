import React, { createContext, useState, useContext, useEffect } from 'react';
import Toast from './Toast';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (type, message, title = '') => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, type, message, title }]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  // Listen for custom toast events
  useEffect(() => {
    const handleShowToast = (event) => {
      const { type, message, title } = event.detail;
      showToast(type, message, title);
    };

    document.addEventListener('show-toast', handleShowToast);
    
    return () => {
      document.removeEventListener('show-toast', handleShowToast);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return {
    showSuccess: (message, title) => context.showToast('success', message, title),
    showError: (message, title) => context.showToast('error', message, title),
    showInfo: (message, title) => context.showToast('info', message, title)
  };
};

export default ToastContext;