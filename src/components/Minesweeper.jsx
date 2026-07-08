import { useState, useCallback, useEffect, useRef } from 'react';
import './Minesweeper.css';

const DIFFICULTIES = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 },
};

const NUMBER_COLORS = [
  null,
  '#3b82f6', // 1 - blue
  '#10b981', // 2 - green
  '#ef4444', // 3 - red
  '#6366f1', // 4 - indigo
  '#f59e0b', // 5 - amber
  '#8b5cf6', // 6 - purple
  '#ec4899', // 7 - pink
  '#9ca3af', // 8 - gray
];

function createBoard(rows, cols, mines, safeRow, safeCol) {
  const board = Array.from({ length: rows }, () => Array(cols).fill(0));

  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (board[r][c] !== -1 && !(r === safeRow && c === safeCol)) {
      board[r][c] = -1;
      placed++;
    }
  }

  // Calculate numbers
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] === -1) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc] === -1) {
            count++;
          }
        }
      }
      board[r][c] = count;
    }
  }

  return board;
}

function Minesweeper() {
  const [difficulty, setDifficulty] = useState('easy');
  const config = DIFFICULTIES[difficulty];

  const [board, setBoard] = useState(null);
  const [revealed, setRevealed] = useState(null);
  const [flagged, setFlagged] = useState(null);
  const [gameState, setGameState] = useState('idle'); // idle, playing, won, lost
  const [flagCount, setFlagCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [bestTimes, setBestTimes] = useState({});

  const timerRef = useRef(null);
  const firstClickRef = useRef(true);

  const initGame = useCallback((diff = difficulty) => {
    const cfg = DIFFICULTIES[diff];
    const newBoard = createBoard(cfg.rows, cfg.cols, cfg.mines, Math.floor(cfg.rows / 2), Math.floor(cfg.cols / 2));
    const newRevealed = Array.from({ length: cfg.rows }, () => Array(cfg.cols).fill(false));
    const newFlagged = Array.from({ length: cfg.rows }, () => Array(cfg.cols).fill(false));

    setBoard(newBoard);
    setRevealed(newRevealed);
    setFlagged(newFlagged);
    setGameState('playing');
    setFlagCount(0);
    setTimer(0);
    firstClickRef.current = true;

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
  }, [difficulty]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const revealCell = (r, c) => {
    if (gameState === 'won' || gameState === 'lost') return;
    if (flagged[r]?.[c]) return;
    if (revealed[r]?.[c]) return;

    let currentBoard = board;
    // First click safety
    if (firstClickRef.current) {
      firstClickRef.current = false;
      currentBoard = createBoard(config.rows, config.cols, config.mines, r, c);
      setBoard(currentBoard);
    }

    if (currentBoard[r][c] === -1) {
      // Hit a mine!
      if (timerRef.current) clearInterval(timerRef.current);
      setGameState('lost');
      // Reveal all mines
      const newRevealed = revealed.map(row => [...row]);
      for (let i = 0; i < config.rows; i++) {
        for (let j = 0; j < config.cols; j++) {
          if (currentBoard[i][j] === -1) newRevealed[i][j] = true;
        }
      }
      setRevealed(newRevealed);
      return;
    }

    // Flood fill reveal
    const newRevealed = revealed.map(row => [...row]);
    const stack = [[r, c]];
    while (stack.length > 0) {
      const [cr, cc] = stack.pop();
      if (newRevealed[cr][cc]) continue;
      newRevealed[cr][cc] = true;
      if (currentBoard[cr][cc] === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = cr + dr;
            const nc = cc + dc;
            if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols && !newRevealed[nr][nc]) {
              stack.push([nr, nc]);
            }
          }
        }
      }
    }
    setRevealed(newRevealed);

    // Check win
    let unrevealedSafe = 0;
    for (let i = 0; i < config.rows; i++) {
      for (let j = 0; j < config.cols; j++) {
        if (!newRevealed[i][j] && currentBoard[i][j] !== -1) unrevealedSafe++;
      }
    }
    if (unrevealedSafe === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      setGameState('won');
      setBestTimes((prev) => {
        const prevBest = prev[difficulty];
        const newBest = prevBest === null ? timer : Math.min(prevBest, timer);
        return { ...prev, [difficulty]: newBest };
      });
    }
  };

  const toggleFlag = (e, r, c) => {
    e.preventDefault();
    if (gameState === 'won' || gameState === 'lost') return;
    if (revealed[r]?.[c]) return;

    const newFlagged = flagged.map(row => [...row]);
    if (newFlagged[r][c]) {
      newFlagged[r][c] = false;
      setFlagCount((f) => f - 1);
    } else {
      newFlagged[r][c] = true;
      setFlagCount((f) => f + 1);
    }
    setFlagged(newFlagged);
  };

  const renderCell = (r, c) => {
    const isRevealed = revealed?.[r]?.[c];
    const isFlagged = flagged?.[r]?.[c];
    const value = board?.[r]?.[c];

    let content = '';
    let cellClass = 'mine-cell';

    if (isRevealed) {
      cellClass += ' revealed';
      if (value === -1) {
        cellClass += ' mine-hit';
        content = '💣';
      } else if (value > 0) {
        cellClass += ` num-${value}`;
        content = value;
      }
    } else if (isFlagged) {
      cellClass += ' flagged';
      content = '🚩';
    }

    return (
      <div
        key={`${r}-${c}`}
        className={cellClass}
        onClick={() => revealCell(r, c)}
        onContextMenu={(e) => toggleFlag(e, r, c)}
      >
        {content}
      </div>
    );
  };

  const remainingFlags = config.mines - flagCount;

  return (
    <div className="minesweeper">
      <div className="mine-header">
        <h2>💣 Minesweeper</h2>
        <div className="mine-difficulty">
          {Object.keys(DIFFICULTIES).map((d) => (
            <button
              key={d}
              className={`diff-btn ${difficulty === d ? 'active' : ''}`}
              disabled={gameState === 'playing'}
              onClick={() => {
                setDifficulty(d);
                setBoard(null);
                setRevealed(null);
                setFlagged(null);
                setGameState('idle');
                setFlagCount(0);
                setTimer(0);
              }}
            >
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="mine-info-bar">
        <span className="mine-flags">🚩 {remainingFlags}</span>
        <span className="mine-timer">⏱ {timer}s</span>
        {bestTimes[difficulty] !== null && (
          <span className="mine-best">🏆 Best: {bestTimes[difficulty]}s</span>
        )}
      </div>

      {gameState === 'idle' ? (
        <button className="mine-start-btn" onClick={() => initGame()}>
          Start Game
        </button>
      ) : (
        <div
          className="mine-board"
          style={{
            gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
            gridTemplateRows: `repeat(${config.rows}, 1fr)`,
          }}
        >
          {board &&
            Array.from({ length: config.rows }, (_, r) =>
              Array.from({ length: config.cols }, (_, c) => renderCell(r, c))
            ).flat()}
        </div>
      )}

      {(gameState === 'won' || gameState === 'lost') && (
        <div className={`mine-result ${gameState}`}>
          <span className="result-emoji">{gameState === 'won' ? '🎉' : '💥'}</span>
          <p>{gameState === 'won' ? 'You Won!' : 'Game Over!'}</p>
          {gameState === 'won' && <p className="result-time">Time: {timer}s</p>}
          <button className="mine-retry-btn" onClick={() => initGame()}>
            Play Again
          </button>
        </div>
      )}

      <p className="mine-hint">Left click to reveal • Right click to flag</p>
    </div>
  );
}

export default Minesweeper;