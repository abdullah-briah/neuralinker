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
            background: '#0f172a',
            color: 'white'
        }}>
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#a0a0b0', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', marginBottom: '1rem' }}>
                <ArrowLeft size={18} /> Back
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>

                {/* Main Content */}
                <div className="project-main">
                    <div className="project-header" style={{ marginBottom: '2rem' }}>
                        <span className="project-category-tag" style={{ color: '#a855f7', background: 'rgba(168, 85, 247, 0.1)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem' }}>
                            {project.category}
                        </span>
                        <h1 style={{ fontSize: '2.5rem', marginTop: '1rem', marginBottom: '1.5rem' }}>{project.title}</h1>
                        <div style={{ display: 'flex', gap: '20px', color: '#a0a0b0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Calendar size={18} />
                                <span>Started {new Date(project.startDate).toLocaleDateString()}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Clock size={18} />
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

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

                    <div className="project-description" style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '12px', marginBottom: '2rem' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>About the Project</h3>
                        <p style={{ lineHeight: '1.6', color: '#e0e0e0', whiteSpace: 'pre-line' }}>{project.description}</p>
                    </div>

                    <div className="project-skills" style={{ marginBottom: '3rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Required Skills</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {project.skills && project.skills.split(',').map((skill, index) => (
                                <span key={index} style={{ background: '#334155', padding: '6px 14px', borderRadius: '6px', fontSize: '0.9rem' }}>
                                    {skill.trim()}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Chat Section */}
                    <div className="project-chat" style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 255, 255, 0.02)' }}>
                            <MessageSquare size={20} color="#a855f7" />
                            <h3 style={{ margin: 0, fontWeight: '600', letterSpacing: '-0.5px' }}>Team Chat</h3>
                        </div>

                        <div style={{ height: '400px', overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {messages.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                                        <MessageSquare size={32} color="#a855f7" />
                                    </div>
                                    <p>No messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isMe = msg.senderId === user?.id;
                                    return (
                                        <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%', display: 'flex', gap: '12px', flexDirection: isMe ? 'row-reverse' : 'row' }}>
                                            <div title={msg.sender.name} style={{ flexShrink: 0 }}>
                                                <img src={getAvatarUrl(msg.sender.avatarUrl)} alt={msg.sender.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }} />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                                <div style={{
                                                    background: isMe ? 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)' : '#1e293b',
                                                    color: 'white',
                                                    padding: '12px 18px',
                                                    borderRadius: '16px',
                                                    borderTopRightRadius: isMe ? '4px' : '16px',
                                                    borderTopLeftRadius: isMe ? '16px' : '4px',
                                                    fontSize: '0.95rem',
                                                    lineHeight: '1.5',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                    border: isMe ? 'none' : '1px solid rgba(255,255,255,0.1)'
                                                }}>
                                                    {msg.content}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px', marginLeft: '4px', marginRight: '4px' }}>
                                                    {msg.sender.name} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <form onSubmit={handleSendMessage} style={{ padding: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '12px', background: 'rgba(15, 23, 42, 0.4)' }}>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                style={{
                                    flex: 1,
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(148, 163, 184, 0.2)',
                                    background: 'rgba(30, 41, 59, 0.5)',
                                    color: 'white',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'rgba(168, 85, 247, 0.5)';
                                    e.target.style.background = 'rgba(30, 41, 59, 0.8)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(148, 163, 184, 0.2)';
                                    e.target.style.background = 'rgba(30, 41, 59, 0.5)';
                                }}
                            />
                            <button type="submit" disabled={!newMessage.trim()} style={{
                                padding: '0 24px',
                                borderRadius: '12px',
                                border: 'none',
                                background: newMessage.trim() ? 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)' : '#334155',
                                color: 'white',
                                cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                                opacity: newMessage.trim() ? 1 : 0.7
                            }}>
                                <Send size={20} />
                            </button>
                        </form>
                    </div>

                </div>

                {/* Sidebar */}
                <div className="project-sidebar">
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(10px)',
                        padding: '1.5rem',
                        borderRadius: '20px',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <Users size={20} color="#22c55e" />
                            <h3 style={{ margin: 0 }}>Project Team</h3>
                        </div>

                        {/* Owner */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#a0a0b0', marginBottom: '0.8rem', letterSpacing: '0.5px' }}>Project Owner</div>
                            <Link to={`/profile/${project.owner.id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit', padding: '8px', borderRadius: '8px', transition: 'background 0.2s' }} className="member-link">
                                {project.owner.avatarUrl ? (
                                    <img src={getAvatarUrl(project.owner.avatarUrl)} alt={project.owner.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                        {project.owner.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <div style={{ fontWeight: '600' }}>{project.owner.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#a0a0b0' }}>Leader</div>
                                </div>
                            </Link>
                        </div>

                        {/* Members */}
                        <div>
                            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#a0a0b0', marginBottom: '0.8rem', letterSpacing: '0.5px' }}>Members ({membersList.filter(m => m.user.id !== project.owner.id).length})</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {membersList.filter(m => m.user.id !== project.owner.id).length === 0 ? (
                                    <p style={{ fontSize: '0.9rem', color: '#666', fontStyle: 'italic' }}>No other members yet.</p>
                                ) : (
                                    membersList.filter(m => m.user.id !== project.owner.id).map((member) => (
                                        <Link key={member.id} to={`/profile/${member.user.id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit', padding: '8px', borderRadius: '8px', transition: 'background 0.2s' }} className="member-link">
                                            {member.user.avatarUrl ? (
                                                <img src={getAvatarUrl(member.user.avatarUrl)} alt={member.user.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                    {member.user.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div style={{ fontSize: '0.95rem' }}>{member.user.name}</div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProjectDetails;
