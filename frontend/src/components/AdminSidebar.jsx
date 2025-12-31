import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    FolderOpen,
    FileQuestion,
    BarChart2,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const AdminSidebar = ({ isCollapsed, toggleSidebar }) => {
    const navItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/admin/users', label: 'Users Management', icon: <Users size={20} /> },
        { path: '/admin/projects', label: 'Projects Management', icon: <FolderOpen size={20} /> },
        { path: '/admin/requests', label: 'Join Requests', icon: <FileQuestion size={20} /> },
        { path: '/admin/analytics', label: 'Analytics', icon: <BarChart2 size={20} /> },
    ];

    return (
        <aside style={{
            position: 'fixed',
            top: '70px', // Below Navbar
            left: 0,
            bottom: 0,
            width: isCollapsed ? '80px' : '260px',
            background: '#0f172a', /* Dark Slate match */
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            zIndex: 900,
            transition: 'width 0.3s ease-in-out',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem 0',
            boxShadow: '4px 0 20px rgba(0, 0, 0, 0.2)'
        }}>

            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '-14px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#3b82f6',
                    border: '2px solid #0f172a',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    transition: 'transform 0.2s',
                    outline: 'none'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {/* Menu Items */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '0 12px',
                marginTop: '1rem'
            }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            padding: isCollapsed ? '12px' : '12px 16px',
                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            color: isActive ? 'white' : '#94a3b8',
                            background: isActive
                                ? 'linear-gradient(90deg, #a855f7 0%, #7c3aed 100%)'
                                : 'transparent',
                            fontWeight: isActive ? '600' : '500',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s',
                            position: 'relative',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            boxShadow: isActive ? '0 4px 15px rgba(168, 85, 247, 0.3)' : 'none'
                        })}
                        title={isCollapsed ? item.label : ''}
                    >
                        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                            {item.icon}
                        </div>

                        <span style={{
                            opacity: isCollapsed ? 0 : 1,
                            transform: isCollapsed ? 'translateX(-10px)' : 'translateX(0)',
                            transition: 'all 0.3s',
                            overflow: 'hidden',
                            width: isCollapsed ? 0 : 'auto'
                        }}>
                            {item.label}
                        </span>
                    </NavLink>
                ))}
            </div>

            {/* Bottom Section (Optional: Version or Help) */}
            <div style={{
                marginTop: 'auto',
                padding: '0 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                opacity: isCollapsed ? 0 : 1,
                transition: 'opacity 0.3s',
                pointerEvents: isCollapsed ? 'none' : 'auto'
            }}>
                <div style={{
                    paddingTop: '20px',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    color: '#64748b',
                    fontSize: '0.75rem',
                    textAlign: 'center'
                }}>
                    NeuraLinker Admin v1.0
                </div>
            </div>

        </aside>
    );
};

export default AdminSidebar;
