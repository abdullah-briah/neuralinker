import React, { useEffect, useRef } from 'react';
import '../styles/AIAssistance.css';

const AIAssistance = () => {
    const observerRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.1 }
        );

        const elements = document.querySelectorAll('.feature-animate');
        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <section id="features" className="ai-features-section">
            <h2 className="section-title" style={{
                background: 'linear-gradient(to right, #a855f7, #d8b4fe)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.5))',
                textAlign: 'center'
            }}>AI-Powered Collaboration</h2>
            <div className="features-grid">
                <div className="feature-card feature-animate" style={{ transitionDelay: '0s' }}>
                    <div className="feature-icon">🧠</div>
                    <h3>Smart Join Insights</h3>
                    <p>Get AI-driven insights on join requests based on skills and project needs — helping owners make confident decisions.</p>
                </div>
                <div className="feature-card feature-animate" style={{ transitionDelay: '0.2s' }}>
                    <div className="feature-icon">⚡</div>
                    <h3>Faster, Smarter Decisions</h3>
                    <p>No guesswork. Clear match indicators help you accept the right people at the right time.</p>
                </div>
                <div className="feature-card feature-animate" style={{ transitionDelay: '0.4s' }}>
                    <div className="feature-icon">🤝</div>
                    <h3>Better Team Formation</h3>
                    <p>Build stronger project teams with data-supported collaboration, not random approvals.</p>
                </div>
            </div>
        </section>
    );
};

export default AIAssistance;
