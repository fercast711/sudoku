// SudokuSolver.jsx
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../styles/SudokuSolver.css';

const SudokuSolver = () => {
  const [searchParams] = useSearchParams();
  const level = searchParams.get('level') || 'easy'; // 'easy' por defecto si no se proporciona un nivel
  const [selectedCell, setSelectedCell] = useState(null);
  const [gridValues, setGridValues] = useState(Array(81).fill(''));

  const handleCellClick = (row, col) => {
    setSelectedCell({ row, col });
  };

  const handleCellChange = (row, col, event) => {
    const value = event.target.value;
    if (/^[1-9]$/.test(value) || value === '') { // Permitir solo números del 1 al 9
      const newGridValues = [...gridValues];
      newGridValues[row * 9 + col] = value;
      setGridValues(newGridValues);
    }
  };

  const renderGrid = () => {
    return gridValues.map((value, index) => {
      const row = Math.floor(index / 9);
      const col = index % 9;
      const isHighlighted =
        selectedCell && (selectedCell.row === row || selectedCell.col === col);

      return (
        <input
          key={index}
          className={`sudoku-cell ${isHighlighted ? 'highlighted' : ''}`}
          value={value}
          onClick={() => handleCellClick(row, col)}
          onChange={(e) => handleCellChange(row, col, e)}
          type="text"
          maxLength="1"
        />
      );
    });
  };

  return (
    <div className="sudoku-container">
      <h2>Sudoku Puzzle - {level.charAt(0).toUpperCase() + level.slice(1)} Level</h2>
      <div className="sudoku-grid">{renderGrid()}</div>
    </div>
  );
};

export default SudokuSolver;
