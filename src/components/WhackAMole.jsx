import { useState, useEffect, useCallback, useRef } from 'react';
import './WhackAMole.css';

function WhackAMole() {
  const [moles, setMoles] = useState(Array(9).fill(false));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [misses, setMisses] = useState(0);

  const gameLoopRef = useRef();
  const moleTimerRef = useRef();

  const spawnMole = useCallback(() => {
    const newMoles = Array(9).fill(false);
    const moleCount = Math.random() > 0.7 ? 2 : 1;
    
    for (let i = 0; i < moleCount; i++) {
      const randomIndex = Math.floor(Math.random() * 9);
      newMoles[randomIndex] = true;
    }
    
    setMoles(newMoles);
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setTimeLeft(30);
    setMisses(0);
    setGameActive(true);
    setMoles(Array(9).fill(false));
  }, []);

  useEffect(() => {
    if (gameActive) {
      moleTimerRef.current = setInterval(spawnMole, 800);
      
      gameLoopRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameActive(false);
            setHighScore((prevHigh) => Math.max(prevHigh, score));
            clearInterval(moleTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(gameLoopRef.current);
      clearInterval(moleTimerRef.current);
    };
  }, [gameActive, spawnMole, score]);

  const whackMole = (index) => {
    if (!gameActive) return;
    
    if (moles[index]) {
      setScore((prev) => prev + 10);
      const newMoles = [...moles];
      newMoles[index] = false;
      setMoles(newMoles);
    } else {
      setMisses((prev) => prev + 1);
    }
  };

  const accuracy = timeLeft < 30 ? Math.round((score / (score + misses * 10)) * 100) : 100;

  return (
    <div className="whack-a-mole">
      <div className="whack-header">
        <h2>🔨 Whack-a-Mole</h2>
        <div className="whack-stats">
          <span>Score: {score}</span>
          <span>Time: {timeLeft}s</span>
          <span>Misses: {misses}</span>
        </div>
      </div>

      <div className="mole-grid">
        {moles.map((isMole, index) => (
          <button
            key={index}
            className={`mole-hole ${isMole ? 'mole-visible' : ''}`}
            onClick={() => whackMole(index)}
            disabled={!gameActive}
          >
            {isMole ? '🐹' : '🕳️'}
          </button>
        ))}
      </div>

      {!gameActive && timeLeft === 0 ? (
        <div className="game-over">
          <h3>Time's Up!</h3>
          <p>Final Score: {score}</p>
          <p>High Score: {highScore}</p>
          <button onClick={startGame}>Play Again</button>
        </div>
      ) : !gameActive ? (
        <button className="start-button" onClick={startGame}>
          ▶ Start Game
        </button>
      ) : null}

      <p className="whack-hint">Click the moles before they hide!</p>
    </div>
  );
}

export default WhackAMole;
