import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import '../styles/Toast.css';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto remove
        setTimeout(() => {
            removeToast(id);
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className={`toast-item toast-${toast.type} slide-in`}>
                        <div className="toast-icon">
                            {toast.type === 'success' && <CheckCircle size={20} />}
                            {toast.type === 'error' && <AlertTriangle size={20} />}
                            {toast.type === 'info' && <Info size={20} />}
                        </div>
                        <span className="toast-message">{toast.message}</span>
                        <button className="toast-close" onClick={() => removeToast(toast.id)}>
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
