import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const GameOver = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const score = queryParams.get("score");
  const isWin = queryParams.get("win") === "true";

  const onReplay = () => {
    navigate("/");
  };

  const onExit = () => {
    console.log("Exit called");
    // navigate("/thankyou");
  };

  return (
    <div className="game-over-container">
      <div className="game-over-card">
        <h1 className="game-over-title">{isWin ? "You Won!" : "Game Over"}</h1>
        <p className="game-over-score">
          Your Score: <span>{score}</span>
        </p>
        <div className="game-over-buttons">
          <button className="btn replay-btn" onClick={onReplay}>
            Replay
          </button>
          <button className="btn exit-btn" onClick={onExit}>
            Exit
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
