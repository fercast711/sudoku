import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/Victory.css";

const Victory = () => {
  const navigate = useNavigate();

  return (
    <div className="victory-container">
      <iframe
        src="https://lottie.host/embed/2a65aef5-8fb3-46ab-ba9d-ffd5ba0b8b2a/HnBIQ3bo4s.json"
        className="lottieStyle"
        title="Lottie Animation"
      ></iframe>
      <h1 className="titleVictory">You have Won!</h1>
    </div>
  );
};

export default Victory;
