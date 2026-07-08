import { useState, useEffect, useCallback } from 'react';
import './MemoryCard.css';

const EMOJIS = ['🎮', '🎯', '🎪', '🎨', '🎭', '🎸', '🎺', '🎻'];

function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function MemoryCard() {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  const initGame = useCallback(() => {
    const pairs = [...EMOJIS, ...EMOJIS];
    const shuffledCards = shuffle(pairs).map((emoji, index) => ({
      id: index,
      emoji,
    }));
    setCards(shuffledCards);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameWon(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      if (cards[first].emoji === cards[second].emoji) {
        setMatched((prev) => [...prev, cards[first].emoji]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
      setMoves((prev) => prev + 1);
    }
  }, [flipped, cards]);

  useEffect(() => {
    if (matched.length === EMOJIS.length && matched.length > 0) {
      setGameWon(true);
    }
  }, [matched]);

  const handleCardClick = (index) => {
    if (flipped.length >= 2) return;
    if (flipped.includes(index)) return;
    if (matched.includes(cards[index].emoji)) return;
    setFlipped((prev) => [...prev, index]);
  };

  return (
    <div className="memory-card">
      <div className="memory-header">
        <h2>🧠 Memory Cards</h2>
        <div className="memory-stats">
          <span>Moves: {moves}</span>
          <span>Pairs: {matched.length}/{EMOJIS.length}</span>
        </div>
      </div>

      <div className="memory-grid">
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index);
          const isMatched = matched.includes(card.emoji);
          return (
            <div
              key={card.id}
              className={`memory-card-item ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
              onClick={() => handleCardClick(index)}
            >
              <div className="card-inner">
                <div className="card-front">{card.emoji}</div>
                <div className="card-back">❓</div>
              </div>
            </div>
          );
        })}
      </div>

      {gameWon && (
        <div className="memory-win">
          <h3>🎉 You Won!</h3>
          <p>Completed in {moves} moves</p>
          <button onClick={initGame}>Play Again</button>
        </div>
      )}

      <button className="restart-button" onClick={initGame}>
        🔄 Restart
      </button>
    </div>
  );
}

export default MemoryCard;
