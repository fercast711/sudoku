import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../styles/SudokuSolver.css';

const SudokuSolver = () => {
  const [searchParams] = useSearchParams();
  const level = searchParams.get('level') || 'easy'; // 'easy' por defecto si no se proporciona un nivel
  const [selectedCell, setSelectedCell] = useState(null);
  const [gridValues, setGridValues] = useState(Array(81).fill(''));
  const [solution, setSolution] = useState(null);
  const [error, setError] = useState(0);

  const [SolutionGrid, setSolutionGrid] = useState(Array(81).fill(0));

  /**
   * Se Ejecuta al ingresar
   */
  const generateSolutionGrid = useEffect(() => {

    /**
     * Al generar la funcion verifica que estas este dentro de las reglas de sudoku
     */
    function isSafe(grid, index, num) {
      let row = Math.floor(index / 9);
      let col = index % 9;

      for (let i = 0; i < 9; i++) {
        if (grid[row * 9 + i] === num || grid[i * 9 + col] === num) {
          return false;
        }
      }

      let startRow = row - row % 3;
      let startCol = col - col % 3;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (grid[(startRow + i) * 9 + (startCol + j)] === num) {
            return false;
          }
        }
      }
      return true;
    }

    /**
     * rellena con numeros aleatorio la funcion
     * @param {*} grid 
     */
    function fillGrid(grid) {
      for (let i = 0; i < 81; i++) {
        let num = Math.floor(Math.random() * 9) + 1;
        let attempts = 0;

        while (!isSafe(grid, i, num) && attempts < 50) {
          num = Math.floor(Math.random() * 9) + 1;
          attempts++;
        }

        if (attempts < 1000) {
          grid[i] = num;
        }
      }
    }

    /**
     * Elimina elementos dependiendo de la dificultad para poder iniciar el juego
     * @param {Int8Array} grid 
     * @param {int} difficulty 
     */
    function removeElements(grid, difficulty) {
      let remainingCells = difficulty; // Cuantos números dejar visibles
      while (remainingCells > 0) {
        let index = Math.floor(Math.random() * 81);

        if (grid[index] !== 0) {
          grid[index] = 0;
          remainingCells--;
        }
      }
    };
    const run = () => {
      let tempGridSolution = Array(81);
      fillGrid(tempGridSolution);
      console.log(tempGridSolution);
      setSolutionGrid(tempGridSolution);
      let tempGridGame = [...tempGridSolution];
      removeElements(tempGridGame, 20);
      const convertedGrid = tempGridGame.map(num => num !== 0 ? num.toString() : '');
      setGridValues(convertedGrid);
    };
    run();


  }, []);


  /**
   * Se ejecuta cada vez que hacen click
   * @param {*} row 
   * @param {*} col 
   */
  const handleCellClick = (row, col) => {
    setSelectedCell({ row, col });
  };

  /**
   * Se ejecuta cada vez que se detecta un cambio en las celdas
   * @param {*} row 
   * @param {*} col 
   * @param {*} event 
   */
  const handleCellChange = (row, col, event) => {
    const value = event.target.value;
    if (/^[1-9]$/.test(value) || value === '') { // Permitir solo números del 1 al 9
      const newGridValues = [...gridValues];
      newGridValues[row * 9 + col] = value;
      setGridValues(newGridValues);
      console.log(SolutionGrid);
      //SolutionGrid[row * 9 + col].toString()
      if (newGridValues[row * 9 + col] !== SolutionGrid[row * 9 + col].toString() && value !== '') {
        setError(error + 1);
      }
    }
  };

  /**
   * Se conecta con el backend para conseguir una solucion
   */
  const solveSudoku = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/sudoku/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Enviar el grid
        body: JSON.stringify({ quiz: gridValues.join('') }),
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

  /**
   * Es el artefacto principa
   * @returns Interfaz
   */
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
