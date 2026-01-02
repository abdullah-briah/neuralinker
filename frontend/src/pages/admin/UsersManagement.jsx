import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    MoreVertical,
    Edit2,
    Trash2,
    Eye,
    Shield,
    User,
    CheckCircle,
    XCircle
} from 'lucide-react';
import api from '../../api/axios';

const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters and Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    // Assuming useToast is provided by a parent component or context
    const useToast = () => ({
        addToast: (message, type) => {
            console.log(`Toast (${type}): ${message}`);
        }
    }); // Replace with actual Context if available
    const { addToast } = useToast();

    // Fetch Users
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await api.get('/admin/users', {
                    params: {
                        page,
                        limit: 10,
                        search: searchTerm,
                        role: roleFilter
                    }
                });

                const { users, total, pages } = response.data;

                // Map API data to UI format
                const formattedUsers = users.map(u => {
                    let avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=random`;

                    if (u.avatarUrl) {
                        if (u.avatarUrl.startsWith('http')) {
                            avatar = u.avatarUrl;
                        } else {
                            // Backend serves uploads at /uploads, assume port 4000 if not specified in env
                            const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:4000';

                            // If it starts with /, use it as is. If not, assume it's a filename in /uploads
                            let cleanPath = u.avatarUrl;
                            if (!cleanPath.startsWith('/')) {
                                cleanPath = `/uploads/${cleanPath}`;
                            }

                            avatar = `${baseUrl}${cleanPath}`;
                        }
                    }

                    return {
                        id: u.id,
                        name: u.name,
                        email: u.email,
                        title: u.title || 'N/A',
                        role: u.role,
                        avatar: avatar,
                        status: u.isVerified ? 'active' : 'pending'
                    };
                });

                setUsers(formattedUsers.filter(u => u.email !== 'admin@neuralinker.com')); // Or better, filter by context ID if needed but email is safer hardcoded for "Admin" role if generic. Ideally use auth context.
                setTotalUsers(total - (formattedUsers.find(u => u.email === 'admin@neuralinker.com') ? 1 : 0));
                setTotalPages(Math.ceil((total - 1) / 10));
            } catch (error) {
                console.error('Failed to fetch users:', error);
                addToast('Failed to load users', 'error');
            } finally {
                setLoading(false);
            }
        };

        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [page, searchTerm, roleFilter]);

    // Handlers
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await api.delete(`/admin/users/${id}`);
                addToast('User deleted successfully', 'success');
                // Refresh list locally
                setUsers(prev => prev.filter(u => u.id !== id));
                setTotalUsers(prev => prev - 1);
            } catch (error) {
                console.error('Delete failed:', error);
                addToast(error.response?.data?.message || 'Failed to delete user', 'error');
            }
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: '800',
                        margin: '0 0 8px 0',
                        background: 'linear-gradient(90deg, #fff, #cbd5e1)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Users Management
                    </h1>
                    <p style={{ color: '#94a3b8', margin: 0 }}>Manage user access, roles, and profiles.</p>
                </div>

                <button
                    onClick={() => addToast('Add User Modal would open here', 'info')}
                    style={{
                        background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)',
                        transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <User size={18} /> Add New User
                </button>
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
                        placeholder="Search by name or email..."
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
                        value={roleFilter}
                        onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
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
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                    </select>
                </div>
            </div>

            {/* Table Container */}
            <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                overflow: 'hidden'
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead>
                            <tr style={{ background: 'rgba(15, 23, 42, 0.4)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <th style={{ padding: '20px', textAlign: 'left', color: '#94a3b8', fontWeight: '600', fontSize: '0.9rem' }}>USER</th>
                                <th style={{ padding: '20px', textAlign: 'left', color: '#94a3b8', fontWeight: '600', fontSize: '0.9rem' }}>TITLE</th>
                                <th style={{ padding: '20px', textAlign: 'left', color: '#94a3b8', fontWeight: '600', fontSize: '0.9rem' }}>ROLE</th>
                                <th style={{ padding: '20px', textAlign: 'left', color: '#94a3b8', fontWeight: '600', fontSize: '0.9rem' }}>STATUS</th>
                                <th style={{ padding: '20px', textAlign: 'right', color: '#94a3b8', fontWeight: '600', fontSize: '0.9rem' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center' }}>Loading users...</td></tr>
                            ) : users.length > 0 ? users.map((user) => (
                                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '1rem', color: 'white' }}>{user.name}</div>
                                                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px', color: '#cbd5e1' }}>
                                        {user.title}
                                    </td>
                                    <td style={{ padding: '20px' }}>
                                        <span style={{
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            background: user.role === 'admin' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                                            color: user.role === 'admin' ? '#d8b4fe' : '#93c5fd',
                                            border: `1px solid ${user.role === 'admin' ? 'rgba(168, 85, 247, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
                                        }}>
                                            {user.role === 'admin' ? <Shield size={14} /> : <User size={14} />}
                                            {user.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '20px' }}>
                                        <span style={{
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            background: user.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                                            color: user.status === 'active' ? '#6ee7b7' : '#94a3b8',
                                            border: `1px solid ${user.status === 'active' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(100, 116, 139, 0.3)'}`
                                        }}>
                                            {user.status === 'active' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '20px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                            <ActionButton icon={<Eye size={16} />} label="View" color="#3b82f6" onClick={() => window.location.href = `/profile/${user.id}`} />
                                            <ActionButton icon={<Trash2 size={16} />} label="Delete" color="#ef4444" onClick={() => handleDelete(user.id)} />
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                        No users found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Showing {users.length > 0 ? (page - 1) * 10 + 1 : 0}-{(page - 1) * 10 + users.length} of {totalUsers} users</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            disabled={page === 1}
                            onClick={() => handlePageChange(page - 1)}
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
                            onClick={() => handlePageChange(page + 1)}
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

// Helper for Action Buttons
const ActionButton = ({ icon, color, label, onClick }) => (
    <button onClick={onClick} style={{
        background: 'transparent',
        border: `1px solid ${color}40`,
        color: color,
        padding: '6px 12px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        fontSize: '0.85rem',
        fontWeight: '600'
    }}
        onMouseOver={(e) => {
            e.currentTarget.style.background = `${color}20`; // 20 hex opacity
            e.currentTarget.style.borderColor = color;
        }}
        onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = `${color}40`;
        }}
    >
        {icon} {label}
    </button>
);

export default UsersManagement;
