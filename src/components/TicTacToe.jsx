import { useState, useCallback } from 'react';
import './TicTacToe.css';

const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkWinner(board) {
  for (const [a, b, c] of WINNING_COMBINATIONS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  return null;
}

function isBoardFull(board) {
  return board.every((cell) => cell !== null);
}

// Simple AI using minimax algorithm
function getBestMove(board) {
  const availableMoves = board.map((cell, index) => (cell === null ? index : null)).filter((n) => n !== null);

  // Check for winning move
  for (const move of availableMoves) {
    const testBoard = [...board];
    testBoard[move] = 'O';
    if (checkWinner(testBoard)) return move;
  }

  // Block player's winning move
  for (const move of availableMoves) {
    const testBoard = [...board];
    testBoard[move] = 'X';
    if (checkWinner(testBoard)) return move;
  }

  // Take center if available
  if (board[4] === null) return 4;

  // Take corners
  const corners = [0, 2, 6, 8].filter((n) => board[n] === null);
  if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];

  // Take any available move
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState(null);
  const [scores, setScores] = useState({ player: 0, ai: 0, draws: 0 });
  const [winningLine, setWinningLine] = useState(null);

  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setGameOver(false);
    setResult(null);
    setWinningLine(null);
  }, []);

  const handleCellClick = (index) => {
    if (!isPlayerTurn || gameOver || board[index] !== null) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    const winResult = checkWinner(newBoard);
    if (winResult) {
      setResult('You Win! 🎉');
      setScores((prev) => ({ ...prev, player: prev.player + 1 }));
      setWinningLine(winResult.line);
      setGameOver(true);
      return;
    }

    if (isBoardFull(newBoard)) {
      setResult("It's a Draw! 🤝");
      setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
      setGameOver(true);
      return;
    }

    setIsPlayerTurn(false);

    // AI turn
    setTimeout(() => {
      const aiMove = getBestMove(newBoard);
      const aiBoard = [...newBoard];
      aiBoard[aiMove] = 'O';
      setBoard(aiBoard);

      const aiWinResult = checkWinner(aiBoard);
      if (aiWinResult) {
        setResult('AI Wins! 🤖');
        setScores((prev) => ({ ...prev, ai: prev.ai + 1 }));
        setWinningLine(aiWinResult.line);
        setGameOver(true);
        return;
      }

      if (isBoardFull(aiBoard)) {
        setResult("It's a Draw! 🤝");
        setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
        setGameOver(true);
        return;
      }

      setIsPlayerTurn(true);
    }, 500);
  };

  return (
    <div className="tic-tac-toe">
      <div className="ttt-header">
        <h2>❌⭕ Tic-Tac-Toe</h2>
        <div className="ttt-scores">
          <span className="player-score">You (X): {scores.player}</span>
          <span className="draw-score">Draws: {scores.draws}</span>
          <span className="ai-score">AI (O): {scores.ai}</span>
        </div>
      </div>

      <div className="ttt-board">
        {board.map((cell, index) => (
          <button
            key={index}
            className={`ttt-cell ${winningLine?.includes(index) ? 'winning' : ''}`}
            onClick={() => handleCellClick(index)}
            disabled={!isPlayerTurn || gameOver || cell !== null}
          >
            {cell === 'X' ? '❌' : cell === 'O' ? '⭕' : ''}
          </button>
        ))}
      </div>

      {gameOver && (
        <div className="ttt-result">
          <h3>{result}</h3>
          <button onClick={resetGame}>Play Again</button>
        </div>
      )}

      <p className="ttt-hint">You are X, AI is O. Click a cell to play!</p>
    </div>
  );
}

export default TicTacToe;
