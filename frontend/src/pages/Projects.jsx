import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';
import ProjectQuickViewModal from '../components/ProjectQuickViewModal';
import { useAuth } from '../context/AuthContext';
import { Plus } from 'lucide-react';
import { useToast } from "../context/ToastContext";
import ConfirmationModal from "../components/ConfirmationModal";

const Projects = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [quickViewProject, setQuickViewProject] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [joining, setJoining] = useState({}); // Track join requests per project
    const [editingProject, setEditingProject] = useState(null); // Track project being edited

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await api.get('/projects');
            setProjects(Array.isArray(response.data) ? response.data : []);
            setError('');
        } catch (err) {
            console.error('Error fetching projects:', err);
            setError('Failed to load projects. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    // Handle Join Project
    const handleJoin = async (projectId) => {
        if (!user) return;
        setJoining(prev => ({ ...prev, [projectId]: true }));

        // Optimistic Update: Immediately show "Pending"
        setProjects(prevProjects => prevProjects.map(p => {
            if (p.id === projectId) {
                return {
                    ...p,
                    joinRequests: [...(p.joinRequests || []), { userId: user.id, status: 'pending' }]
                };
            }
            return p;
        }));

        try {
            await api.post(`/projects/${projectId}/join`);
            addToast('Join request sent successfully!', 'success');
        } catch (err) {
            console.error('Error sending join request:', err);
            const msg = err.response?.data?.message || 'Failed to send join request.';

            // Revert Optimistic Update on Error
            setProjects(prevProjects => prevProjects.map(p => {
                if (p.id === projectId) {
                    return {
                        ...p,
                        joinRequests: (p.joinRequests || []).filter(r => r.userId !== user.id)
                    };
                }
                return p;
            }));

            if (msg.includes("already joined") || msg.includes("requested to join")) {
                addToast(msg, 'info');
            } else {
                addToast(msg, 'error');
            }
        } finally {
            setJoining(prev => ({ ...prev, [projectId]: false }));
        }
    };

    // Handle Delete Project
    const handleDeleteClick = (projectId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Project',
            message: 'Are you sure you want to delete this project? This action cannot be undone.',
            onConfirm: () => performDelete(projectId)
        });
    };

    const performDelete = async (projectId) => {
        try {
            await api.delete(`/projects/${projectId}`);
            addToast('Project deleted successfully!', 'success');
            fetchProjects();
        } catch (err) {
            console.error('Error deleting project:', err);
            addToast(err.response?.data?.message || 'Failed to delete project.', 'error');
        }
    };

    // Handle Edit Project (opens modal)
    const handleEdit = (project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    // Handle View Details - Navigate to details page
    const handleViewDetails = (projectId) => {
        navigate(`/projects/${projectId}`);
    };

    // Handle Quick View - Sanitize data before opening modal
    const handleQuickView = (project) => {
        let parsedSkills = [];
        if (Array.isArray(project.skills)) {
            parsedSkills = project.skills;
        } else if (typeof project.skills === 'string') {
            parsedSkills = project.skills.split(',').map(s => s.trim()).filter(Boolean);
        }

        setQuickViewProject({
            ...project,
            skills: parsedSkills,
            duration: project.duration || 'N/A',
            startDate: project.startDate || null,
            owner: project.owner || { name: 'Unknown' }
        });
    };

    // Close modal and reset editing
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProject(null);
    };

    return (
        <div className="page-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 className="page-title" style={{ marginBottom: 0 }}>Explore Projects</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        background: 'linear-gradient(135deg, #a855f7 0%, #d8b4fe 100%)',
                        color: '#1e1b4b',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        fontWeight: '700',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)',
                        transition: 'transform 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <Plus size={20} strokeWidth={3} /> Create Project
                </button>
            </div>

            {loading ? (
                <div style={{ color: 'white', textAlign: 'center', marginTop: '2rem' }}>Loading projects...</div>
            ) : error ? (
                <div style={{ color: '#ef4444', textAlign: 'center', marginTop: '2rem' }}>{error}</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}>
                    {projects.length === 0 ? (
                        <p style={{ color: '#a0a0b0', gridColumn: '1/-1', textAlign: 'center' }}>No projects found. Be the first to create one!</p>
                    ) : (
                        projects.map(project => (
                            <div key={project.id} style={{ position: 'relative' }}>
                                <ProjectCard
                                    id={project.id}
                                    title={project.title}
                                    description={project.description}
                                    skills={Array.isArray(project.skills) ? project.skills : []}
                                    duration={project.duration || 'N/A'}
                                    startDate={project.startDate ? new Date(project.startDate).toLocaleDateString() : 'TBD'}
                                    ownerId={project.owner?.id}
                                    currentUserId={user?.id}
                                    // Status
                                    isMember={project.members?.length > 0}
                                    isPending={project.joinRequests?.length > 0}
                                    // Actions
                                    onJoin={() => handleJoin(project.id)}
                                    onEdit={() => handleEdit(project)}
                                    onDelete={() => handleDeleteClick(project.id)}
                                    onViewDetails={() => handleViewDetails(project.id)}
                                    onQuickView={() => handleQuickView(project)}
                                />
                            </div>
                        ))
                    )}
                </div>
            )}

            <CreateProjectModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onProjectCreated={() => {
                    fetchProjects();
                    addToast('Project saved successfully!', 'success');
                }}
                editingProject={editingProject} // pass project to modal for editing
            />

            <ProjectQuickViewModal
                isOpen={!!quickViewProject}
                onClose={() => setQuickViewProject(null)}
                project={quickViewProject}
            />

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText="Delete Project"
                isDangerous={true}
            />
        </div>
    );
};

export default Projects;
