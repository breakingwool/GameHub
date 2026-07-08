import { useState } from 'react';
import MemoryCard from './MemoryCard';
import Snake from './Snake';
import WhackAMole from './WhackAMole';
import TicTacToe from './TicTacToe';
import ReactionTime from './ReactionTime';
import CpsTest from './CpsTest';
import Minesweeper from './Minesweeper';
import Chess from './Chess';
import './GamesHub.css';

const games = [
  { id: 'memory', name: 'Memory Cards', icon: '🧠', description: 'Find all matching pairs', color: '#8b5cf6' },
  { id: 'snake', name: 'Snake', icon: '🐍', description: 'Eat food, grow longer', color: '#10b981' },
  { id: 'whack', name: 'Whack-a-Mole', icon: '🔨', description: 'Smash the moles!', color: '#f59e0b' },
  { id: 'tictactoe', name: 'Tic-Tac-Toe', icon: '❌', description: 'Beat the AI', color: '#3b82f6' },
  { id: 'reaction', name: 'Reaction Time', icon: '⚡', description: 'Test your reflexes', color: '#ef4444' },
  { id: 'cps', name: 'CPS Test', icon: '🖱️', description: 'How fast can you click?', color: '#ec4899' },
  { id: 'minesweeper', name: 'Minesweeper', icon: '💣', description: 'Clear the minefield', color: '#f97316' },
  { id: 'chess', name: 'Chess', icon: '♟️', description: 'Chess', color: '#000000' },
];

function GamesHub({ onClose }) {
  const [activeGame, setActiveGame] = useState(null);

  return (
    <div className="games-hub-overlay">
      <div className="games-hub-container">
        <button className="games-hub-close" onClick={onClose} aria-label="Close games hub">✕</button>

        {!activeGame ? (
          <>
            <div className="games-hub-header">
              <h1>🎮 Mini Games</h1>
              <p>Choose a game to pass the time!</p>
            </div>
            <div className="games-grid">
              {games.map((game) => (
                <button
                  key={game.id}
                  className="game-card"
                  style={{ '--game-color': game.color }}
                  onClick={() => setActiveGame(game.id)}
                >
                  <div className="game-icon">{game.icon}</div>
                  <h3>{game.name}</h3>
                  <p>{game.description}</p>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="active-game-wrapper">
            <button className="back-button" onClick={() => setActiveGame(null)}>
              ← Back to Games
            </button>
            {activeGame === 'memory' && <MemoryCard />}
            {activeGame === 'snake' && <Snake />}
            {activeGame === 'whack' && <WhackAMole />}
            {activeGame === 'tictactoe' && <TicTacToe />}
            {activeGame === 'reaction' && <ReactionTime />}
            {activeGame === 'cps' && <CpsTest />}
            {activeGame === 'minesweeper' && <Minesweeper />}
            {activeGame === 'chess' && <Chess />}
          </div>
        )}
      </div>
    </div>
  );
}

export default GamesHub;
