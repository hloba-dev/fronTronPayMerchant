import React, { useState, useEffect, createContext, useContext } from 'react';
import './Toast.css';

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    // Если пришла пустая строка / null / undefined — подставим дефолт
    const safeMessage = message && String(message).trim().length > 0 ? message : (type === 'error' ? 'Произошла ошибка' : 'Операция выполнена');
    const id = Date.now() + Math.random();
    setToasts(prevToasts => [...prevToasts, { id, message: safeMessage, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.message}
            <button onClick={() => removeToast(toast.id)} className="toast-close-btn">&times;</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
} 