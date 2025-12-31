import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Check,
    X,
    Clock,
    CheckCircle,
    XCircle,
    FileText,
    User
} from 'lucide-react';
import api from '../../api/axios';

const JoinRequestsManagement = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRequests, setTotalRequests] = useState(0);

    const useToast = () => ({
        addToast: (message, type) => {
            console.log(`Toast (${type}): ${message}`);
        }
    }); // Replace with actual Context
    const { addToast } = useToast();

    // Fetch Requests
    useEffect(() => {
        const fetchRequests = async () => {
            setLoading(true);
            try {
                const response = await api.get('/admin/requests', {
                    params: {
                        page,
                        limit: 10,
                        search: searchTerm,
                        status: statusFilter
                    }
                });

                const { requests, total, pages } = response.data;

                // Map API data
                const formattedRequests = requests.map(r => ({
                    id: r.id,
                    project: r.project?.title || 'Unknown Project',
                    userName: r.user?.name || 'Unknown User',
                    userAvatar: r.user?.avatarUrl || `https://ui-avatars.com/api/?name=${r.user?.name || 'U'}&background=random`,
                    date: new Date(r.createdAt).toLocaleDateString(),
                    status: r.status,
                    note: r.aiInsight ? 'AI Matches Available' : '' // Example usage of aiInsight or note if exists
                }));

                setRequests(formattedRequests);
                setTotalRequests(total);
                setTotalPages(pages);
            } catch (error) {
                console.error('Failed to fetch requests:', error);
                addToast('Failed to load requests', 'error');
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchRequests();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [page, searchTerm, statusFilter]);

    // Handlers
    const handleAction = async (id, action) => {
        // Optimistic update or API call
        // For now, mock the API call availability
        addToast(`Action ${action} triggered (Backend impl in progress)`, 'info');
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'accepted': return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', icon: <CheckCircle size={14} /> };
            case 'rejected': return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', icon: <XCircle size={14} /> };
            default: return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: <Clock size={14} /> };
        }
    };

    return (
        <div style={{
            padding: '2rem',
            color: 'white',
            fontFamily: "'Inter', sans-serif",
            maxWidth: '1600px',
            margin: '0 auto'
        }}>
            {/* Page Header */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: '800',
                    margin: '0 0 8px 0',
                    background: 'linear-gradient(90deg, #fff, #cbd5e1)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Join Requests
                </h1>
                <p style={{ color: '#94a3b8', margin: 0 }}>Review and manage pending requests from talents wishing to join projects.</p>
            </div>

            {/* Filters Bar */}
            <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                backdropFilter: 'blur(10px)',
                padding: '1.5rem',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '2rem',
                display: 'flex',
                gap: '20px',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                    <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search by project or user name..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        style={{
                            width: '90%',
                            padding: '14px 16px 14px 50px',
                            background: 'rgba(15, 23, 42, 0.6)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '0.95rem',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Filter size={20} color="#94a3b8" />
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        style={{
                            padding: '12px 16px',
                            background: 'rgba(15, 23, 42, 0.6)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '0.95rem',
                            outline: 'none',
                            cursor: 'pointer',
                            minWidth: '150px'
                        }}
                    >
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                        <option value="all">All Requests</option>
                    </select>
                </div>
            </div>

            {/* Requests Table */}
            <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                overflow: 'hidden'
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                        <thead>
                            <tr style={{ background: 'rgba(15, 23, 42, 0.4)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <th style={{ padding: '20px', textAlign: 'left', color: '#94a3b8', fontWeight: '600', fontSize: '0.9rem' }}>PROJECT</th>
                                <th style={{ padding: '20px', textAlign: 'left', color: '#94a3b8', fontWeight: '600', fontSize: '0.9rem' }}>USER</th>
                                <th style={{ padding: '20px', textAlign: 'left', color: '#94a3b8', fontWeight: '600', fontSize: '0.9rem' }}>DATE</th>
                                <th style={{ padding: '20px', textAlign: 'left', color: '#94a3b8', fontWeight: '600', fontSize: '0.9rem' }}>STATUS</th>
                                <th style={{ padding: '20px', textAlign: 'right', color: '#94a3b8', fontWeight: '600', fontSize: '0.9rem' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center' }}>Loading requests...</td></tr>
                            ) : requests.length > 0 ? requests.map((req) => (
                                <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '20px', fontWeight: '600', color: 'white' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            {req.project}
                                            {req.note && (
                                                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '400', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <FileText size={12} /> {req.note}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <img
                                                src={req.userAvatar}
                                                alt={req.userName}
                                                style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }}
                                            />
                                            <span style={{ color: '#cbd5e1' }}>{req.userName}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px', color: '#cbd5e1', fontSize: '0.9rem' }}>
                                        {req.date}
                                    </td>
                                    <td style={{ padding: '20px' }}>
                                        {(() => {
                                            const style = getStatusStyle(req.status);
                                            return (
                                                <span style={{
                                                    padding: '6px 14px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    background: style.bg,
                                                    color: style.color,
                                                    border: `1px solid ${style.color}40`, // 40 hex opacity
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {style.icon}
                                                    {req.status}
                                                </span>
                                            );
                                        })()}
                                    </td>
                                    <td style={{ padding: '20px', textAlign: 'right' }}>
                                        {req.status === 'pending' ? (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                                                <button
                                                    onClick={() => handleAction(req.id, 'accepted')}
                                                    style={{
                                                        background: '#10b981',
                                                        border: 'none',
                                                        color: 'white',
                                                        padding: '8px 16px',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        fontWeight: '600',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        fontSize: '0.9rem',
                                                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                                                    }}
                                                >
                                                    <Check size={16} /> Accept
                                                </button>
                                                <button
                                                    onClick={() => handleAction(req.id, 'rejected')}
                                                    style={{
                                                        background: 'transparent',
                                                        border: '1px solid rgba(239, 68, 68, 0.5)',
                                                        color: '#ef4444',
                                                        padding: '8px 16px',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        fontWeight: '600',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        fontSize: '0.9rem'
                                                    }}
                                                >
                                                    <X size={16} /> Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Action taken</span>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                        No requests found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Showing {requests.length > 0 ? (page - 1) * 10 + 1 : 0}-{(page - 1) * 10 + requests.length} of {totalRequests} requests</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            style={{
                                padding: '8px 16px',
                                background: page === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                                border: 'none',
                                borderRadius: '8px',
                                color: page === 1 ? '#64748b' : 'white',
                                cursor: page === 1 ? 'not-allowed' : 'pointer'
                            }}>
                            Previous
                        </button>
                        <span style={{ display: 'flex', alignItems: 'center', padding: '0 10px', color: '#94a3b8' }}>Page {page} of {totalPages}</span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            style={{
                                padding: '8px 16px',
                                background: page === totalPages ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                                border: 'none',
                                borderRadius: '8px',
                                color: page === totalPages ? '#64748b' : 'white',
                                cursor: page === totalPages ? 'not-allowed' : 'pointer'
                            }}>
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JoinRequestsManagement;
