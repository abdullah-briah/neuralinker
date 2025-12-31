import React from 'react';
import '../styles/Pricing.css';

const Pricing = ({ onJoinClick }) => {
    return (
        <section id="pricing" className="pricing-section">
            <div className="pricing-container" style={{ justifyContent: 'center' }}>
                {/* Free Plan Only */}
                <div className="pricing-card free-plan" style={{
                    maxWidth: '400px',
                    width: '100%',
                    background: 'rgba(30, 41, 59, 0.4)',
                    borderColor: '#a855f7',
                    boxShadow: '0 0 30px rgba(168, 85, 247, 0.1)'
                }}>
                    <h3 className="plan-name" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Free</h3>
                    <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
                        Join the network and start collaborating today.
                    </p>
                    <button
                        className="plan-btn"
                        onClick={onJoinClick}
                        style={{
                            background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
                            border: 'none',
                            color: 'white'
                        }}
                    >
                        Get Started
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Pricing;
