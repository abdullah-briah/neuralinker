import React, { useState } from "react";
import api, { toFormData } from "../api/axios";
import { X, Save, Upload, User, Briefcase, FileText, Linkedin, Github, Code } from "lucide-react";
import "../styles/EditProfileModal.css";

const EditProfileModal = ({ isOpen, onClose, currentUser, onSave, onUpdateUser }) => {
    const [formData, setFormData] = useState({
        name: currentUser.name || "",
        title: currentUser.title || "",
        bio: currentUser.bio || "",
        linkedin: currentUser.linkedin || "",
        github: currentUser.github || "",
        skills: currentUser.skills || [],
        avatar: null,
    });
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "avatar") {
            const file = files[0];
            setFormData((prev) => ({ ...prev, avatar: file }));
            if (file) {
                const objectUrl = URL.createObjectURL(file);
                setPreview(objectUrl);
            }
        } else if (name === "skills") {
            // For comma separated input
            setFormData((prev) => ({ ...prev, skills: value.split(",").map(s => s.trim()) }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const fd = toFormData(formData);
            const updatedUser = await onSave(fd);
            onUpdateUser(updatedUser);
            onClose();
        } catch (error) {
            console.error("Save failed:", error);
            alert("Failed to save profile.");
        } finally {
            setLoading(false);
        }
    };

    // Helper to view current skills as string
    const skillsString = Array.isArray(formData.skills) ? formData.skills.join(", ") : formData.skills;

    if (!isOpen) return null;

    return (
        <div className="edit-modal-backdrop" onClick={onClose}>
            <div className="edit-modal-container" onClick={e => e.stopPropagation()}>
                <button className="edit-modal-close" onClick={onClose}>
                    <X size={24} />
                </button>

                <div className="edit-modal-header">
                    <h2>Edit Profile</h2>
                    <p>Update your personal details and professional info.</p>
                </div>

                <form onSubmit={handleSubmit} className="edit-modal-form">

                    {/* Avatar Upload Section */}
                    <div className="avatar-upload-section">
                        <div className="avatar-preview">
                            {preview ? (
                                <img src={preview} alt="Avatar Preview" />
                            ) : currentUser.avatarUrl ? (
                                <img src={currentUser.avatarUrl.startsWith('http') ? currentUser.avatarUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/uploads/${currentUser.avatarUrl}`} alt="Current Avatar" />
                            ) : (
                                <div className="avatar-placeholder">{currentUser.name?.charAt(0) || "U"}</div>
                            )}
                        </div>
                        <label className="avatar-upload-btn">
                            <Upload size={16} />
                            <span>Change Photo</span>
                            <input type="file" name="avatar" accept="image/*" onChange={handleChange} hidden />
                        </label>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label><User size={14} /> Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. John Doe" />
                        </div>

                        <div className="form-group">
                            <label><Briefcase size={14} /> Job Title</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Senior Developer" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label><FileText size={14} /> Bio</label>
                        <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" placeholder="Tell us a bit about yourself..." />
                    </div>

                    <div className="form-group">
                        <label><Code size={14} /> Skills (comma separated)</label>
                        <input type="text" name="skills" value={skillsString} onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value.split(',') }))} placeholder="React, Node.js, Design..." />
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label><Linkedin size={14} /> LinkedIn URL</label>
                            <input type="text" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
                        </div>

                        <div className="form-group">
                            <label><Github size={14} /> GitHub URL</label>
                            <input type="text" name="github" value={formData.github} onChange={handleChange} placeholder="https://github.com/..." />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? "Saving..." : <><Save size={18} /> Save Changes</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
