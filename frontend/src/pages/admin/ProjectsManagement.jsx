import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Edit2,
    Trash2,
    Eye,
    Folder,
    CheckCircle,
    Clock,
    XCircle,
    FileText
} from 'lucide-react';
import api from '../../api/axios';

const ProjectsManagement = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters and Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProjects, setTotalProjects] = useState(0);

    // Using mock until context is provided consistently
    const useToast = () => ({
        addToast: (message, type) => {
            console.log(`Toast (${type}): ${message}`);
        }
    }); // Replace with actual Context
    const { addToast } = useToast();

    // Fetch Projects
    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            try {
                const response = await api.get('/admin/projects', {
                    params: {
                        page,
                        limit: 10,
                        search: searchTerm,
                        status: statusFilter
                    }
                });

                const { projects, total, pages } = response.data;

                // Map API data to UI
                const formattedProjects = projects.map(p => ({
                    id: p.id,
                    title: p.title,
                    owner: p.owner?.name || 'Unknown',
                    ownerAvatar: p.owner?.avatarUrl || `https://ui-avatars.com/api/?name=${p.owner?.name || 'U'}&background=random`,
                    status: p.isActive ? 'Active' : 'Pending', // Simplified status mapping
                    category: p.category || 'Uncategorized'
                }));

                setProjects(formattedProjects);
                setTotalProjects(total);
                setTotalPages(pages);
            } catch (error) {
                console.error('Failed to fetch projects:', error);
                addToast('Failed to load projects', 'error');
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchProjects();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [page, searchTerm, statusFilter]);

    // Handlers
    const handleDelete = async (id) => {
        if (window.confirm('Soft delete this project?')) {
            try {
                await api.delete(`/admin/projects/${id}`);
                addToast('Project deleted successfully', 'success');
                // Refresh list
                setProjects(prev => prev.filter(p => p.id !== id));
                setTotalProjects(prev => prev - 1);
            } catch (error) {
                console.error('Delete failed:', error);
                addToast('Failed to delete project', 'error');
            }
        }
    };

    const handleEdit = (title) => {
        addToast(`Editing project: ${title}`, 'info');
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    // Helper for Status Colors
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'active': return { bg: 'rgba(16, 185, 129, 0.15)', text: '#6ee7b7', border: 'rgba(16, 185, 129, 0.3)', icon: <CheckCircle size={14} /> };
            case 'pending': return { bg: 'rgba(245, 158, 11, 0.15)', text: '#fcd34d', border: 'rgba(245, 158, 11, 0.3)', icon: <Clock size={14} /> };
            case 'completed': return { bg: 'rgba(59, 130, 246, 0.15)', text: '#93c5fd', border: 'rgba(59, 130, 246, 0.3)', icon: <CheckCircle size={14} /> };
            default: return { bg: 'rgba(148, 163, 184, 0.15)', text: '#cbd5e1', border: 'rgba(148, 163, 184, 0.3)', icon: <XCircle size={14} /> };
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
                        Projects Management
                    </h1>
                    <p style={{ color: '#94a3b8', margin: 0 }}>Oversee all platform projects, assess status, and moderate content.</p>
                </div>
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
                        placeholder="Search by title or owner..."
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
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
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
                                <th style={{ padding: '20px', textAlign: 'left', color: '#94a3b8', fontWeight: '600', fontSize: '0.9rem' }}>PROJECT TITLE</th>
                                <th style={{ padding: '20px', textAlign: 'left', color: '#94a3b8', fontWeight: '600', fontSize: '0.9rem' }}>OWNER</th>
                                <th style={{ padding: '20px', textAlign: 'left', color: '#94a3b8', fontWeight: '600', fontSize: '0.9rem' }}>CATEGORY</th>
                                <th style={{ padding: '20px', textAlign: 'left', color: '#94a3b8', fontWeight: '600', fontSize: '0.9rem' }}>STATUS</th>
                                <th style={{ padding: '20px', textAlign: 'right', color: '#94a3b8', fontWeight: '600', fontSize: '0.9rem' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center' }}>Loading projects...</td></tr>
                            ) : projects.length > 0 ? projects.map((project) => (
                                <tr key={project.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                padding: '10px',
                                                background: 'rgba(168, 85, 247, 0.1)',
                                                borderRadius: '10px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <Folder size={20} color="#a855f7" />
                                            </div>
                                            <span style={{ fontWeight: '600', fontSize: '1rem', color: 'white' }}>{project.title}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <img
                                                src={project.ownerAvatar}
                                                alt={project.owner}
                                                style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }}
                                            />
                                            <span style={{ color: '#cbd5e1' }}>{project.owner}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px', color: '#cbd5e1' }}>
                                        {project.category}
                                    </td>
                                    <td style={{ padding: '20px' }}>
                                        {(() => {
                                            const style = getStatusColor(project.status);
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
                                                    color: style.text,
                                                    border: `1px solid ${style.border}`
                                                }}>
                                                    {style.icon}
                                                    {project.status}
                                                </span>
                                            );
                                        })()}
                                    </td>
                                    <td style={{ padding: '20px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                                            <ActionButton icon={<Eye size={18} />} color="#3b82f6" title="View Details" onClick={() => window.location.href = `/projects/${project.id}`} />
                                            <ActionButton icon={<Edit2 size={18} />} color="#f59e0b" title="Edit Category/Status" onClick={() => handleEdit(project.title)} />
                                            <ActionButton icon={<Trash2 size={18} />} color="#ef4444" title="Soft Delete Project" onClick={() => handleDelete(project.id)} />
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                        No projects found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Showing {projects.length > 0 ? (page - 1) * 10 + 1 : 0}-{(page - 1) * 10 + projects.length} of {totalProjects} projects</span>
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

// Helper Action Button
const ActionButton = ({ icon, color, title, onClick }) => (
    <button style={{
        background: 'transparent',
        border: 'none',
        color: '#94a3b8',
        padding: '8px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }}
        title={title}
        onClick={onClick}
        onMouseOver={(e) => {
            e.currentTarget.style.background = `${color}20`; // 20 hex opacity
            e.currentTarget.style.color = color;
        }}
        onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#94a3b8';
        }}
    >
        {icon}
    </button>
);

export default ProjectsManagement;
