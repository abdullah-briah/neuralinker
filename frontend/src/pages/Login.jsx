import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Modal.css'; // Use shared modal styles
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data.data;

            login(token, user);

            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login');
        }
    };

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
                <h2 className="modal-title">Welcome Back</h2>
                <p className="modal-subtitle">Access your neural workspace.</p>
                {error && <div className="error-msg" style={{ color: '#ef4444', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}
                <form className="modal-form" onSubmit={handleSubmit}>
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
                        Sign In
                    </button>
                </form>
                <div className="modal-footer">
                    Don't have an account? <Link to="/register" className="modal-link">Sign Up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
