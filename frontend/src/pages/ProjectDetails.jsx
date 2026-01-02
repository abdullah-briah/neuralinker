// src/pages/ProjectDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Folder, Users, Calendar, Clock, ArrowLeft, Send, MessageSquare, Shield, Check, X } from 'lucide-react';

// Helper to resolve avatar URL
const getAvatarUrl = (path) => {
    if (!path) return "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
    if (path.startsWith('http')) return path;

    // Default to 4000 to match backend, or use env
    let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    if (baseUrl.endsWith('/api')) {
        baseUrl = baseUrl.slice(0, -4);
    }

    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    // If path already includes uploads/ (legacy data), don't add it again
    if (cleanPath.startsWith('uploads/')) {
        return `${baseUrl}/${cleanPath}`;
    }

    return `${baseUrl}/uploads/${cleanPath}`;
};

const ProjectDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pendingRequests, setPendingRequests] = useState([]);

    // Chat State
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    // Fetch Project & Requests
    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await api.get(`/projects/${id}`);
                setProject(res.data);
                // If owner, fetch pending requests
                if (res.data.owner?.id === user?.id) {
                    try {
                        const reqs = await api.get(`/projects/${id}/join-requests`);
                        setPendingRequests(reqs.data.filter(r => r.status === 'pending'));
                    } catch (e) {
                        console.error('Failed to fetch requests', e);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch project", err);
                setError("Project not found or access denied.");
            } finally {
                setLoading(false);
            }
        };

        if (id && user) fetchProject();
    }, [id, user]);

    const handleRequestAction = async (requestId, status) => {
        try {
            await api.patch(`/join-requests/${requestId}/respond`, { status });
            // Remove from list
            setPendingRequests(prev => prev.filter(r => r.id !== requestId));

            // If accepted, refresh project to show new member (optional but nice)
            if (status === 'accepted') {
                const res = await api.get(`/projects/${id}`);
                setProject(res.data);
            }
        } catch (err) {
            console.error("Failed to respond to request", err);
            alert("Action failed. Please try again.");
        }
    };

    // Fetch Messages
    useEffect(() => {
        const fetchMessages = async () => {
            if (!project) return;
            try {
                const res = await api.get(`/projects/${id}/messages`);
                setMessages(res.data);
            } catch (err) {
                console.error("Failed to fetch messages", err);
            }
        };

        if (project) {
            fetchMessages();
            // Poll every 5 seconds
            const interval = setInterval(fetchMessages, 5000);
            return () => clearInterval(interval);
        }
    }, [id, project]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const res = await api.post(`/projects/${id}/messages`, { content: newMessage });
            setMessages((prev) => [...prev, res.data]);
            setNewMessage('');
        } catch (err) {
            console.error("Failed to send message", err);
            alert("Failed to send message.");
        }
    };

    if (loading) return <div className="loading-state">Loading project details...</div>;
    if (error) return <div className="error-state">{error}</div>;
    if (!project) return null;

    // Access Control: Check if user is owner or member or admin
    const isOwner = project.owner?.id === user?.id;
    const isMember = project.members?.some(m => m.user.id === user?.id);
    const isAdmin = user?.role === 'admin';

    if (!isOwner && !isMember && !isAdmin) {
        return (
            <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
                <h1 style={{ color: '#ef4444' }}>Access Denied</h1>
                <p style={{ color: '#a0a0b0' }}>You must be a member of this project to view its details.</p>
                <Link to="/projects" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Explore Projects</Link>
            </div>
        );
    }

    // Combine owner and members for display
    const membersList = project.members || [];

    return (
        <div style={{
            padding: '2rem',
            paddingTop: '6rem',
            maxWidth: '1400px',
            margin: '0 auto',
            minHeight: '100vh',
            color: 'white'
        }}>
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#a0a0b0', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', marginBottom: '1rem' }}>
                <ArrowLeft size={18} /> Back
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '380px minmax(0, 1fr)', gap: '2.5rem', alignItems: 'start' }}>

                {/* Left Sidebar (Sticky) - Contains Team & Chat */}
                <div className="project-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '2rem' }}>

                    {/* Team Section */}
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.4)',
                        backdropFilter: 'blur(12px)',
                        padding: '1.5rem',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '8px', borderRadius: '10px' }}>
                                <Users size={20} color="#22c55e" />
                            </div>
                            <h3 style={{ margin: 0, fontWeight: '700', fontSize: '1.1rem' }}>Project Team</h3>
                        </div>

                        {/* Owner */}
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', marginBottom: '1rem', letterSpacing: '1px', fontWeight: '600' }}>Project Owner</div>
                            <Link to={`/profile/${project.owner.id}`} style={{ display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none', color: 'inherit', padding: '12px', borderRadius: '12px', transition: 'all 0.2s', background: 'rgba(255, 255, 255, 0.03)' }} className="member-link hover:bg-white/5">
                                {project.owner.avatarUrl ? (
                                    <img src={getAvatarUrl(project.owner.avatarUrl)} alt={project.owner.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(168, 85, 247, 0.3)' }} />
                                ) : (
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #c084fc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: 'white' }}>
                                        {project.owner.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '1rem' }}>{project.owner.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#a855f7', fontWeight: '500' }}>Team Leader</div>
                                </div>
                            </Link>
                        </div>

                        {/* Members */}
                        <div>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', marginBottom: '1rem', letterSpacing: '1px', fontWeight: '600' }}>Members ({membersList.filter(m => m.user.id !== project.owner.id).length})</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {membersList.filter(m => m.user.id !== project.owner.id).length === 0 ? (
                                    <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                        <p style={{ margin: 0, fontSize: '0.9rem' }}>No other members.</p>
                                    </div>
                                ) : (
                                    membersList.filter(m => m.user.id !== project.owner.id).map((member) => (
                                        <Link key={member.id} to={`/profile/${member.user.id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit', padding: '10px', borderRadius: '12px', transition: 'all 0.2s', border: '1px solid transparent' }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.borderColor = 'transparent';
                                            }}
                                        >
                                            {member.user.avatarUrl ? (
                                                <img src={getAvatarUrl(member.user.avatarUrl)} alt={member.user.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '600', color: 'white' }}>
                                                    {member.user.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div style={{ fontSize: '0.95rem', fontWeight: '500', color: '#e2e8f0' }}>{member.user.name}</div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Chat Section */}
                    <div className="project-chat" style={{
                        background: 'rgba(30, 41, 59, 0.4)', // Darker base like cards
                        backdropFilter: 'blur(12px)',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '600px' // Fixed height for sticky chat window
                    }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255, 255, 255, 0.02)' }}>
                            <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '8px', borderRadius: '10px' }}>
                                <MessageSquare size={20} color="#a855f7" />
                            </div>
                            <h3 style={{ margin: 0, fontWeight: '700', letterSpacing: '-0.5px' }}>Team Chat</h3>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', scrollBehavior: 'smooth' }}>
                            {messages.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#64748b', marginTop: 'auto', marginBottom: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ background: 'rgba(148, 163, 184, 0.05)', padding: '1.5rem', borderRadius: '50%' }}>
                                        <MessageSquare size={32} color="#64748b" />
                                    </div>
                                    <p style={{ fontSize: '0.95rem' }}>No messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isMe = msg.senderId === user?.id;
                                    return (
                                        <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '85%', display: 'flex', gap: '10px', flexDirection: isMe ? 'row-reverse' : 'row' }}
                                            className="group relative"
                                            onMouseEnter={(e) => {
                                                const btn = e.currentTarget.querySelector('.delete-btn');
                                                if (btn) btn.style.opacity = '1';
                                            }}
                                            onMouseLeave={(e) => {
                                                const btn = e.currentTarget.querySelector('.delete-btn');
                                                if (btn) btn.style.opacity = '0';
                                            }}
                                        >
                                            <div title={msg.sender.name} style={{ flexShrink: 0 }}>
                                                <img src={getAvatarUrl(msg.sender.avatarUrl)} alt={msg.sender.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }} />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                                <div style={{
                                                    background: isMe ? 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)' : 'rgba(30, 41, 59, 0.8)',
                                                    color: 'white',
                                                    padding: '10px 16px',
                                                    borderRadius: '18px',
                                                    borderTopRightRadius: isMe ? '4px' : '18px',
                                                    borderTopLeftRadius: isMe ? '18px' : '4px',
                                                    fontSize: '0.9rem',
                                                    lineHeight: '1.5',
                                                    boxShadow: isMe ? '0 4px 15px rgba(168, 85, 247, 0.3)' : '0 2px 5px rgba(0,0,0,0.1)',
                                                    border: isMe ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                                                    position: 'relative'
                                                }}>
                                                    {msg.content}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px', marginLeft: '4px', marginRight: '4px', fontWeight: '500' }}>
                                                    {msg.sender.name}
                                                </div>
                                            </div>

                                            {/* Delete Button (Visible for Admin, Owner, or Sender) */}
                                            {(isAdmin || isOwner || isMe) && (
                                                <button
                                                    className="delete-btn"
                                                    onClick={async () => {
                                                        if (window.confirm('Delete this message?')) {
                                                            try {
                                                                await api.delete(`/projects/messages/${msg.id}`);
                                                                setMessages(prev => prev.filter(m => m.id !== msg.id));
                                                            } catch (err) {
                                                                console.error("Failed to delete message", err);
                                                                alert("Failed to delete message");
                                                            }
                                                        }
                                                    }}
                                                    style={{
                                                        opacity: 0,
                                                        transition: 'all 0.2s',
                                                        background: 'rgba(239, 68, 68, 0.15)',
                                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                                        color: '#ef4444',
                                                        borderRadius: '50%',
                                                        width: '24px',
                                                        height: '24px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        alignSelf: 'center',
                                                        marginLeft: isMe ? '0' : '6px',
                                                        marginRight: isMe ? '6px' : '0'
                                                    }}
                                                    title="Delete Message"
                                                >
                                                    <X size={12} />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <form onSubmit={handleSendMessage} style={{
                            padding: '1.25rem',
                            borderTop: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            gap: '12px',
                            background: 'rgba(15, 23, 42, 0.9)',
                            backdropFilter: 'blur(20px)',
                            marginTop: 'auto'
                        }}>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                style={{
                                    flex: 1,
                                    padding: '12px 16px',
                                    borderRadius: '14px',
                                    border: '1px solid rgba(148, 163, 184, 0.1)',
                                    background: 'rgba(30, 41, 59, 0.4)',
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    outline: 'none',
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'rgba(168, 85, 247, 0.4)';
                                    e.target.style.background = 'rgba(30, 41, 59, 0.6)';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(168, 85, 247, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(148, 163, 184, 0.1)';
                                    e.target.style.background = 'rgba(30, 41, 59, 0.4)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                            <button type="submit" disabled={!newMessage.trim()} style={{
                                padding: '0 20px',
                                borderRadius: '12px',
                                border: 'none',
                                background: newMessage.trim() ? 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)' : '#334155',
                                color: 'white',
                                cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                opacity: newMessage.trim() ? 1 : 0.6,
                                transform: newMessage.trim() ? 'scale(1)' : 'scale(0.95)'
                            }}>
                                <Send size={18} className={newMessage.trim() ? 'animate-pulse-slow' : ''} />
                            </button>
                        </form>
                    </div>

                </div>

                {/* Main Content (Right) */}
                <div className="project-main">
                    <div className="project-header" style={{ marginBottom: '2rem' }}>
                        <span className="project-category-tag" style={{ color: '#a855f7', background: 'rgba(168, 85, 247, 0.1)', padding: '5px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '500' }}>
                            {project.category}
                        </span>
                        <h1 style={{ fontSize: '3rem', marginTop: '1.25rem', marginBottom: '1.5rem', lineHeight: '1.2', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{project.title}</h1>
                        <div style={{ display: 'flex', gap: '24px', color: '#94a3b8' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '8px' }}>
                                <Calendar size={18} color="#a855f7" />
                                <span>Started {new Date(project.startDate).toLocaleDateString()}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '8px' }}>
                                <Clock size={18} color="#a855f7" />
                                <span>{project.duration}</span>
                            </div>
                        </div>
                    </div>

                    {/* OWNER DASHBOARD: Pending Requests */}
                    {isOwner && pendingRequests.length > 0 && (
                        <div style={{ marginBottom: '3rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                                <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '8px', borderRadius: '10px' }}>
                                    <Shield color="#a855f7" size={24} />
                                </div>
                                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>Pending Join Requests</h2>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                                {pendingRequests.map((req) => {
                                    const aiScore = req.aiInsight?.score || 0;
                                    let scoreColor = '#cbd5e1'; // gray default
                                    if (aiScore >= 80) scoreColor = '#22c55e'; // green
                                    else if (aiScore >= 50) scoreColor = '#eab308'; // yellow
                                    else if (aiScore > 0) scoreColor = '#ef4444'; // red

                                    return (
                                        <div key={req.id} style={{
                                            background: 'rgba(30, 41, 59, 0.6)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '16px',
                                            padding: '1.5rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '1.5rem'
                                        }}>
                                            {/* Header: User & Actions */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                                <Link to={`/profile/${req.user.id}`} style={{ display: 'flex', gap: '1rem', textDecoration: 'none', color: 'inherit' }}>
                                                    <img src={getAvatarUrl(req.user.avatarUrl)} alt={req.user.name} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }} />
                                                    <div>
                                                        <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>{req.user.name}</h3>
                                                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>{req.user.title || 'No Title'}</p>
                                                    </div>
                                                </Link>

                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <button onClick={() => handleRequestAction(req.id, 'accepted')} style={{
                                                        background: '#22c55e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px'
                                                    }}>
                                                        Check <span style={{ fontSize: '1.1em' }}>✓</span> Accept
                                                    </button>
                                                    <button onClick={() => handleRequestAction(req.id, 'rejected')} style={{
                                                        background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px'
                                                    }}>
                                                        X Reject
                                                    </button>
                                                </div>
                                            </div>

                                            {/* AI Analysis Section */}
                                            {req.aiInsight ? (
                                                <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '1.25rem', borderRadius: '12px', borderLeft: `4px solid ${scoreColor}` }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <span style={{ fontSize: '1rem' }}>🤖</span>
                                                            <span style={{ fontWeight: '700', color: scoreColor, fontSize: '1.1rem' }}>
                                                                Match Score: {aiScore}%
                                                            </span>
                                                        </div>
                                                        <span style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>AI Analysis</span>
                                                    </div>
                                                    <p style={{ margin: 0, lineHeight: '1.6', color: '#cbd5e1', fontSize: '0.95rem' }}>
                                                        {req.aiInsight.result.reason || "Analysis available."}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.9rem' }}>
                                                    AI analysis pending or unavailable.
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="project-description" style={{ background: 'rgba(30, 41, 59, 0.4)', backdropFilter: 'blur(12px)', padding: '2.5rem', borderRadius: '24px', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Folder size={24} color="#a855f7" /> About the Project
                        </h3>
                        <p style={{ lineHeight: '1.8', color: '#cbd5e1', whiteSpace: 'pre-line', fontSize: '1.05rem' }}>{project.description}</p>
                    </div>

                    <div className="project-skills" style={{ marginBottom: '3rem' }}>
                        <h3 style={{ marginBottom: '1rem', color: '#94a3b8', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Required Skills</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                            {project.skills && project.skills.split(',').map((skill, index) => (
                                <span key={index} style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '8px 16px', borderRadius: '12px', fontSize: '0.95rem', border: '1px solid rgba(255,255,255,0.05)', color: '#e2e8f0' }}>
                                    {skill.trim()}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProjectDetails;
