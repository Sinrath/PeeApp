import React from 'react';
import Modal from 'react-modal';

if (document.getElementById('root')) {
    Modal.setAppElement('#root');
}

const ConfirmModal = ({ isOpen, onRequestClose, onConfirm, message }) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Confirmation Modal"
            overlayClassName="confirm-modal-overlay"
            className="confirm-modal-content"
        >
            <p className="confirm-message">{message}</p>
            <div className="confirm-actions">
                <button className="confirm-cancel" onClick={onRequestClose}>Cancel</button>
                <button className="confirm-delete" onClick={onConfirm}>Delete</button>
            </div>
        </Modal>
    );
};

export default ConfirmModal;
