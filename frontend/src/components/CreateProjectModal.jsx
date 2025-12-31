import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import '../styles/CreateProjectModal.css';

const CreateProjectModal = ({ isOpen, onClose, onProjectCreated, editingProject }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        skills: '',
        duration: '',
        startDate: '',
        category: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // عند فتح الـ modal، إذا كان هناك مشروع للتحرير، نملىء الفورم بقيمه
    useEffect(() => {
        if (editingProject) {
            setFormData({
                title: editingProject.title || '',
                description: editingProject.description || '',
                skills: Array.isArray(editingProject.skills) ? editingProject.skills.join(', ') : (editingProject.skills || ''),
                duration: editingProject.duration || '',
                startDate: editingProject.startDate ? new Date(editingProject.startDate).toISOString().slice(0, 10) : '',
                category: editingProject.category || ''
            });
        } else {
            setFormData({
                title: '',
                description: '',
                skills: '',
                duration: '',
                startDate: '',
                category: ''
            });
        }
    }, [editingProject, isOpen]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            // تحويل النص إلى مصفوفة قبل إرسالها للباك إند
            const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);

            const payload = {
                title: formData.title,
                description: formData.description,
                skills: skillsArray,
                duration: formData.duration,
                startDate: new Date(formData.startDate).toISOString(),
                category: formData.category || 'Uncategorized'
            };

            if (editingProject) {
                // تعديل مشروع موجود
                await api.put(`/projects/${editingProject.id}`, payload);
            } else {
                // إنشاء مشروع جديد
                await api.post('/projects', payload);
            }

            if (onProjectCreated) onProjectCreated(); // تحديث Projects list
            onClose();

            // إعادة تعيين الفورم
            setFormData({
                title: '',
                description: '',
                skills: '',
                duration: '',
                startDate: '',
                category: ''
            });
        } catch (err) {
            console.error('Failed to submit project:', err);
            setError(err.response?.data?.message || 'Failed to submit project');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="project-modal-backdrop" onClick={onClose}>
            <div className="project-modal-content" onClick={e => e.stopPropagation()}>
                <button className="project-modal-close" onClick={onClose}>&times;</button>
                <h2 className="project-modal-title">{editingProject ? 'Edit Project' : 'Create New Project'}</h2>
                <p className="project-modal-subtitle">Share your vision and find the perfect team.</p>
                {error && <div className="error-msg" style={{ color: '#ef4444', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}

                <form className="project-modal-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Project Title</label>
                        <input
                            type="text"
                            name="title"
                            placeholder="e.g. AI Task Manager"
                            required
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Short Description</label>
                        <textarea
                            name="description"
                            placeholder="Describe your project goals and needs..."
                            rows="4"
                            required
                            value={formData.description}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label>Required Skills</label>
                        <input
                            type="text"
                            name="skills"
                            placeholder="e.g. React, Python, Machine Learning"
                            required
                            value={formData.skills}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Estimated Duration</label>
                            <input
                                type="text"
                                name="duration"
                                placeholder="e.g. 2 months"
                                required
                                value={formData.duration}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Start Date</label>
                            <input
                                type="date"
                                name="startDate"
                                required
                                value={formData.startDate}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Category</option>
                            <option value="AI / ML">AI / ML</option>
                            <option value="Web Development">Web Development</option>
                            <option value="Data Science">Data Science</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="submit-btn" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <div className="spinner"></div>
                                    {editingProject ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                editingProject ? 'Update Project' : 'Create Project'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectModal;
