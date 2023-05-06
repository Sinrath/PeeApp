import React from 'react';
import './PeeListModal.css';
import PeeList from './PeeList';

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'};
    return date.toLocaleDateString(undefined, options);
};

const PeeListModal = ({peeData, setPeeData, onClose}) => {
    const copyToClipboard = () => {
        const dataToCopy = peeData.map(pee => formatDate(pee.time)).join('\n');
        navigator.clipboard.writeText(dataToCopy).then(() => {
            alert('Data copied to clipboard');
        }, () => {
            alert('Failed to copy data to clipboard');
        });
    };

    return (
        <div className="pee-list-modal">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>
                    Close
                </button>
                <button onClick={copyToClipboard} className="copy-button">Copy</button>
                <PeeList peeData={peeData} setPeeData={setPeeData} />
            </div>
        </div>
    );
};

export default PeeListModal;