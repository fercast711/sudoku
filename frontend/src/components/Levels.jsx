import React from 'react';
import "../styles/Levels.css";

const Levels = () => {
  return (
    <div className="levels-container">
      <h1 className="levels-title">SELECT DIFFICULTY</h1>
      <button className="easy">Easy</button>
      <button className="medium">Medium</button>
      <button className="hard">Hard</button>
    </div>
  );
};

export default Levels;
