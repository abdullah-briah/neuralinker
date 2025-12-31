// src/pages/UserProfile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import api from "../api/axios";
import EditProfileModal from "../components/EditProfileModal";
import {
    Mail,
    Github,
    Linkedin,
    Briefcase,
    MapPin,
    User,
    Edit2,
    Check,
    X,
    ArrowLeft,
    Shield
} from 'lucide-react';

const UserProfile = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Get user ID from URL
    const location = useLocation(); // Get query params
    const queryParams = new URLSearchParams(location.search);
    const joinRequestId = queryParams.get("joinRequestId");

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [joinRequest, setJoinRequest] = useState(null);

    // Determines if we are viewing our own profile
    const isOwnProfile = !id || id === "me";

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // 1. Fetch User Profile
                const endpoint = isOwnProfile ? "/users/me" : `/users/${id}`;
                const res = await api.get(endpoint);
                setUser(res.data);

                // 2. If there is a joinRequestId, fetch its details
                if (joinRequestId) {
                    const reqRes = await api.get(`/join-requests/request/${joinRequestId}`);
                    setJoinRequest(reqRes.data);
                }

            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, joinRequestId, isOwnProfile]);

    const handleSave = async (formData) => {
        try {
            const res = await api.put("/users/me", formData);
            setUser(res.data);
            return res.data;
        } catch (error) {
            console.error("Failed to save profile", error);
            alert("Failed to save profile.");
            throw error;
        }
    };

    const handleRespond = async (status) => {
        if (!joinRequestId) return;
        try {
            await api.patch(`/join-requests/${joinRequestId}/respond`, { status });
            // Refresh request data
            const reqRes = await api.get(`/join-requests/request/${joinRequestId}`);
            setJoinRequest(reqRes.data);
        } catch (error) {
            console.error("Failed to respond", error);
            alert("Failed to respond to request.");
        }
    };

    // Helper to resolve avatar URL
    const getAvatarSrc = (url) => {
        if (!url) return "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
        if (url.startsWith("http")) return url;
        let baseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
        if (baseUrl.endsWith("/api")) baseUrl = baseUrl.slice(0, -4);
        const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
        // If path already includes uploads/ (legacy data), don't add it again
        if (cleanUrl.startsWith('uploads/')) return `${baseUrl}/${cleanUrl}`;
        return `${baseUrl}/uploads/${cleanUrl}`;
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: '#a0a0b0' }}>
            Loading profile...
        </div>
    );
    if (!user) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: '#ef4444' }}>
            User not found
        </div>
    );

    return (
        <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    marginBottom: '2rem',
                    padding: '10px 18px',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateX(-2px)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.transform = 'translateX(0)';
                }}
            >
                <ArrowLeft size={18} /> Back
            </button>

            {/* Join Request Action Banner */}
            {joinRequest && joinRequest.status?.toLowerCase() === 'pending' && (
                <div style={{
                    marginBottom: "3rem",
                    padding: "2rem",
                    background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(168, 85, 247, 0.3)",
                    borderRadius: "20px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "20px",
                    justifyContent: "space-between",
                    alignItems: "center",
                    boxShadow: "0 8px 30px rgba(168, 85, 247, 0.15)"
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                            padding: '16px',
                            borderRadius: '16px',
                            boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
                        }}>
                            <Shield color="white" size={28} />
                        </div>
                        <div>
                            <h3 style={{ margin: "0 0 5px 0", color: "#fff", fontSize: '1.4rem', fontWeight: '700' }}>Project Join Request</h3>
                            <p style={{ margin: 0, color: "#cbd5e1", fontSize: "1.05rem" }}>
                                <strong style={{ color: "white" }}>{user.name}</strong> wants to join <strong style={{ color: "#a855f7" }}>{joinRequest.project?.title}</strong>
                            </p>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "16px" }}>
                        <button
                            onClick={() => handleRespond("accepted")}
                            style={{
                                background: "#22c55e",
                                color: 'white',
                                border: 'none',
                                padding: '12px 28px',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontSize: '1rem',
                                fontWeight: '700',
                                boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
                                transition: 'all 0.2s',
                            }}
                            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                            <Check size={20} strokeWidth={3} /> Accept
                        </button>
                        <button
                            onClick={() => handleRespond("rejected")}
                            style={{
                                background: "rgba(239, 68, 68, 0.1)",
                                color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                padding: '12px 28px',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontSize: '1rem',
                                fontWeight: '700',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                                e.target.style.transform = 'translateY(-2px)';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                                e.target.style.transform = 'translateY(0)';
                            }}
                        >
                            <X size={20} strokeWidth={3} /> Reject
                        </button>
                    </div>
                </div>
            )}

            {/* Main Profile Layout */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 350px',
                gap: '2.5rem',
                alignItems: 'start',
                '@media (max-width: 900px)': {
                    gridTemplateColumns: '1fr'
                }
            }}>

                {/* Left Column: Header & Bio */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Header Card */}
                    <div className="glass-card" style={{
                        padding: '3rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2.5rem',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Gradient Bg */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '50%',
                            height: '100%',
                            background: 'radial-gradient(circle at top right, rgba(168, 85, 247, 0.15), transparent 70%)',
                            pointerEvents: 'none'
                        }}></div>

                        {/* Avatar */}
                        <div style={{
                            position: 'relative',
                            flexShrink: 0
                        }}>
                            <div style={{
                                width: '140px',
                                height: '140px',
                                borderRadius: '50%',
                                padding: '4px',
                                background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                            }}>
                                <img
                                    src={getAvatarSrc(user.avatarUrl)}
                                    alt={user.name}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '4px solid #1e293b'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h1 style={{
                                        margin: '0 0 8px 0',
                                        fontSize: '2.5rem',
                                        fontWeight: '800',
                                        letterSpacing: '-0.5px',
                                        color: 'white',
                                        lineHeight: 1.1
                                    }}>
                                        {user.name}
                                    </h1>
                                    <p style={{
                                        margin: '0 0 20px 0',
                                        fontSize: '1.2rem',
                                        color: '#a855f7',
                                        fontWeight: '600'
                                    }}>
                                        {user.title || "Full Stack Developer"}
                                    </p>
                                </div>

                                {isOwnProfile && (
                                    <button
                                        onClick={() => setIsEditOpen(true)}
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            borderRadius: '12px',
                                            padding: '10px 20px',
                                            color: 'white',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontSize: '0.95rem',
                                            fontWeight: '600',
                                            backdropFilter: 'blur(4px)',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.background = '#a855f7';
                                            e.currentTarget.style.borderColor = '#a855f7';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                        }}
                                    >
                                        <Edit2 size={16} /> Edit Profile
                                    </button>
                                )}
                            </div>

                            {/* Contact Grid */}
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    background: 'rgba(0,0,0,0.2)', padding: '8px 16px', borderRadius: '10px',
                                    border: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1', fontSize: '0.9rem'
                                }}>
                                    <MapPin size={16} color="#94a3b8" />
                                    Remote
                                </div>
                                {isOwnProfile && user.email && (
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        background: 'rgba(0,0,0,0.2)', padding: '8px 16px', borderRadius: '10px',
                                        border: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1', fontSize: '0.9rem'
                                    }}>
                                        <Mail size={16} color="#94a3b8" />
                                        {user.email}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bio Section */}
                    <div className="glass-card" style={{ padding: '2.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '10px', borderRadius: '12px' }}>
                                <User color="#22c55e" size={24} />
                            </div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>About Me</h2>
                        </div>
                        <p style={{
                            lineHeight: '1.8',
                            color: '#cbd5e1',
                            whiteSpace: 'pre-line',
                            fontSize: '1.05rem',
                            margin: 0
                        }}>
                            {user.bio || "No bio provided yet. Click edit to tell us about yourself!"}
                        </p>
                    </div>

                </div>

                {/* Right Column: Skills & Socials */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Skills Card */}
                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '12px' }}>
                                <Briefcase color="#3b82f6" size={24} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700', color: 'white' }}>Skills</h3>
                        </div>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                            {user.skills && user.skills.length > 0 ? user.skills.map((skill, i) => (
                                <span key={i} style={{
                                    background: 'rgba(56, 189, 248, 0.1)',
                                    color: '#bae6fd',
                                    border: '1px solid rgba(56, 189, 248, 0.2)',
                                    padding: "10px 18px",
                                    borderRadius: "14px",
                                    fontSize: "0.95rem",
                                    fontWeight: '600',
                                    cursor: 'default',
                                    transition: 'all 0.2s'
                                }}
                                    onMouseOver={(e) => {
                                        e.target.style.background = 'rgba(56, 189, 248, 0.2)';
                                        e.target.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.background = 'rgba(56, 189, 248, 0.1)';
                                        e.target.style.transform = 'translateY(0)';
                                    }}
                                >
                                    {skill}
                                </span>
                            )) : (
                                <p style={{ color: '#64748b', fontStyle: 'italic' }}>No skills listed.</p>
                            )}
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="glass-card">
                        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', fontWeight: '600', color: 'white' }}>Connect</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {user.github ? (
                                <a href={user.github} target="_blank" rel="noopener noreferrer" style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '14px', borderRadius: '16px',
                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                                    color: 'white', textDecoration: 'none', transition: 'all 0.2s'
                                }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                >
                                    <Github size={20} />
                                    <span style={{ fontWeight: '500' }}>GitHub Profile</span>
                                </a>
                            ) : (
                                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>• GitHub not connected</div>
                            )}

                            {user.linkedin ? (
                                <a href={user.linkedin} target="_blank" rel="noopener noreferrer" style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '14px', borderRadius: '16px',
                                    background: 'rgba(10, 102, 194, 0.1)', border: '1px solid rgba(10, 102, 194, 0.2)',
                                    color: '#3b82f6', textDecoration: 'none', transition: 'all 0.2s'
                                }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(10, 102, 194, 0.2)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(10, 102, 194, 0.1)'}
                                >
                                    <Linkedin size={20} />
                                    <span style={{ fontWeight: '500' }}>LinkedIn Profile</span>
                                </a>
                            ) : (
                                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>• LinkedIn not connected</div>
                            )}
                        </div>
                    </div>

                </div>

            </div>

            <EditProfileModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                currentUser={user}
                onSave={handleSave}
                onUpdateUser={setUser}
            />
        </div>
    );
};

export default UserProfile;
