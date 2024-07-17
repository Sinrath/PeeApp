import React, { useState } from 'react';
import './PeeList.css';
import ConfirmModal from './ConfirmModal';

const isDevelopment = process.env.NODE_ENV === 'development';
const API_URL = isDevelopment ? 'http://localhost:3500' : '';

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'};
    return date.toLocaleDateString(undefined, options);
};

const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    const options = {year: 'numeric', month: 'long', day: 'numeric'};
    return date.toLocaleDateString(undefined, options);
};

const groupByDate = (peeData) => {
    return peeData.reduce((grouped, pee) => {
        const date = formatDateHeader(pee.time);
        if (!grouped[date]) {
            grouped[date] = [];
        }
        grouped[date].push(pee);
        return grouped;
    }, {});
};

function PeeList({ peeData, setPeeData }) {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const handleDeleteClick = (id) => {
        setSelectedId(id);
        setModalIsOpen(true);
    };

    const deletePee = async (id) => {
        try {
            const response = await fetch(`${API_URL}/pee/${id}`, {method: 'DELETE'});
            if (response.ok) {
                const updatedPeeData = peeData.filter((pee) => pee._id !== id);
                setPeeData(updatedPeeData);
            } else {
                console.error('Error deleting pee:', response.statusText);
            }
        } catch (error) {
            console.error('Error deleting pee:', error);
        }
        setModalIsOpen(false);
    };

    // Sort peeData by date in descending order
    const sortedPeeData = [...peeData].sort((a, b) => new Date(b.time) - new Date(a.time));
    const peeDataGroupedByDate = groupByDate(sortedPeeData);

    // Get the date keys and sort them in descending order
    const sortedDateKeys = Object.keys(peeDataGroupedByDate).sort((a, b) => new Date(b) - new Date(a));

    return (
        <div className="peeList">
            {sortedDateKeys.map((date) => (
                <div key={date} className="pee-date-group">
                    <h3 className="date-header">{date}</h3>
                    <ul>
                        {peeDataGroupedByDate[date].map((pee) => (
                            <li key={pee._id}>
                                {formatDate(pee.time)}
                                <button className="delete-button"
                                        onClick={() => handleDeleteClick(pee._id)}>
                                    <i className="fas fa-trash-alt"></i>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
            <ConfirmModal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                onConfirm={() => deletePee(selectedId)}
                message="Are you sure you want to delete this pee time?"
            />
        </div>
    );
};

export default PeeList;
