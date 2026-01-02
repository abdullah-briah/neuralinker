import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

import NeuralBackground from '../components/NeuralBackground';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import AIAssistance from '../components/AIAssistance';
import About from '../components/About';
import Testimonials from '../components/Testimonials';
import Pricing from '../components/Pricing';
import Modal from '../components/Modal';

const LandingPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('signup'); // 'signup' | 'login'
    const { login } = useAuth(); // AuthContext to save token
    const navigate = useNavigate();

    const openModal = (mode) => {
        setModalMode(mode);
        setIsModalOpen(true);
    };

    const toggleMode = (targetMode) => {
        if (targetMode) {
            setModalMode(targetMode);
        } else {
            setModalMode(prev => prev === 'signup' ? 'login' : 'signup');
        }
    };

    // Handle Form Submission from Modal
    const handleAuthSubmit = async (formData) => {
        const { email, password, name } = formData;

        try {
            if (modalMode === 'login') {
                // Login Logic
                const response = await api.post('/auth/login', { email, password });
                const { token, user } = response.data.data; // Correct destructuring
                login(token, user); // Save token and user to context
                setIsModalOpen(false);

                // Role-based redirection
                if (user.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/dashboard');
                }
            } else {
                // Registration Logic
                await api.post('/auth/register', { name, email, password });
                // Show success modal instead of closing
                setModalMode('success');
            }
        } catch (error) {
            console.error('Auth Error:', error);
            const msg = error.response?.data?.message || 'Authentication failed';
            alert(msg); // Simple error display for now
        }
    };

    return (
        <div className="landing-page">
            <NeuralBackground />
            <Navbar onSignInClick={() => openModal('login')} />
            <Hero onJoinClick={() => openModal('signup')} />
            <div id="features">
                <AIAssistance />
            </div>
            <div id="about">
                <About />
            </div>
            <div id="previews">
                <Testimonials />
                <Pricing onJoinClick={() => openModal('signup')} />
            </div>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode={modalMode}
                onSwitchMode={toggleMode}
                onSubmit={handleAuthSubmit} // Connected to backend logic
            />
        </div>
    );
};

export default LandingPage;
