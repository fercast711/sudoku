import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../styles/SudokuSolver.css';

const SudokuSolver = () => {
  const [searchParams] = useSearchParams();
  const level = searchParams.get('level') || 'easy'; // 'easy' por defecto si no se proporciona un nivel
  const [selectedCell, setSelectedCell] = useState(null);
  const [gridValues, setGridValues] = useState(Array(81).fill(''));
  const [solution, setSolution] = useState(null);
  const [error, setError] = useState('');

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

  const solveSudoku = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/sudoku/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
         // Enviar el grid
        body: JSON.stringify({ quiz: gridValues.map(item => item === "" ? "0" : item).join('')}),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.solution) {
          // Actualizar el grid con la solución
          setSolution(data.solution.flat()); 
        } else {
          setError('No se pudo resolver el Sudoku');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error en el servidor');
      }
    } catch (error) {
      setError('Error de conexión con el servidor');
    }
  };

  const renderGrid = () => {
    return (solution || gridValues).map((value, index) => {
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

          // Deshabilitar inputs si ya hay una solución
          disabled={!!solution} 
        />
      );
    });
  };

  return (
    <div className="sudoku-container">
      <h2>Sudoku Puzzle - {level.charAt(0).toUpperCase() + level.slice(1)} Level</h2>
      <div className="sudoku-grid">{renderGrid()}</div>
      <button className="solve-button" onClick={solveSudoku}>Solve</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default SudokuSolver;
