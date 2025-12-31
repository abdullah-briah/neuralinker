// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Notifications from './Notifications';
import '../styles/Navbar.css';
import {
    Compass,
    FolderOpen,
    User,
    LogOut,
    Menu, // For future mobile menu
    LayoutDashboard
} from 'lucide-react';

const Navbar = ({ onSignInClick }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isLanding = location.pathname === '/landing' || location.pathname === '/';

    const handleLogout = () => {
        logout();
        navigate('/landing');
    };

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <nav className={`navbar ${isLanding ? 'navbar-landing' : 'navbar-user'}`}>
            <div className="navbar-container">
                {/* 1. Logo - Points to /projects now */}
                {/* 1. Logo - Disabled Navigation */}
                <div className="navbar-logo" style={{
                    background: 'linear-gradient(to right, #a855f7, #d8b4fe)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.5))',
                    fontWeight: '800',
                    cursor: 'default',
                    userSelect: 'none'
                }}>
                    Neuralinker
                </div>

                {/* 2. Center Navigation (Only for logged in users) */}
                {!isLanding && user && (
                    <div className="navbar-center">
                        <Link to="/dashboard" className={`nav-link-center ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                            <LayoutDashboard size={18} />
                            <span>Dashboard</span>
                        </Link>
                        <Link to="/projects" className={`nav-link-center ${location.pathname === '/projects' ? 'active' : ''}`}>
                            <Compass size={18} />
                            <span>Explore</span>
                        </Link>
                        <Link to="/my-projects" className={`nav-link-center ${location.pathname === '/my-projects' ? 'active' : ''}`}>
                            <FolderOpen size={18} />
                            <span>My Projects</span>
                        </Link>
                    </div>
                )}

                {/* Landing Page Links (Center) */}
                {isLanding && (
                    <div className="navbar-links-landing">
                        <button onClick={() => scrollToSection('features')} className="nav-link-landing">Features</button>
                        <button onClick={() => scrollToSection('about')} className="nav-link-landing">About</button>
                        <button onClick={() => scrollToSection('previews')} className="nav-link-landing">Previews</button>
                    </div>
                )}

                {/* 3. Right Actions */}
                <div className="navbar-actions">
                    {user ? (
                        isLanding ? (
                            <Link to="/projects" className="nav-btn login-btn">Explore Projects</Link>
                        ) : (
                            <>
                                {/* Notifications */}
                                <Notifications />

                                {/* Profile Link */}
                                <Link to="/profile" className={`nav-icon-btn ${location.pathname === '/profile' ? 'active-icon' : ''}`} title="Profile">
                                    <User size={22} />
                                </Link>

                                {/* Logout */}
                                <button onClick={handleLogout} className="nav-icon-btn logout-icon-btn" title="Logout">
                                    <LogOut size={22} />
                                </button>
                            </>
                        )
                    ) : (
                        <button onClick={onSignInClick || (() => navigate('/login'))} className="nav-btn login-btn">
                            Sign In
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
