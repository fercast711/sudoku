import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import "../styles/App.css";
import Levels from './Levels';
import SudokuSolver from './SudokuSolver';

const App = () => {
  const navigate = useNavigate();

  const handlePlayClick = () => {
    navigate('/levels');
  };

  return (
    <div className="app-container">
      <h1 className="title">SUDOKU</h1>
      <div className="buttons-container">
        <button className="play-button" onClick={handlePlayClick}>Play</button>
        <button className="solve-button" onClick={() => navigate('/solver')}>Solve</button>
      </div>
    </div>
  );
};

const AppWrapper = () => (
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/levels" element={<Levels />} />
      <Route path="/solver" element={<SudokuSolver />} />
    </Routes>
  </Router>
);

export default AppWrapper;
