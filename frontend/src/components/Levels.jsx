import React from 'react';
import './Levels.css';

const Levels = () => {
  return (
    <div className="levels-container">
      <h2>Select Difficulty Level</h2>
      <div className="buttons-container">
        <button className="level-button easy">Easy</button>
        <button className="level-button medium">Medium</button>
        <button className="level-button hard">Hard</button>
      </div>
    </div>
  );
};

export default Levels;
