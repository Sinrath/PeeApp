import React, {useRef, useState} from 'react';
import './App.css';
import PeeButton from './components/PeeButton';
import PeeListModal from './components/PeeListModal';

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

function App() {
    const [peeData, setPeeData] = useState([]);
    const [showList, setShowList] = useState(false);
    const [toast, setToast] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [listState, setListState] = useState('idle');
    const toastTimer = useRef(null);

    const showToast = (nextToast, duration) => {
        clearTimeout(toastTimer.current);
        setToast(nextToast);
        toastTimer.current = setTimeout(() => setToast(null), duration);
    };

    const recordPee = async () => {
        setIsLoading(true);
        setToast(null);
        const startedAt = Date.now();
        let saved = null;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
            // keepalive lets the request finish even if the app is closed mid-save
            const response = await fetch(`${API_URL}/pee`, {
                method: 'POST',
                keepalive: true,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            const data = await response.json();

            if (response.ok && data.message === 'Pee time saved') {
                saved = data.pee;
            } else {
                console.error('Error recording pee:', data ? data.message : 'No response data received');
            }
        } catch (error) {
            console.error('Error recording pee:', error.message || error.toString());
        }

        const wait = Math.max(0, MIN_SPINNER_MS - (Date.now() - startedAt));
        setTimeout(() => {
            setIsLoading(false);
            if (saved) {
                setPeeData((prev) => [...prev, saved]);
                showToast({type: 'success', time: saved.time}, 3000);
            } else {
                showToast({type: 'error'}, 5000);
            }
        }, wait);
    };

    const fetchPeetimes = async () => {
        setListState('loading');
        try {
            const response = await fetch(`${API_URL}/pee`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            setPeeData(Array.isArray(data) ? data : []);
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
                <button className="list-toggle" onClick={toggleList}>
                    Show List
                </button>
            </main>

            {showList && (
                <PeeListModal
                    peeData={peeData}
                    setPeeData={setPeeData}
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
