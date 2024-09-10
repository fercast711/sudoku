import React from 'react';
import "../styles/App.css"

const App = () => {
  return (
    <div className="app-container">
      <h1 className="title">SUDOKU</h1>
      <div className="buttons-container">
        <button className="play-button">Play</button>
        <button className="solve-button">Solve</button>
      </div>
    </div>
  );
};

export default App;
