import React from 'react';

const PeeButton = ({onClick, disabled}) => {
    return (
        <button
            className={`pee-button ${disabled ? 'disabled' : ''}`}
            onClick={onClick}
            disabled={disabled}
        >
            Record Pee
        </button>
    );
};

export default PeeButton;
