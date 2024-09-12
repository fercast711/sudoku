import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/Levels.css";

const Levels = () => {
  const navigate = useNavigate();

  const handleLevelSelect = (level) => {
    navigate(`/solver?level=${level}`);
  };

  return (
    <div className="levels-container">
      <h1 className="levels-title">SELECT DIFFICULTY</h1>
      <button className="easy" onClick={() => handleLevelSelect('easy')}>Easy</button>
      <button className="medium" onClick={() => handleLevelSelect('medium')}>Medium</button>
      <button className="hard" onClick={() => handleLevelSelect('hard')}>Hard</button>
    </div>
  );
};

export default Levels;
