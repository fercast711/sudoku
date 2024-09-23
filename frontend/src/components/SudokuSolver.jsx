import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../styles/SudokuSolver.css';

const SudokuSolver = () => {
  const [ErrorCells, setErrorCells] = useState(Array(81).fill(false));
  const [searchParams] = useSearchParams();
  const level = searchParams.get('level') || 'not'; // 'easy' por defecto si no se proporciona un nivel
  const [selectedCell, setSelectedCell] = useState(null);
  const [gridValues, setGridValues] = useState(Array(81).fill(''));
  const [solution, setSolution] = useState(null);
  const [score, setScore] = useState(null);
  const [error, setError] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const navigate = useNavigate();

  const [SolutionGrid, setSolutionGrid] = useState(Array(81).fill(0));

  /**
   * Se Ejecuta al ingresar
   */
  useEffect(() => {
    if (error >= 3) {
      navigate('/loss');
    }
  }, [error])

  useEffect(() => {

    if (!gameStarted) return;

    const SolutionGridConverted = SolutionGrid.map(num => num !== 0 ? num.toString() : '');
    if (SolutionGridConverted.length === gridValues.length &&
      SolutionGridConverted.every((value, index) => value === gridValues[index])) {
      navigate('/victory');
    }
  }, [gridValues, SolutionGrid]);


  useEffect(() => {

    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

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

    async function fillGrid(grid) {
      for (let i = 0; i < 81; i++) {
        if (grid[i] === 0) {
          let numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
          for (let num of numbers) {
            if (isSafe(grid, i, num)) {
              grid[i] = num;

              if (await fillGrid(grid)) {
                return true;
              }

              grid[i] = 0;
            }
          }
          return false;
        }
      }
      return true;
    }

    function hasUniqueSolution(grid) {
      let solutions = 0;

      function solve(grid) {
        for (let i = 0; i < 81; i++) {
          if (grid[i] === 0) {
            for (let num = 1; num <= 9; num++) {
              if (isSafe(grid, i, num)) {
                grid[i] = num;
                if (solve(grid)) {
                  solutions++;
                  if (solutions > 1) return false;
                }
                grid[i] = 0;
              }
            }
            return false;
          }
        }
        return true;
      }

      solve([...grid]);
      return solutions === 1;
    }

    async function removeElements(grid, difficulty) {
      let remainingCells = difficulty;
      let tempGrid = [...grid];

      while (remainingCells > 0) {
        let index = Math.floor(Math.random() * 81);

        if (tempGrid[index] !== 0) {
          let backup = tempGrid[index];
          tempGrid[index] = 0;

          if (hasUniqueSolution(tempGrid)) {
            grid[index] = 0;
            remainingCells--;
          } else {
            tempGrid[index] = backup;
          }
        }

        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    const run = async () => {
      let tempGridSolution = Array(81).fill(0);
      await fillGrid(tempGridSolution);

      setSolutionGrid(tempGridSolution);
      let tempGridGame = [...tempGridSolution];

      let num = 20;
      if (level === 'easy') num = 20;
      if (level === 'medium') num = 40;
      if (level === 'hard') num = 50;

      await removeElements(tempGridGame, num);

      const convertedGrid = tempGridGame.map(num => num !== 0 ? num.toString() : '');
      await setGridValues(convertedGrid);
      setGameStarted(true);
    };

    if (level !== 'not') {
      run();
      console.log('gamestarted');
    }
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
    const index = row * 9 + col;
    if (/^[1-9]$/.test(value) || value === '') { // Permitir solo números del 1 al 9
      const newGridValues = [...gridValues];
      newGridValues[row * 9 + col] = value;
      setGridValues(newGridValues);

      if (!gameStarted) return;
      const newErrorCells = [...ErrorCells];
      if (value !== SolutionGrid[index].toString() && value !== '') {
        setError(error + 1);
        setScore(prevScore => {
          const currentScore = prevScore !== null ? prevScore : 0;
          const newScore = currentScore - 1000;
          return newScore < 0 ? 0 : newScore;
        });
        newErrorCells[index] = true;
      } else if (value !== '') {
        newErrorCells[index] = false;
        setScore(prevScore => (prevScore || 0) + 100);
      }
      setErrorCells(newErrorCells);
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
        body: JSON.stringify({ quiz: gridValues.map(item => item === "" ? "0" : item).join('') }),
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
      const IsError = ErrorCells[index];
      const isCorrectValue = SolutionGrid[index] !== 0 && SolutionGrid[index].toString() === value && gameStarted;
      return (
        <input
          key={index}
          className={`sudoku-cell ${isHighlighted ? 'highlighted' : ''} ${IsError ? 'incorrect' : ''}`}
          value={value}
          onClick={() => handleCellClick(row, col)}
          onChange={(e) => handleCellChange(row, col, e)}
          type="text"
          maxLength="1"

          // Deshabilitar inputs si ya hay una solución
          disabled={!!solution || isCorrectValue}
        />
      );
    });
  };

  return (
    <div className="sudoku-container">
      <h2>Sudoku Puzzle - {level.charAt(0).toUpperCase() + level.slice(1)} Level</h2>
      {level !== "not" && (
        <div className="score-container">
          <h2>Score</h2>
          <p>{score}</p>
        </div>
      )}
      <div className="sudoku-grid">{renderGrid()}</div>
      {level === "not" && <button className="solve-button" onClick={solveSudoku}>Solve</button>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default SudokuSolver;
