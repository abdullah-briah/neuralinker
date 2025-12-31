import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const DashboardLayout = () => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a15' }}>
            <Sidebar />
            <main style={{ flexGrow: 1, padding: '2rem', marginLeft: '250px' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
