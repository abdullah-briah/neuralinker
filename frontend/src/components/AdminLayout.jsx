import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <div className="admin-layout" style={{
            minHeight: '100vh',
            background: 'var(--bg-gradient)', // Use global gradient
            color: 'var(--text-primary)'
        }}>
            <AdminNavbar />

            <div style={{ display: 'flex', paddingTop: '70px' }}> {/* Add padding for Navbar */}
                <AdminSidebar
                    isCollapsed={isSidebarCollapsed}
                    toggleSidebar={toggleSidebar}
                />

                <main style={{
                    flex: 1,
                    padding: '2rem',
                    marginLeft: isSidebarCollapsed ? '80px' : '260px', /* Adjust for fixed sidebar */
                    transition: 'margin-left 0.3s ease-in-out',
                    width: '100%' // Ensure full width
                }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
