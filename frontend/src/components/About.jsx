import React, { useEffect } from 'react';
import '../styles/About.css';

const About = () => {
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

        const elements = document.querySelectorAll('.about-animate');
        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <section id="about" className="about-section">
            <div className="about-container about-animate">
                <h2 className="section-title" style={{
                    background: 'linear-gradient(to right, #a855f7, #d8b4fe)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.5))',
                    display: 'inline-block'
                }}>Why Neuralinker?</h2>
                <div className="about-content">
                    <p className="about-text">
                        Neuralinker is a smart collaboration platform that connects the right people to the right projects.
                        It goes beyond profiles by using data and AI to help teams form faster, work smarter, and build meaningful projects.
                    </p>
                    <p className="about-text">
                        Whether you want to gain real-world experience or find the perfect collaborators for your idea,
                        Neuralinker provides an intelligent environment for practical collaboration, skill-based matching, and confident decision-making.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default About;
