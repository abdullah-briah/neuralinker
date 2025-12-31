import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';

const AdminLayout = () => {
    return (
        <div className="admin-layout" style={{
            minHeight: '100vh',
            background: 'var(--bg-gradient)', // Use global gradient
            color: 'var(--text-primary)'
        }}>
            <AdminNavbar />
            <main style={{ padding: '2rem' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
