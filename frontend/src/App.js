import React, {useCallback, useEffect, useRef, useState} from 'react';
import './App.css';
import PeeButton from './components/PeeButton';
import PeeListModal from './components/PeeListModal';
import {enqueue, isLocalId, loadQueue, removeFromQueue} from './queue';

const isDevelopment = process.env.NODE_ENV === 'development';
const API_URL = isDevelopment ? 'http://localhost:3500' : '';

// Keep the saving state visible long enough to register as feedback
const MIN_SPINNER_MS = 600;
const REQUEST_TIMEOUT_MS = 15000;

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'};
    return date.toLocaleDateString(undefined, options);
};

// Returns the saved pee on success, null on any failure
const postPee = async (timeIso) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
        // keepalive lets the request finish even if the app is closed mid-save
        const response = await fetch(`${API_URL}/pee`, {
            method: 'POST',
            keepalive: true,
            signal: controller.signal,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({time: timeIso}),
        });
        const data = await response.json();
        if (response.ok && data.message === 'Pee time saved') {
            return data.pee;
        }
        console.error('Error recording pee:', data ? data.message : 'No response data received');
        return null;
    } catch (error) {
        console.error('Error recording pee:', error.message || error.toString());
        return null;
    } finally {
        clearTimeout(timeoutId);
    }
};

function App() {
    const [peeData, setPeeData] = useState([]);
    const [showList, setShowList] = useState(false);
    const [toast, setToast] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [listState, setListState] = useState('idle');
    const [pendingCount, setPendingCount] = useState(() => loadQueue().length);
    const toastTimer = useRef(null);
    const isFlushing = useRef(false);

    const showToast = (nextToast, duration) => {
        clearTimeout(toastTimer.current);
        setToast(nextToast);
        toastTimer.current = setTimeout(() => setToast(null), duration);
    };

    const flushQueue = useCallback(async () => {
        if (isFlushing.current) return;
        isFlushing.current = true;
        try {
            for (const item of loadQueue()) {
                const saved = await postPee(item.time);
                if (!saved) break;
                removeFromQueue(item._id);
                setPeeData((prev) => prev.map((pee) => (pee._id === item._id ? saved : pee)));
            }
        } finally {
            isFlushing.current = false;
            setPendingCount(loadQueue().length);
        }
    }, []);

    useEffect(() => {
        flushQueue();
        window.addEventListener('online', flushQueue);
        return () => window.removeEventListener('online', flushQueue);
    }, [flushQueue]);

    const savePee = async (timeIso) => {
        const saved = await postPee(timeIso);
        if (saved) {
            setPeeData((prev) => [...prev, saved]);
            return {type: 'success', time: saved.time};
        }
        try {
            const queued = enqueue(timeIso);
            setPeeData((prev) => [...prev, queued]);
            setPendingCount(loadQueue().length);
            return {type: 'queued', time: timeIso};
        } catch (error) {
            console.error('Could not queue pee locally:', error);
            return {type: 'error'};
        }
    };

    const recordPee = async () => {
        setIsLoading(true);
        setToast(null);
        const startedAt = Date.now();

        const result = await savePee(new Date().toISOString());

        const wait = Math.max(0, MIN_SPINNER_MS - (Date.now() - startedAt));
        setTimeout(() => {
            setIsLoading(false);
            showToast(result, result.type === 'success' ? 3000 : 5000);
            if (result.type === 'success') flushQueue();
        }, wait);
    };

    const addEntry = async (timeIso) => {
        const result = await savePee(timeIso);
        showToast(result, result.type === 'success' ? 3000 : 5000);
    };

    const deleteEntry = async (id) => {
        if (isLocalId(id)) {
            removeFromQueue(id);
            setPeeData((prev) => prev.filter((pee) => pee._id !== id));
            setPendingCount(loadQueue().length);
            return true;
        }
        try {
            const response = await fetch(`${API_URL}/pee/${id}`, {method: 'DELETE'});
            if (response.ok) {
                setPeeData((prev) => prev.filter((pee) => pee._id !== id));
                return true;
            }
            console.error('Error deleting pee:', response.statusText);
        } catch (error) {
            console.error('Error deleting pee:', error);
        }
        return false;
    };

    const fetchPeetimes = async () => {
        setListState('loading');
        try {
            const response = await fetch(`${API_URL}/pee`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            const serverData = Array.isArray(data) ? data : [];
            setPeeData([...serverData, ...loadQueue()]);
            setListState('ready');
        } catch (error) {
            console.error('Error fetching peetimes:', error);
            setListState('error');
        }
    };

    const toggleList = () => {
        if (!showList) fetchPeetimes();
        setShowList(!showList);
    };

    return (
        <div className="App">
            <main className="app-main">
                <h1 className="app-title">
                    Pee<span className="app-title-accent">App</span>
                </h1>
                <PeeButton onClick={recordPee} isSaving={isLoading}/>
                <div className="below-button">
                    {pendingCount > 0 && (
                        <div className="pending-hint">
                            {pendingCount} waiting to sync
                        </div>
                    )}
                    <button className="list-toggle" onClick={toggleList}>
                        Show List
                    </button>
                </div>
            </main>

            {showList && (
                <PeeListModal
                    peeData={peeData}
                    onDelete={deleteEntry}
                    onAddEntry={addEntry}
                    listState={listState}
                    onRetry={fetchPeetimes}
                    onClose={toggleList}
                />
            )}

            {toast && toast.type === 'success' && (
                <div className="toast toast-success" role="status">
                    <span className="toast-icon" aria-hidden="true">✓</span>
                    <div className="toast-body">
                        <strong>Pee time recorded</strong>
                        <span className="toast-sub">{formatDate(toast.time)}</span>
                    </div>
                </div>
            )}
            {toast && toast.type === 'queued' && (
                <div className="toast toast-queued" role="status">
                    <span className="toast-icon" aria-hidden="true">⏱</span>
                    <div className="toast-body">
                        <strong>Saved on phone</strong>
                        <span className="toast-sub">No connection — will sync when back online.</span>
                    </div>
                </div>
            )}
            {toast && toast.type === 'error' && (
                <div className="toast toast-error" role="alert">
                    <span className="toast-icon" aria-hidden="true">!</span>
                    <div className="toast-body">
                        <strong>Not saved!</strong>
                        <span className="toast-sub">Check your connection and tap again.</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
