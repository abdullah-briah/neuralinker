import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, FolderPlus, ArrowRight } from 'lucide-react';
import '../styles/UserDashboard.css';

const UserDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const firstName = user?.name ? user.name.split(' ')[0] : 'Innovator';

    return (
        <div className="user-dashboard-container">
            <div className="dashboard-content">
                <h1 className="welcome-title">
                    Welcome back, <span className="highlight-name">{firstName}</span>
                </h1>

                <p className="onboarding-hint">
                    Start by exploring projects or create your own.
                </p>

                <div className="action-cards">
                    {/* Explore Card */}
                    <div className="action-card" onClick={() => navigate('/projects')}>
                        <div className="icon-wrapper">
                            <Compass size={32} />
                        </div>
                        <h3>Explore Projects</h3>
                        <p>Discover innovative ideas and join teams needing your skills.</p>
                        <span className="card-link">Start Exploring <ArrowRight size={16} /></span>
                    </div>

                    {/* Create Card */}
                    <div className="action-card" onClick={() => navigate('/projects')}>
                        <div className="icon-wrapper">
                            <FolderPlus size={32} />
                        </div>
                        <h3>Create Project</h3>
                        <p>Have a vision? Launch your project and find the perfect team.</p>
                        <span className="card-link">Launch Now <ArrowRight size={16} /></span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
