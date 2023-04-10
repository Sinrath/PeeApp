import React from 'react';

function PeeList({ peeData, setPeeData }) {
    const deletePee = async (id) => {
        try {
            const response = await fetch(`http://localhost:3500/pee/${id}`, { method: 'DELETE' });
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

    return (
        <ul>
            {peeData.map((pee) => (
                <li key={pee._id}>
                    {new Date(pee.time).toLocaleString()}{' '}
                    <button onClick={() => deletePee(pee._id)}>Delete</button>
                </li>
            ))}
        </ul>
    );
}

export default PeeList;
