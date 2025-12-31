import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Modal.css'; // Use shared modal styles
import api from '../api/axios';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await api.post('/auth/register', { name, email, password });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register');
        }
    };

    if (success) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <h2 className="auth-title" style={{ color: '#10b981' }}>Registration Successful!</h2>
                    <p style={{ textAlign: 'center', color: '#f8fafc', marginBottom: '1.5rem' }}>
                        A verification email has been sent to <strong>{email}</strong>.
                        <br />
                        Please check your inbox to activate your account.
                    </p>
                    <Link to="/login" className="btn btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div className="modal-content" style={{ animation: 'none' }}>
                <h2 className="modal-title">Join Neuralinker</h2>
                <p className="modal-subtitle">Connect your mind to the network.</p>
                {error && <div className="error-msg" style={{ color: '#ef4444', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}
                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
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
                    <button type="submit" className="modal-submit-btn">
                        Create Account
                    </button>
                </form>
                <div className="modal-footer">
                    Already a member? <Link to="/login" className="modal-link">Log In</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
