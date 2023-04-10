import React from 'react';
import './PeeListModal.css';
import PeeList from './PeeList';

const PeeListModal = ({ peeData, setPeeData, onClose }) => {
    return (
        <div className="pee-list-modal">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>
                    Close
                </button>
                <PeeList peeData={peeData} setPeeData={setPeeData} />
            </div>
        </div>
    );
};

export default PeeListModal;
