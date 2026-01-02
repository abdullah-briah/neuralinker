import React, { useState } from "react";
import api, { toFormData } from "../api/axios";
import { X, Save, Upload, User } from "lucide-react";
import "../styles/EditProfileModal.css"; // Reuse existing styles

const AdminEditProfileModal = ({ isOpen, onClose, currentUser, onSave, onUpdateUser }) => {
    const [formData, setFormData] = useState({
        name: currentUser.name || "",
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

    if (!isOpen) return null;

    return (
        <div className="edit-modal-backdrop" onClick={onClose}>
            <div className="edit-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                <button className="edit-modal-close" onClick={onClose}>
                    <X size={24} />
                </button>

                <div className="edit-modal-header">
                    <h2>Edit Admin Profile</h2>
                    <p>Update your name and profile picture.</p>
                </div>

                <form onSubmit={handleSubmit} className="edit-modal-form">

                    {/* Avatar Upload Section */}
                    <div className="avatar-upload-section">
                        <div className="avatar-preview">
                            {preview ? (
                                <img src={preview} alt="Avatar Preview" />
                            ) : currentUser.avatarUrl ? (
                                <img
                                    src={
                                        currentUser.avatarUrl.startsWith('http')
                                            ? currentUser.avatarUrl
                                            // FIX: Use server base URL (remove /api)
                                            : `${(import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api\/?$/, '')}/uploads/${currentUser.avatarUrl}`
                                    }
                                    alt="Current Avatar"
                                />
                            ) : (
                                <div className="avatar-placeholder">{currentUser.name?.charAt(0) || "A"}</div>
                            )}
                        </div>
                        <label className="avatar-upload-btn">
                            <Upload size={16} />
                            <span>Change Photo</span>
                            <input type="file" name="avatar" accept="image/*" onChange={handleChange} hidden />
                        </label>
                    </div>

                    <div className="form-group">
                        <label><User size={14} /> Full Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Admin Name" />
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

export default AdminEditProfileModal;
