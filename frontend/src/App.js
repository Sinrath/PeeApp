import React, {useState} from 'react';
import './App.css';
import PeeButton from './components/PeeButton';
import PeeListModal from './components/PeeListModal';

function App() {
    const [peeData, setPeeData] = useState([]);
    const [showList, setShowList] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const isDevelopment = process.env.NODE_ENV === 'development';
    const API_URL = isDevelopment ? 'http://localhost:3500' : '';

    const recordPee = async () => {
        setIsLoading(true);
        let savedSuccessfully = false;

        try {
            const response = await fetch(`${API_URL}/pee`, {method: 'POST'});
            const data = await response.json();

            if (response.ok && data.message === "Pee time saved") {
                setPeeData([...peeData, data.pee]);
                savedSuccessfully = true;
            } else {
                console.error('Error recording pee:', data ? data.message : 'No response data received');
            }
        } catch (error) {
            console.error('Error recording pee:', error.message || error.toString());
        }

        // Ensure the loading state shows for at least 2 seconds
        setTimeout(() => {
            setIsLoading(false);
            if (savedSuccessfully) showSuccessPopup();
        }, 2000);
    };


    const fetchPeetimes = async () => {
        try {
            const response = await fetch(`${API_URL}/pee`);
            setPeeData(await response.json());
        } catch (error) {
            console.error('Error fetching peetimes:', error);
        }
    };

    const toggleList = () => {
        setShowList(!showList);
        if (!showList) fetchPeetimes().then((r) => console.log('fetched'));
    };

    const showSuccessPopup = () => {
        setShowPopup(true);
        setTimeout(() => {
            setShowPopup(false);
        }, 3000);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'};
        return date.toLocaleDateString(undefined, options);
    };

    return (
        <div className="App">
            <header className="App-header">
                <PeeButton onClick={recordPee} disabled={isLoading}/>
                {isLoading && (
                    <div className="loading-popup">
                        Saving pee time...
                    </div>
                )}
                {!showList && (
                    <button className="list-toggle" onClick={toggleList}>
                        {'Show List'}
                    </button>
                )}
                {showList && <PeeListModal peeData={peeData} setPeeData={setPeeData} onClose={toggleList}/>}
                {showPopup && (
                    <div className="success-popup">
                        Pee time recorded: {peeData[peeData.length - 1] && formatDate(peeData[peeData.length - 1].time)}
                    </div>
                )}
            </header>
        </div>
    );

}

export default App;
