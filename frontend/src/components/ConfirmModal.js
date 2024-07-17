import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const ConfirmModal = ({ isOpen, onRequestClose, onConfirm, message }) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Confirmation Modal"
            overlayClassName="confirm-modal-overlay"
            className="confirm-modal-content"
        >
            <h2>Confirm Action</h2>
            <p>{message}</p>
            <button onClick={onConfirm}>Yes, Delete</button>
            <button className="close-button" onClick={onRequestClose}>X</button>
        </Modal>
    );
};

export default ConfirmModal;
