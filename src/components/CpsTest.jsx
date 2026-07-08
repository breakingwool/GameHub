import { useState, useRef, useCallback, useEffect } from 'react';
import './CpsTest.css';

function CpsTest() {
  const [state, setState] = useState('idle'); // idle, running, finished
  const [clicks, setClicks] = useState(0);
  const [cps, setCps] = useState(null);
  const [bestCps, setBestCps] = useState(null);
  const [timeLeft, setTimeLeft] = useState(5);
  const [duration, setDuration] = useState(5); // seconds
  const [history, setHistory] = useState([]);
  const [cooldown, setCooldown] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(0);

  const timerRef = useRef(null);
  const clicksRef = useRef(0);
  const finishedRef = useRef(false);
  const cooldownTimerRef = useRef(null);

  const startTest = useCallback(() => {
    if (cooldown) return;
    setState('running');
    setClicks(0);
    clicksRef.current = 0;
    setCps(null);
    setTimeLeft(duration);
    finishedRef.current = false;

    const endTime = Date.now() + duration * 1000;

    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0 && !finishedRef.current) {
        finishedRef.current = true;
        clearInterval(timerRef.current);
        setState('finished');

        const finalClicks = clicksRef.current;
        const calculatedCps = (finalClicks / duration).toFixed(2);
        setCps(calculatedCps);
        setHistory((prev) => [...prev, parseFloat(calculatedCps)]);
        setBestCps((prev) => {
          const newCps = parseFloat(calculatedCps);
          return prev === null ? newCps : Math.max(prev, newCps);
        });

        // Start 5-second cooldown
        setCooldown(true);
        setCooldownLeft(5);
        let cd = 5;
        cooldownTimerRef.current = setInterval(() => {
          cd -= 1;
          setCooldownLeft(cd);
          if (cd <= 0) {
            clearInterval(cooldownTimerRef.current);
            setCooldown(false);
            setCooldownLeft(0);
          }
        }, 1000);
      }
    }, 100);
  }, [duration]);

  const handleClick = () => {
    if (cooldown) return;
    if (state === 'idle' || state === 'finished') {
      startTest();
      clicksRef.current = 1;
      setClicks(1);
    } else if (state === 'running') {
      clicksRef.current += 1;
      setClicks((prev) => prev + 1);
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(cooldownTimerRef.current);
    };
  }, []);

  const getRating = (cpsValue) => {
    if (cpsValue >= 14) return { text: '🤖 Macro Suspect!', color: '#ef4444' };
    if (cpsValue >= 12) return { text: '⚡ Insane!', color: '#f59e0b' };
    if (cpsValue >= 10) return { text: '🔥 Amazing!', color: '#10b981' };
    if (cpsValue >= 8) return { text: '💪 Great!', color: '#3b82f6' };
    if (cpsValue >= 6) return { text: '👍 Good!', color: '#8b5cf6' };
    return { text: '🐢 Keep practicing!', color: '#9ca3af' };
  };

  const getAverage = () => {
    if (history.length === 0) return null;
    const sum = history.reduce((a, b) => a + b, 0);
    return (sum / history.length).toFixed(2);
  };

  return (
    <div className="cps-test">
      <div className="cps-header">
        <h2>🖱️ CPS Test</h2>
        <div className="cps-stats">
          {bestCps !== null && <span>Best: {bestCps} CPS</span>}
          {getAverage() && <span>Average: {getAverage()} CPS</span>}
        </div>
      </div>

      <div className="cps-duration-selector">
        <span className="duration-label">Duration:</span>
        {[1, 5, 10].map((d) => (
          <button
            key={d}
            className={`duration-btn ${duration === d ? 'active' : ''}`}
            disabled={state === 'running'}
            onClick={() => {
              setDuration(d);
              setState('idle');
              setCps(null);
              setClicks(0);
              setTimeLeft(d);
            }}
          >
            {d}s
          </button>
        ))}
      </div>

      <div className={`cps-area ${state}`} onClick={handleClick}>
        {state === 'idle' && (
          <div className="cps-message">
            <span className="cps-emoji">🖱️</span>
            <p>Click to Start</p>
            <p className="cps-hint">Click as fast as you can!</p>
          </div>
        )}

        {(state === 'running' || state === 'finished') && (
          <div className="cps-message">
            <span className="cps-emoji">⚡</span>
            <p className="cps-click-count">{clicks} clicks</p>
            <p className="cps-timer">{timeLeft}s remaining</p>
            {state === 'finished' && cps && (
              <>
                <p className="cps-result">{cps} CPS</p>
                <p className="cps-rating" style={{ color: getRating(parseFloat(cps)).color }}>
                  {getRating(parseFloat(cps)).text}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {state === 'finished' && !cooldown && (
        <button className="cps-retry-btn" onClick={() => { setState('idle'); setCps(null); setClicks(0); setTimeLeft(duration); }}>
          Try Again
        </button>
      )}

      {cooldown && (
        <p className="cps-cooldown">Cooldown: {cooldownLeft}s</p>
      )}

      {history.length > 1 && (
        <div className="cps-history">
          <h3>Recent Attempts</h3>
          <div className="cps-history-list">
            {history.slice(-5).reverse().map((val, i) => (
              <span key={i} className="cps-history-item">{val} CPS</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CpsTest;
