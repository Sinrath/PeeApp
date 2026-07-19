import React, { useState } from 'react';
import './PeeList.css';
import ConfirmModal from './ConfirmModal';

const isDevelopment = process.env.NODE_ENV === 'development';
const API_URL = isDevelopment ? 'http://localhost:3500' : '';

const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'});
};

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const dayLabel = (dateString) => {
    const date = new Date(dateString);
    const diffDays = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'});
};

const groupByDay = (peeData) => {
    const groups = {};
    for (const pee of peeData) {
        const date = new Date(pee.time);
        const key = startOfDay(date).getTime();
        if (!groups[key]) {
            groups[key] = {key, label: dayLabel(pee.time), entries: []};
        }
        groups[key].entries.push(pee);
    }
    return Object.values(groups).sort((a, b) => b.key - a.key);
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
                setPeeData((prev) => prev.filter((pee) => pee._id !== id));
            } else {
                console.error('Error deleting pee:', response.statusText);
            }
        } catch (error) {
            console.error('Error deleting pee:', error);
        }
        setModalIsOpen(false);
    };

    const sortedPeeData = [...peeData].sort((a, b) => new Date(b.time) - new Date(a.time));
    const dayGroups = groupByDay(sortedPeeData);

    return (
        <div className="peeList">
            {dayGroups.map((group) => (
                <div key={group.key} className="pee-date-group">
                    <h3 className="date-header">
                        {group.label}
                        <span className="date-count">{group.entries.length}×</span>
                    </h3>
                    <ul>
                        {group.entries.map((pee) => (
                            <li key={pee._id}>
                                <span className="pee-time">{formatTime(pee.time)}</span>
                                <button
                                    className="delete-button"
                                    aria-label="Delete entry"
                                    onClick={() => handleDeleteClick(pee._id)}
                                >
                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                        <path
                                            d="M9 3h6l1 2h4v2H4V5h4l1-2zm-3 6h12l-.9 11.1a2 2 0 0 1-2 1.9H8.9a2 2 0 0 1-2-1.9L6 9zm4 2v8h1.5v-8H10zm3 0v8h1.5v-8H13z"
                                            fill="currentColor"
                                        />
                                    </svg>
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
                message="Delete this pee time?"
            />
        </div>
    );
}

export default PeeList;
