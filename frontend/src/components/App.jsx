import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Levels from './Levels';
import SudokuSolver from './SudokuSolver';
import Victory from './Victory';
import "../styles/App.css";

const App = () => {
  const navigate = useNavigate();

  return (
    <div className="app-container">
      <h1 className="title">SUDOKU</h1>
      <div className="buttons-container">
        <button className="play-button" onClick={() => navigate('/levels')}>Play</button>
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
      <Route path="/victory" element={<Victory />} />
    </Routes>
  </Router>
);

export default AppWrapper;
