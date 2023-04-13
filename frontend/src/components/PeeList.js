import React from 'react';
import './PeeList.css';

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

function PeeList({peeData, setPeeData}) {
    const deletePee = async (id) => {
        try {
            const response = await fetch(`${API_URL}/pee/${id}`, {method: 'DELETE'});
            if (response.ok) {
                // Remove the deleted peetime from the frontend list
                const updatedPeeData = peeData.filter((pee) => pee._id !== id);
                setPeeData(updatedPeeData);
            } else {
                console.error('Error deleting pee:', response.statusText);
            }
        } catch (error) {
            console.error('Error deleting pee:', error);
        }
    };

    const peeDataGroupedByDate = groupByDate(peeData);

    return (
        <div className="peeList">
            {Object.keys(peeDataGroupedByDate).map((date) => (
                <div key={date} className="pee-date-group">
                    <h3 className="date-header">{date}</h3>
                    <ul>
                        {peeDataGroupedByDate[date].map((pee) => (
                            <li key={pee._id}>
                                {formatDate(pee.time)}
                                <button className="delete-button" onClick={() => deletePee(pee._id)}>
                                    <i className="fas fa-trash-alt"></i>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}

export default PeeList;
