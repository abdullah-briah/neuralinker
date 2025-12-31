import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">NEURALINKER</div>
            <nav className="sidebar-nav">
                <NavLink to="/dashboard" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    Dashboard
                </NavLink>
                <NavLink to="/dashboard/projects" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    Projects
                </NavLink>
                <NavLink to="/dashboard/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    Profile
                </NavLink>
            </nav>
            <div className="sidebar-footer">
                <a href="/" className="sidebar-link logout">Log Out</a>
            </div>
        </aside>
    );
};

export default Sidebar;
