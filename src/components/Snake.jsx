import { useState, useEffect, useCallback, useRef } from 'react';
import './Snake.css';

const GRID_SIZE = 20;
const CELL_SIZE = 20;

const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

function getRandomPosition(snake = []) {
  let position;
  do {
    position = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some((segment) => segment.x === position.x && segment.y === position.y));
  return position;
}

function Snake() {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 10 });
  const [direction, setDirection] = useState(DIRECTIONS.RIGHT);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const gameLoopRef = useRef();
  const directionRef = useRef(direction);

  const resetGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(getRandomPosition([{ x: 10, y: 10 }]));
    setDirection(DIRECTIONS.RIGHT);
    directionRef.current = DIRECTIONS.RIGHT;
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
    setGameStarted(true);
  }, []);

  const moveSnake = useCallback(() => {
    if (isPaused || gameOver) return;

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const newHead = {
        x: head.x + directionRef.current.x,
        y: head.y + directionRef.current.y,
      };

      // Check wall collision
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setGameOver(true);
        setHighScore((prev) => Math.max(prev, score));
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        setHighScore((prev) => Math.max(prev, score));
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((prev) => prev + 10);
        setFood(getRandomPosition(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [isPaused, gameOver, score, food]);

  useEffect(() => {
    if (gameStarted && !gameOver && !isPaused) {
      gameLoopRef.current = setInterval(moveSnake, 100);
    }
    return () => clearInterval(gameLoopRef.current);
  }, [moveSnake, gameStarted, gameOver, isPaused]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          if (directionRef.current !== DIRECTIONS.DOWN) {
            setDirection(DIRECTIONS.UP);
            directionRef.current = DIRECTIONS.UP;
          }
          break;
        case 'ArrowDown':
          if (directionRef.current !== DIRECTIONS.UP) {
            setDirection(DIRECTIONS.DOWN);
            directionRef.current = DIRECTIONS.DOWN;
          }
          break;
        case 'ArrowLeft':
          if (directionRef.current !== DIRECTIONS.RIGHT) {
            setDirection(DIRECTIONS.LEFT);
            directionRef.current = DIRECTIONS.LEFT;
          }
          break;
        case 'ArrowRight':
          if (directionRef.current !== DIRECTIONS.LEFT) {
            setDirection(DIRECTIONS.RIGHT);
            directionRef.current = DIRECTIONS.RIGHT;
          }
          break;
        case ' ':
          e.preventDefault();
          if (gameStarted && !gameOver) setIsPaused((prev) => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver]);

  const handleDirectionButton = (newDirection, oppositeDirection) => {
    if (directionRef.current !== oppositeDirection) {
      setDirection(newDirection);
      directionRef.current = newDirection;
    }
  };

  return (
    <div className="snake-game">
      <div className="snake-header">
        <h2>🐍 Snake</h2>
        <div className="snake-stats">
          <span>Score: {score}</span>
          <span>High Score: {highScore}</span>
        </div>
      </div>

      <div
        className="snake-grid"
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
        }}
      >
        {snake.map((segment, index) => (
          <div
            key={index}
            className={`snake-segment ${index === 0 ? 'snake-head' : ''}`}
            style={{
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
            }}
          />
        ))}
        <div
          className="snake-food"
          style={{
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
          }}
        >
          🍎
        </div>
      </div>

      <div className="snake-controls">
        <button onClick={() => handleDirectionButton(DIRECTIONS.UP, DIRECTIONS.DOWN)}>↑</button>
        <div>
          <button onClick={() => handleDirectionButton(DIRECTIONS.LEFT, DIRECTIONS.RIGHT)}>←</button>
          <button onClick={() => handleDirectionButton(DIRECTIONS.RIGHT, DIRECTIONS.LEFT)}>→</button>
        </div>
        <button onClick={() => handleDirectionButton(DIRECTIONS.DOWN, DIRECTIONS.UP)}>↓</button>
      </div>

      {!gameStarted ? (
        <button className="start-button" onClick={() => setGameStarted(true)}>
          ▶ Start Game
        </button>
      ) : gameOver ? (
        <div className="game-over">
          <h3>Game Over!</h3>
          <p>Final Score: {score}</p>
          <button onClick={resetGame}>Play Again</button>
        </div>
      ) : (
        <button className="pause-button" onClick={() => setIsPaused((prev) => !prev)}>
          {isPaused ? '▶ Resume' : '⏸ Pause'}
        </button>
      )}

      <p className="snake-hint">Use arrow keys or buttons to control the snake</p>
    </div>
  );
}

export default Snake;
