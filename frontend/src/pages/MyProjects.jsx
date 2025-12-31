// src/pages/MyProjects.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { FolderPlus, Users, ArrowRight } from "lucide-react";
import CreateProjectModal from "../components/CreateProjectModal";
import ProjectCard from "../components/ProjectCard";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import ConfirmationModal from "../components/ConfirmationModal";

const MyProjects = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [myProjects, setMyProjects] = useState([]);
    const [joinedProjects, setJoinedProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState(null);

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [myRes, joinedRes] = await Promise.all([
                api.get("/projects/my"),
                api.get("/projects/joined"),
            ]);
            setMyProjects(myRes.data);
            setJoinedProjects(joinedRes.data);
        } catch (error) {
            console.error("Failed to fetch my projects", error);
            addToast("Failed to load projects", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteClick = (projectId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Project',
            message: 'Are you sure you want to delete this project? This action cannot be undone and will remove all data associated with it.',
            onConfirm: () => performDelete(projectId)
        });
    };

    const performDelete = async (projectId) => {
        try {
            await api.delete(`/projects/${projectId}`);
            setMyProjects((prev) => prev.filter((p) => p.id !== projectId));
            addToast("Project deleted successfully.", "success");
        } catch (error) {
            console.error("Failed to delete project", error);
            addToast("Failed to delete project.", "error");
        }
    };

    const handleEdit = (project) => {
        setProjectToEdit(project);
        setIsEditModalOpen(true);
    };

    const handleProjectUpdated = () => {
        fetchData();
        setIsEditModalOpen(false);
        setProjectToEdit(null);
        addToast("Project saved successfully!", "success");
    };

    const handleViewDetails = (projectId) => {
        navigate(`/projects/${projectId}`);
    };



    // Close modal and reset editing
    const closeModal = () => {
        setIsEditModalOpen(false);
        setProjectToEdit(null);
    };

    if (loading) {
        return (
            <div style={{ textAlign: "center", marginTop: "50px", color: "#a0a0b0" }}>
                Loading your projects...
            </div>
        );
    }

    return (
        <div className="page-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <h1 className="page-title">My Projects</h1>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', marginBottom: '3rem' }}>
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                        <Users size={20} color="#22c55e" />
                        <h3 style={{ margin: 0, color: '#cbd5e1', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Joined Projects</h3>
                    </div>
                    <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800', color: '#fff' }}>{joinedProjects.length}</p>
                </div>

                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                        <FolderPlus size={20} color="#a855f7" />
                        <h3 style={{ margin: 0, color: '#cbd5e1', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Owned Projects</h3>
                    </div>
                    <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800', color: '#fff' }}>{myProjects.length}</p>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '3rem',
                alignItems: 'start'
            }}>

                {/* Left Column: Projects I Joined */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ paddingBottom: '1rem', borderBottom: '2px solid rgba(34,197,94,0.3)', marginBottom: '1rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#fff', fontWeight: 'bold' }}>Projects I Joined</h2>
                        <p style={{ margin: '5px 0 0 0', color: '#94a3b8' }}>Teams you are collaborating with</p>
                    </div>

                    {joinedProjects.length === 0 ? (
                        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.1)' }}>
                            <div style={{ background: 'rgba(34, 197, 94, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <Users size={30} color="#22c55e" />
                            </div>
                            <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Joined Projects Yet</h3>
                            <p style={{ color: "#94a3b8", fontSize: '1rem', margin: '0 auto 1.5rem', maxWidth: '300px', lineHeight: '1.6' }}>
                                You haven't joined any teams yet. Discover exciting projects and start collaborating with others!
                            </p>
                            <Link to="/projects" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px' }}>
                                Explore Projects <ArrowRight size={16} />
                            </Link>
                        </div>
                    ) : (
                        joinedProjects.map((project) => (
                            <div key={project.id}>
                                <ProjectCard
                                    id={project.id}
                                    title={project.title}
                                    description={project.description || ''}
                                    skills={Array.isArray(project.skills) ? project.skills : (typeof project.skills === 'string' ? project.skills.split(',') : [])}
                                    duration={project.duration || 'N/A'}
                                    startDate={project.startDate}
                                    ownerId={project.owner?.id}
                                    currentUserId={user?.id}
                                    onViewDetails={() => handleViewDetails(project.id)}
                                    // onQuickView removed to ensure navigation
                                    actionLabel="Meet Members"
                                />
                            </div>
                        ))
                    )}
                </div>

                {/* Right Column: Projects I Own */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ paddingBottom: '1rem', borderBottom: '2px solid rgba(168,85,247,0.3)', marginBottom: '1rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#fff', fontWeight: 'bold' }}>Projects I Own</h2>
                        <p style={{ margin: '5px 0 0 0', color: '#94a3b8' }}>Projects you created and manage</p>
                    </div>

                    {myProjects.length === 0 ? (
                        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.1)' }}>
                            <div style={{ background: 'rgba(168, 85, 247, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <FolderPlus size={30} color="#a855f7" />
                            </div>
                            <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Owned Projects</h3>
                            <p style={{ color: "#94a3b8", fontSize: '1rem', margin: '0 auto 1.5rem', maxWidth: '300px', lineHeight: '1.6' }}>
                                You haven't created any projects yet. Turn your ideas into reality and assemble your dream team.
                            </p>
                            <button onClick={() => setIsEditModalOpen(true)} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(168, 85, 247, 0.5)', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
                                Create Project <FolderPlus size={16} />
                            </button>
                        </div>
                    ) : (
                        myProjects.map((project) => (
                            <div key={project.id}>
                                <ProjectCard
                                    id={project.id}
                                    title={project.title}
                                    description={project.description || ''}
                                    skills={Array.isArray(project.skills) ? project.skills : (typeof project.skills === 'string' ? project.skills.split(',') : [])}
                                    duration={project.duration || 'N/A'}
                                    startDate={project.startDate}
                                    ownerId={project.owner?.id || user?.id}
                                    currentUserId={user?.id}
                                    onEdit={() => handleEdit(project)}
                                    onDelete={() => handleDeleteClick(project.id)}
                                    onViewDetails={() => handleViewDetails(project.id)}
                                    // onQuickView removed to ensure navigation
                                    actionLabel="Manage Team"
                                />
                            </div>
                        ))
                    )}
                </div>

            </div>

            {/* Edit Modal */}
            <CreateProjectModal
                isOpen={isEditModalOpen}
                onClose={closeModal}
                onProjectCreated={handleProjectUpdated}
                editingProject={projectToEdit}
            />

            {/* Quick View Modal Removed */}

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

export default MyProjects;
