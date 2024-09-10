// src/main.js
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './components/App';
import Levels from './components/Levels';
import SudokuSolver from './components/SudokuSolver';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/levels" element={<Levels />} />
        <Route path="/solve" element={<SudokuSolver />} />
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById('app')
);
