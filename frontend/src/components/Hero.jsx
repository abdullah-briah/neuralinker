import React from 'react';
import '../styles/Hero.css';

const Hero = ({ onJoinClick }) => {
    return (
        <section className="hero">
            <div className="hero-content">
                <h1 className="hero-headline" style={{
                    filter: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.6))',
                }}>
                    <span className="line-1" style={{
                        background: 'linear-gradient(to right, #a855f7, #d8b4fe)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>Where minds and</span>
                    <span className="line-2" style={{
                        background: 'linear-gradient(to right, #a855f7, #d8b4fe)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>projects connect</span>
                </h1>
                <p className="hero-subtext">
                    AI-powered match scores – see how your skills fit every project and why.
                </p>
                <button className="cta-button" onClick={onJoinClick}>Join Now</button>
            </div>
        </section>
    );
};

export default Hero;
