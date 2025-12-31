import React from 'react';
import '../styles/ConfirmationModal.css';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", isDangerous = false }) => {
    if (!isOpen) return null;

    return (
        <div className="confirm-modal-backdrop" onClick={onClose}>
            <div className="confirm-modal-content" onClick={e => e.stopPropagation()}>
                <h3 className="confirm-modal-title">{title}</h3>
                <p className="confirm-modal-message">{message}</p>
                <div className="confirm-modal-actions">
                    <button className="confirm-btn-cancel" onClick={onClose}>
                        {cancelText}
                    </button>
                    <button
                        className={`confirm-btn-confirm ${isDangerous ? 'dangerous' : ''}`}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
