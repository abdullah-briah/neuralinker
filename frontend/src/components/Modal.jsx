import React, { useState, useEffect } from 'react';
import '../styles/Modal.css';

const Modal = ({ isOpen, onClose, mode, onSwitchMode, onSubmit }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    // Reset form when modal opens or mode switches
    useEffect(() => {
        if (isOpen) {
            setEmail('');
            setPassword('');
            setName('');
        }
    }, [isOpen, mode]);

    if (!isOpen) return null;

    if (mode === 'success') {
        return (
            <div className="modal-backdrop" onClick={onClose}>
                <div className="modal-content" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'rgba(34, 197, 94, 0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        border: '1px solid rgba(34, 197, 94, 0.2)'
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>
                    <h2 className="modal-title" style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '1rem' }}>Success!</h2>
                    <p className="modal-subtitle" style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#e2e8f0' }}>Registration Successful</p>
                    <p style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: '2rem' }}>
                        A verification email has been sent to your inbox.<br />Please verify your account to unlock full access.
                    </p>

                    <button
                        onClick={() => onSwitchMode('login')}
                        className="modal-submit-btn"
                        style={{ background: '#22c55e', marginTop: '0' }}
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    const isLogin = mode === 'login';

    const handleSubmit = (e) => {
        e.preventDefault();
        // Pass data to parent (LandingPage)
        onSubmit({ email, password, name: isLogin ? undefined : name });
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>
                <h2 className="modal-title">{isLogin ? 'Welcome Back' : 'Join Neuralinker'}</h2>
                <p className="modal-subtitle">{isLogin ? 'Access your neural workspace.' : 'Connect your mind to the network.'}</p>
                <form className="modal-form" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="modal-submit-btn">{isLogin ? 'Log In' : 'Create Account'}</button>
                </form>
                <p className="modal-footer">
                    {isLogin ? "Don't have an account? " : "Already a member? "}
                    <button onClick={() => onSwitchMode(isLogin ? 'signup' : 'login')} className="modal-link">{isLogin ? 'Sign Up' : 'Log In'}</button>
                </p>
            </div>
        </div>
    );
};

export default Modal;
