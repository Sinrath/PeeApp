import React from 'react';

const PeeButton = ({ onClick }) => {
    return (
        <button className="pee-button" onClick={onClick}>
            Record Pee
        </button>
    );
};

export default PeeButton;
