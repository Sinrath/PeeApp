import React, {useState} from 'react';
import './PeeListModal.css';
import PeeList from './PeeList';
import AddEntryModal from './AddEntryModal';

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'};
    return date.toLocaleDateString(undefined, options);
};

const PeeListModal = ({peeData, onDelete, onAddEntry, listState, onRetry, onClose}) => {
    const [copied, setCopied] = useState(false);
    const [showAddEntry, setShowAddEntry] = useState(false);

    const copyToClipboard = () => {
        const sorted = [...peeData].sort((a, b) => new Date(b.time) - new Date(a.time));
        const dataToCopy = sorted.map((pee) => formatDate(pee.time)).join('\n');
        navigator.clipboard.writeText(dataToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }, () => {
            console.error('Failed to copy data to clipboard');
        });
    };

    return (
        <div
            className="pee-list-modal"
            onClick={(event) => {
                // Portal children (add-entry dialog) bubble here too — only
                // close when the backdrop itself was tapped
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div className="modal-content">
                <div className="sheet-handle" aria-hidden="true"/>
                <div className="sheet-header">
                    <h2 className="sheet-title">Your log</h2>
                    <div className="sheet-actions">
                        <button onClick={copyToClipboard} className="copy-button" disabled={peeData.length === 0}>
                            {copied ? 'Copied ✓' : 'Copy'}
                        </button>
                        <button className="close-button" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
                <div className="sheet-body">
                    {listState !== 'error' && (
                        <button className="add-entry-button" onClick={() => setShowAddEntry(true)}>
                            + Add entry
                        </button>
                    )}
                    {listState === 'loading' && (
                        <p className="sheet-message">Loading…</p>
                    )}
                    {listState === 'error' && (
                        <div className="sheet-message">
                            <p>Couldn't load your list.</p>
                            <button className="retry-button" onClick={onRetry}>Retry</button>
                        </div>
                    )}
                    {listState === 'ready' && peeData.length === 0 && (
                        <p className="sheet-message">Nothing recorded yet.</p>
                    )}
                    {listState === 'ready' && peeData.length > 0 && (
                        <PeeList peeData={peeData} onDelete={onDelete}/>
                    )}
                </div>
            </div>
            <AddEntryModal
                isOpen={showAddEntry}
                onRequestClose={() => setShowAddEntry(false)}
                onSave={onAddEntry}
            />
        </div>
    );
};

export default PeeListModal;
