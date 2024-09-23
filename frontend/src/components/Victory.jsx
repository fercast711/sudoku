import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import "../styles/Victory.css";

const Victory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const score = location.state?.score || 0; // Obtener el score del estado de la navegación

  return (
    <div className="victory-container">
      <iframe
        src="https://lottie.host/embed/2a65aef5-8fb3-46ab-ba9d-ffd5ba0b8b2a/HnBIQ3bo4s.json"
        className="lottieStyle"
        title="Lottie Animation"
      ></iframe>
      <h1 className="titleVictory">You have Won!</h1>
      <h2 className="score">Your Score: {score}</h2>
      <button className="restart-button" onClick={() => navigate('/')}>Victory Royale! Play Again</button>
    </div>
  );
};

export default Victory;
