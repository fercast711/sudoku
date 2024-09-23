import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/Loss.css";

const Loss = () => {
  const navigate = useNavigate();

  return (
    <div className="loss-container">
      <iframe
        src="https://lottie.host/embed/d86dd9b2-f63c-4281-bb8c-e359b523d3f8/4c5F2Focj9.json"
        className="lottieStyle"
        title="Lottie Animation"
      ></iframe>
      <h1 className="titleLoss">You have Lost</h1>
    </div>
  );
};

export default Loss;
