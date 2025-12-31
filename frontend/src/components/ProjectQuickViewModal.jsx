import React, { useEffect } from 'react';
import { X, Calendar, Clock, User, Layers, Info } from 'lucide-react';

const ProjectQuickViewModal = ({ isOpen, onClose, project }) => {
    // If not open or no project data, don't render
    if (!isOpen || !project) return null;

    // Prevent background scrolling when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === 'TBD') return 'TBD';
        try {
            return new Date(dateStr).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            return 'Invalid Date';
        }
    };

    const safeSkills = Array.isArray(project.skills) ? project.skills : [];

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999, /* High z-index to ensure visibility */
            padding: '2rem'
        }} onClick={onClose}>
            <div style={{
                background: '#0f172a',
                border: '1px solid rgba(168, 85, 247, 0.2)',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '700px',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                animation: 'fadeIn 0.2s ease-out',
                display: 'flex',
                flexDirection: 'column'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{
                    padding: '2rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    background: 'rgba(255, 255, 255, 0.02)'
                }}>
                    <div style={{ paddingRight: '2rem' }}>
                        <h2 style={{
                            color: '#fff',
                            margin: '0 0 0.75rem 0',
                            fontSize: '1.75rem',
                            fontWeight: '700',
                            lineHeight: 1.2
                        }}>
                            {project.title || 'Untitled Project'}
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a855f7' }}>
                            <User size={16} />
                            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                                Created by {project.owner?.name || 'Unknown User'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: 'none',
                            color: '#fff',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            flexShrink: 0
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '2rem', overflowY: 'auto' }}>

                    {/* Tags */}
                    {safeSkills.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#fff' }}>
                                <Layers size={20} color="#a855f7" />
                                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Required Skills</h3>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {safeSkills.map((skill, index) => (
                                    <span key={index} style={{
                                        background: 'rgba(168, 85, 247, 0.1)',
                                        color: '#d8b4fe',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '100px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        border: '1px solid rgba(168, 85, 247, 0.2)'
                                    }}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Metadata Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1.5rem',
                        marginBottom: '2rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{
                                background: 'rgba(168, 85, 247, 0.1)',
                                padding: '0.75rem',
                                borderRadius: '12px',
                                height: 'fit-content'
                            }}>
                                <Clock size={24} color="#a855f7" />
                            </div>
                            <div>
                                <span style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Duration</span>
                                <span style={{ color: '#fff', fontWeight: '500', fontSize: '1.1rem' }}>{project.duration || 'Not specified'}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{
                                background: 'rgba(168, 85, 247, 0.1)',
                                padding: '0.75rem',
                                borderRadius: '12px',
                                height: 'fit-content'
                            }}>
                                <Calendar size={24} color="#a855f7" />
                            </div>
                            <div>
                                <span style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Start Date</span>
                                <span style={{ color: '#fff', fontWeight: '500', fontSize: '1.1rem' }}>{formatDate(project.startDate)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#fff' }}>
                            <Info size={22} color="#a855f7" />
                            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>About Project</h3>
                        </div>
                        <div style={{
                            color: '#cbd5e1',
                            lineHeight: '1.7',
                            whiteSpace: 'pre-wrap',
                            fontSize: '1.05rem',
                            background: 'rgba(0,0,0,0.2)',
                            padding: '1.5rem',
                            borderRadius: '16px'
                        }}>
                            {project.description || 'No description provided.'}
                        </div>
                    </div>
                </div>
            </div>
            <style>
                {`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
                    }
                `}
            </style>
        </div>
    );
};

export default ProjectQuickViewModal;
