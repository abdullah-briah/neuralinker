import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const tokenParam = searchParams.get('token');
    const token = tokenParam ? decodeURIComponent(tokenParam) : null; // فك التشفير للتوافق
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your email...');
    const [isResending, setIsResending] = useState(false);
    const [resendEmail, setResendEmail] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token provided.');
            return;
        }

        const verify = async () => {
            try {
                await api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`); // تشفير token عند الإرسال
                setStatus('success');
                setMessage('Email verified successfully! Redirecting to login...');
                setTimeout(() => navigate('/login'), 3000); // إعادة التوجيه تلقائياً بعد 3 ثوانٍ
            } catch (err) {
                console.error('❌ VerifyEmail Error:', err);
                setStatus('error');
                setMessage(
                    err.response?.data?.message ||
                    'Verification failed. Token may be invalid or expired.'
                );
            }
        };

        verify();
    }, [token, navigate]);

    const handleResend = async (e) => {
        e.preventDefault();
        if (!resendEmail) return;
        setIsResending(true);
        try {
            await api.post('/auth/resend-verification', { email: resendEmail });
            alert('Verification email resent! Check your inbox.');
        } catch (err) {
            console.error('❌ Resend Email Error:', err);
            alert(err.response?.data?.message || 'Failed to resend email.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Email Verification</h2>

                <div
                    style={{
                        textAlign: 'center',
                        marginBottom: '1.5rem',
                        color: status === 'error' ? '#ef4444' : '#10b981',
                    }}
                >
                    {message}
                </div>

                {status === 'success' && (
                    <p style={{ textAlign: 'center', color: '#94a3b8' }}>
                        Redirecting to login...
                    </p>
                )}

                {(status === 'error' || !token) && (
                    <div style={{ marginTop: '2rem', borderTop: '1px solid #334155', paddingTop: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1rem' }}>
                            Resend Verification Email
                        </h3>
                        <form onSubmit={handleResend}>
                            <div className="form-group">
                                <label className="form-label">Enter your email address</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={resendEmail}
                                    onChange={(e) => setResendEmail(e.target.value)}
                                    required
                                    placeholder="name@example.com"
                                />
                            </div>
                            <button type="submit" className="btn btn-secondary" disabled={isResending}>
                                {isResending ? 'Sending...' : 'Resend Email'}
                            </button>
                        </form>
                    </div>
                )}

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <Link to="/login" className="nav-link">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
