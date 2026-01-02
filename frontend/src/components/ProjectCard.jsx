import React from 'react';
import { Calendar, Clock, ArrowRight, Edit2, Trash2, UserPlus } from 'lucide-react';
import '../styles/ProjectCard.css';

const ProjectCard = ({
    id,
    title,
    description,
    skills,
    duration,
    startDate,
    ownerId,
    currentUserId,
    onJoin,
    onEdit,
    onDelete,
    onViewDetails,
    onQuickView,
    actionLabel = "View Details",
    isMember = false,   // New Prop
    isPending = false   // New Prop
}) => {
    // Check ownership
    const isOwner = ownerId === currentUserId;
    const canJoin = !isOwner && !isMember && !isPending && onJoin;

    // Helper to format date
    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === 'TBD') return 'TBD';
        return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="project-card">
            {/* ... Content ... */}
            <div className="card-content">
                <h3 className="project-title">{title}</h3>

                <div className="project-tags">
                    {skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
                    ))}
                    {skills.length > 3 && <span className="skill-tag-more">+{skills.length - 3}</span>}
                </div>

                <p className="project-desc">
                    {description.length > 100 ? `${description.substring(0, 100)}...` : description}
                </p>

                <div className="project-meta">
                    <div className="meta-item">
                        <Clock size={16} className="meta-icon" />
                        <span>{duration}</span>
                    </div>
                    <div className="meta-item">
                        <Calendar size={16} className="meta-icon" />
                        <span>{formatDate(startDate)}</span>
                    </div>
                </div>
            </div>

            <div className="project-actions" style={{ flexDirection: 'column', gap: '10px' }}>
                <button
                    className="btn-details"
                    onClick={() => {
                        if (onQuickView) onQuickView();
                        else if (onViewDetails) onViewDetails(id);
                    }}
                    style={{ // ... styles ...
                        width: '100%',
                        justifyContent: 'center',
                        padding: '12px',
                        fontSize: '1rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(168, 85, 247, 0.5)',
                        color: 'white',
                        fontWeight: '600',
                        boxShadow: 'none',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(168, 85, 247, 0.1)';
                        e.currentTarget.style.borderColor = '#a855f7';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.5)';
                    }}
                >
                    {actionLabel} <ArrowRight size={18} />
                </button>

                {/* Secondary Actions Row */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', width: '100%' }}>
                    {isOwner ? (
                        <div className="owner-actions" style={{ width: '100%', display: 'flex', gap: '10px' }}>
                            <button className="btn-icon edit" onClick={() => onEdit && onEdit(id)} title="Edit" style={{ flex: 1, justifyContent: 'center', background: 'rgba(255,255,255,0.05)' }}>
                                <Edit2 size={16} style={{ marginRight: '5px' }} /> Edit
                            </button>
                            <button className="btn-icon delete" onClick={() => onDelete && onDelete(id)} title="Delete" style={{ flex: 1, justifyContent: 'center', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                                <Trash2 size={16} style={{ marginRight: '5px' }} /> Delete
                            </button>
                        </div>
                    ) : isMember ? (
                        <div style={{ flex: 1, textAlign: 'center', padding: '10px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.2)', fontSize: '0.9rem', fontWeight: '600' }}>
                            ✓ Joined
                        </div>
                    ) : isPending ? (
                        <div style={{ flex: 1, textAlign: 'center', padding: '10px', background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', borderRadius: '8px', border: '1px solid rgba(234, 179, 8, 0.2)', fontSize: '0.9rem', fontWeight: '600' }}>
                            ⏳ Pending
                        </div>
                    ) : (
                        <button className="btn-join" onClick={onJoin} style={{ flex: 1, justifyContent: 'center' }}>
                            Ask to Join <UserPlus size={16} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;