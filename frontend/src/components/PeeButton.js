import React from 'react';

const PeeButton = ({onClick, isSaving}) => {
    return (
        <button
            className={`pee-button ${isSaving ? 'saving' : ''}`}
            onClick={onClick}
            disabled={isSaving}
            aria-busy={isSaving}
        >
            <svg className="pee-button-drop" viewBox="0 0 24 24" aria-hidden="true">
                <path
                    d="M12 2.5c3.4 4.6 7 8.6 7 12.5a7 7 0 1 1-14 0c0-3.9 3.6-7.9 7-12.5z"
                    fill="currentColor"
                />
            </svg>
            <span className="pee-button-label">{isSaving ? 'Saving…' : 'Record Pee'}</span>
        </button>
    );
};

export default PeeButton;
