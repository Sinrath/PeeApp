import React, { useState } from 'react';
import './App.css';
import PeeButton from './components/PeeButton';
import PeeListModal from "./components/PeeListModal";

function App() {
  const [peeData, setPeeData] = useState([]);
  const [showList, setShowList] = useState(false);

  const recordPee = async () => {
    try {
      const response = await fetch('http://localhost:3500/pee', { method: 'POST' });
      if (response.ok) {
        const pee = await response.json();
        setPeeData([...peeData, pee]);
      }
    } catch (error) {
      console.error('Error recording pee:', error);
    }
  };

  const fetchPeetimes = async () => {
    try {
      const response = await fetch('http://localhost:3500/pee');
      setPeeData(await response.json());
    } catch (error) {
      console.error('Error fetching peetimes:', error);
    }
  };

  const toggleList = () => {
    setShowList(!showList);
    if (!showList) fetchPeetimes();
  };

  return (
      <div className="App">
        <header className="App-header">
          <PeeButton onClick={recordPee} />
          <button className="list-toggle" onClick={toggleList}>
            {showList ? 'Hide List' : 'Show List'}
          </button>
          {showList && (
              <PeeListModal peeData={peeData} setPeeData={setPeeData} onClose={toggleList} />
          )}
        </header>
      </div>
  );
}

export default App;
