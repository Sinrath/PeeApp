import React, {useEffect, useState} from 'react';
import Modal from 'react-modal';

const pad = (n) => String(n).padStart(2, '0');

const toLocalInputValue = (date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

const AddEntryModal = ({isOpen, onRequestClose, onSave}) => {
    const [value, setValue] = useState(() => toLocalInputValue(new Date()));
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setValue(toLocalInputValue(new Date()));
            setSaving(false);
        }
    }, [isOpen]);

    const handleSave = async () => {
        const date = new Date(value);
        if (isNaN(date.getTime())) return;
        setSaving(true);
        await onSave(date.toISOString());
        onRequestClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Add entry"
            overlayClassName="confirm-modal-overlay"
            className="confirm-modal-content"
        >
            <p className="confirm-message">Add a pee time</p>
            <label className="add-entry-label" htmlFor="add-entry-time">Time</label>
            <input
                id="add-entry-time"
                className="add-entry-input"
                type="datetime-local"
                value={value}
                max={toLocalInputValue(new Date())}
                onChange={(event) => setValue(event.target.value)}
            />
            <div className="confirm-actions">
                <button className="confirm-cancel" onClick={onRequestClose} disabled={saving}>Cancel</button>
                <button className="confirm-save" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving…' : 'Save'}
                </button>
            </div>
        </Modal>
    );
};

export default AddEntryModal;
