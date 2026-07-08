import { useState, useEffect, useRef, useCallback } from 'react';
import './ReactionTime.css';

function ReactionTime() {
  const [state, setState] = useState('idle'); // idle, waiting, ready, clicked
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(null);
  const [bestTime, setBestTime] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [earlyClick, setEarlyClick] = useState(false);

  const timerRef = useRef(null);

  const startGame = useCallback(() => {
    setState('waiting');
    setReactionTime(null);
    setEarlyClick(false);

    const randomDelay = 1000 + Math.random() * 4000; // 1-5 seconds

    timerRef.current = setTimeout(() => {
      setState('ready');
      setStartTime(Date.now());
    }, randomDelay);
  }, []);

  const handleClick = () => {
    if (state === 'idle' || state === 'clicked') {
      startGame();
    } else if (state === 'waiting') {
      // Clicked too early
      clearTimeout(timerRef.current);
      setEarlyClick(true);
      setState('clicked');
    } else if (state === 'ready') {
      // Calculate reaction time
      const time = Date.now() - startTime;
      setReactionTime(time);
      setState('clicked');
      setAttempts((prev) => [...prev, time]);
      setBestTime((prev) => (prev === null ? time : Math.min(prev, time)));
    }
  };

  const getAverage = () => {
    if (attempts.length === 0) return null;
    const sum = attempts.reduce((a, b) => a + b, 0);
    return Math.round(sum / attempts.length);
  };

  const getRating = (time) => {
    if (time < 200) return { text: '⚡ Incredible!', color: '#10b981' };
    if (time < 300) return { text: '🔥 Amazing!', color: '#3b82f6' };
    if (time < 400) return { text: '👍 Good!', color: '#f59e0b' };
    if (time < 500) return { text: '👌 Average', color: '#8b5cf6' };
    return { text: '🐢 Keep practicing!', color: '#ef4444' };
  };

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <div className="reaction-time">
      <div className="reaction-header">
        <h2>⚡ Reaction Time</h2>
        <div className="reaction-stats">
          {bestTime && <span>Best: {bestTime}ms</span>}
          {getAverage() && <span>Average: {getAverage()}ms</span>}
        </div>
      </div>

      <div
        className={`reaction-area ${state}`}
        onClick={handleClick}
      >
        {state === 'idle' && (
          <div className="reaction-message">
            <span className="reaction-emoji">🎯</span>
            <p>Click to Start</p>
          </div>
        )}
        {state === 'waiting' && (
          <div className="reaction-message">
            <span className="reaction-emoji">🔴</span>
            <p>Wait for green...</p>
          </div>
        )}
        {state === 'ready' && (
          <div className="reaction-message">
            <span className="reaction-emoji">🟢</span>
            <p>CLICK NOW!</p>
          </div>
        )}
        {state === 'clicked' && reactionTime && !earlyClick && (
          <div className="reaction-message">
            <span className="reaction-emoji">⏱️</span>
            <p className="reaction-time-value">{reactionTime}ms</p>
            <p
              className="reaction-rating"
              style={{ color: getRating(reactionTime).color }}
            >
              {getRating(reactionTime).text}
            </p>
            <p className="reaction-retry">Click to try again</p>
          </div>
        )}
        {earlyClick && (
          <div className="reaction-message">
            <span className="reaction-emoji">⚠️</span>
            <p>Too early!</p>
            <p className="reaction-retry">Click to try again</p>
          </div>
        )}
      </div>

      {attempts.length > 0 && (
        <div className="attempts-history">
          <h4>Recent Attempts</h4>
          <div className="attempts-list">
            {attempts.slice(-5).map((time, index) => (
              <div
                key={index}
                className={`attempt-bar ${time < 300 ? 'fast' : time < 400 ? 'medium' : 'slow'}`}
                style={{ width: `${Math.min(100, (time / 500) * 100)}%` }}
              >
                {time}ms
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="reaction-hint">Test how fast you can react!</p>
    </div>
  );
}

export default ReactionTime;
