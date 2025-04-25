import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const GameOver = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const score = queryParams.get("score");
  const isWin = queryParams.get("win") === "true";
  const [fireworkCount, setFireworkCount] = useState(3); // Control number of fireworks

  useEffect(() => {
    if (isWin) {
      // Create new fireworks periodically
      const interval = setInterval(() => {
        setFireworkCount((prev) => (prev % 3) + 1); // Cycle between 1-3 fireworks
      }, 2000); // Match with animation duration

      return () => clearInterval(interval);
    }
  }, [isWin]);

  const onReplay = () => {
    navigate("/");
  };

  const onExit = () => {
    console.log("Exit called");
    // navigate("/thankyou");
  };

  return (
    <div className="game-over-container">
      <div className="modal-backdrop">
        {isWin &&
          Array.from({ length: fireworkCount }).map((_, index) => (
            <div key={`firework-${index}`} className="firework" />
          ))}
      </div>
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
