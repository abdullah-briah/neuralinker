import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming react-router
import { Bell, Settings, LogOut, User, Menu, X, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Assuming AuthContext exists

const AdminNavbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '70px',
            background: 'rgba(15, 23, 42, 0.8)', // Dark Slate with opacity
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            zIndex: 1000,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
        }}>
            {/* Logo Section */}
            <div
                onClick={() => navigate('/admin')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer'
                }}
            >
                <div style={{
                    background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
                    padding: '8px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 15px rgba(168, 85, 247, 0.4)'
                }}>
                    <Shield color="white" size={20} fill="currentColor" fillOpacity={0.2} />
                </div>
                <span style={{
                    fontSize: '1.4rem',
                    fontWeight: '800',
                    background: 'linear-gradient(90deg, #fff, #cbd5e1)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.5px'
                }}>
                    NeuraLinker <span style={{ fontSize: '0.8em', color: '#a855f7', WebkitTextFillColor: '#a855f7', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginLeft: '4px', background: 'none' }}>Admin</span>
                </span>
            </div>

            {/* Desktop Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }} className="desktop-actions">

                {/* Icons Group */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '24px', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                    <IconButton icon={<Bell size={20} />} label="Notifications" count={3} />
                    <IconButton icon={<Settings size={20} />} label="Settings" />
                </div>

                {/* Profile & Logout */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ color: 'white', fontWeight: '700', fontSize: '1.1rem' }}>
                            {user?.name || 'Administrator'}
                        </div>
                        <div style={{ color: '#a855f7', fontSize: '0.85rem', fontWeight: '600' }}>
                            Administrator
                        </div>
                    </div>

                    <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #cbd5e1, #94a3b8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid rgba(168, 85, 247, 0.5)',
                        boxShadow: '0 0 10px rgba(168, 85, 247, 0.3)'
                    }}>
                        {user?.avatarUrl ? (
                            <img
                                src={user.avatarUrl.startsWith('http') || user.avatarUrl.startsWith('/uploads') || user.avatarUrl.startsWith('/')
                                    ? user.avatarUrl
                                    : `/uploads/${user.avatarUrl}`}
                                alt="Admin"
                                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                            />
                        ) : (
                            <User size={24} color="#0f172a" />
                        )}
                    </div>

                    <button
                        onClick={handleLogout}
                        style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '8px',
                            padding: '8px',
                            color: '#ef4444',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title="Logout"
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            {/* Mobile Menu Toggle (Simplified for now) */}
            <div className="mobile-toggle" style={{ display: 'none' }}>
                <Menu color="white" />
            </div>
        </nav>
    );
};

// Helper Component for Icons
const IconButton = ({ icon, label, count }) => {
    return (
        <button
            style={{
                background: 'transparent',
                border: 'none',
                color: '#cbd5e1',
                padding: '10px',
                borderRadius: '50%',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#cbd5e1';
            }}
            title={label}
        >
            {icon}
            {count && (
                <span style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    background: '#ef4444',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    minWidth: '16px',
                    height: '16px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 2px',
                    border: '1px solid #0f172a'
                }}>
                    {count}
                </span>
            )}
        </button>
    );
};

export default AdminNavbar;
