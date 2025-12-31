import React from 'react';
import '../styles/Testimonials.css';

// Extended data for 6 items
const testimonialsData = [
    {
        id: 1,
        name: "Alex C.",
        rating: 5,
        comment: "Through this platform, we were able to join real programming projects and gain valuable hands-on experience."
    },
    {
        id: 2,
        name: "Sarah V.",
        rating: 5,
        comment: "Neuralinker connected me with a team that perfectly complemented my skills. We shipped our MVP in record time."
    },
    {
        id: 3,
        name: "J. Matrix",
        rating: 5,
        comment: "The quality of projects here is unmatched. It's the ultimate playground for growth and serious collaboration."
    },
    {
        id: 4,
        name: "Emily R.",
        rating: 5,
        comment: "Finally, a place where skills matter more than resumes. I found my co-founder here within a week."
    },
    {
        id: 5,
        name: "David K.",
        rating: 4,
        comment: "The AI matching is scary good. It suggested a project I wouldn't have looked at, and it was a perfect fit."
    },
    {
        id: 6,
        name: "Lisa Wong",
        rating: 5,
        comment: "Managing applicants used to be a nightmare. With Neuralinker, I only see candidates who actually fit the role."
    }
];

const Testimonials = () => {
    // Duplicate data for seamless loop
    const marqueeData = [...testimonialsData, ...testimonialsData];

    return (
        <section id="users" className="testimonials-section">
            <h2 className="section-title" style={{
                background: 'linear-gradient(to right, #a855f7, #d8b4fe)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.5))',
                marginBottom: '4rem'
            }}>User Experiences</h2>

            <div className="marquee-container">
                <div className="marquee-content">
                    {marqueeData.map((item, index) => (
                        <div key={`${item.id}-${index}`} className="testimonial-card">
                            <div className="stars">
                                {"★".repeat(item.rating)}
                            </div>
                            <p className="testimonial-comment">"{item.comment}"</p>
                            <div className="testimonial-user">
                                <div className="user-avatar-placeholder">{item.name.charAt(0)}</div>
                                <span className="user-name">{item.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
