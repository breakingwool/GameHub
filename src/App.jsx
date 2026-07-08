import { useState, useRef, useCallback } from 'react';
import LoginPage from './components/LoginPage';
import GamesHub from './components/GamesHub';
import { getEarnedPoints, REWARDS, canCompleteActivity } from './data/mockData';
import confetti from 'canvas-confetti';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showGames, setShowGames] = useState(false);
  const activityRefs = useRef({});

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  /**
   * Fire confetti burst from a specific element's position.
   */
  const fireConfetti = useCallback((element) => {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: x / window.innerWidth, y: y / window.innerHeight },
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
      gravity: 1.2,
      ticks: 180,
      shapes: ['square', 'circle'],
      scalar: 0.8,
    });
  }, []);

  const handleActivityToggle = (activityId) => {
    setUser((prevUser) => {
      const activity = prevUser.activities.find((a) => a.id === activityId);

      // If already completed, check if we can uncheck it
      if (activity.completed) {
        const updatedActivities = prevUser.activities.map((a) => {
          if (a.id === activityId) {
            return { ...a, completed: false, score: 0, completedAt: null };
          }
          return a;
        });

        const historyEntry = {
          id: Date.now(),
          type: 'activity_uncompleted',
          activityName: activity.name,
          points: -activity.points,
          timestamp: new Date().toISOString(),
        };

        return {
          ...prevUser,
          activities: updatedActivities,
          balance: prevUser.balance - activity.points,
          history: [historyEntry, ...prevUser.history],
        };
      }

      // If not completed, check frequency constraints
      const check = canCompleteActivity(activity);
      if (!check.canComplete) {
        return prevUser; // Can't complete, do nothing
      }

      // Fire confetti from the activity card
      const cardElement = activityRefs.current[activityId];
      if (cardElement) {
        fireConfetti(cardElement);
      }

      // If the activity was completed in a previous period, reset first
      const now = new Date();
      const updatedActivities = prevUser.activities.map((a) => {
        if (a.id === activityId) {
          return {
            ...a,
            completed: true,
            score: a.points,
            completedAt: now.toISOString(),
          };
        }
        return a;
      });

      const historyEntry = {
        id: Date.now(),
        type: 'activity_completed',
        activityName: activity.name,
        points: activity.points,
        timestamp: now.toISOString(),
      };

      return {
        ...prevUser,
        activities: updatedActivities,
        balance: prevUser.balance + activity.points,
        history: [historyEntry, ...prevUser.history],
      };
    });
  };

  const handleRedeemReward = (rewardId) => {
    setUser((prevUser) => {
      const currentPoints = getEarnedPoints(prevUser.activities);
      const reward = REWARDS.find((r) => r.id === rewardId);

      if (currentPoints >= reward.cost) {
        let pointsToDeduct = reward.cost;
        const updatedActivities = [...prevUser.activities];

        // for (let i = updatedActivities.length - 1; i >= 0; i--) {
        //   if (updatedActivities[i].completed && pointsToDeduct > 0) {
        //     // updatedActivities[i] = {
        //       // ...updatedActivities[i],
        //       // completed: false,
        //       // score: 0,
        //     // };
        //     pointsToDeduct -= updatedActivities[i].points;
        //   }
        // }



        const newRedeemedRewards = [
          ...prevUser.redeemedRewards,
          { ...reward, redeemedAt: new Date().toISOString() },
        ];

        const historyEntry = {
          id: Date.now(),
          type: 'reward_redeemed',
          rewardName: reward.name,
          points: -reward.cost,
          timestamp: new Date().toISOString(),
        };

        return {
          ...prevUser,
          activities: updatedActivities,
          redeemedRewards: newRedeemedRewards,
          history: [historyEntry, ...prevUser.history],
          balance: prevUser.balance - reward.cost
        };
      }
      return prevUser;
    });
  };

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const completedCount = user.activities.filter((a) => a.completed).length;
  const totalCount = user.activities.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome, {user.username}! 👋</h1>
        <button onClick={handleLogout} className="logout-button">
          Sign Out
        </button>
      </header>
      <main className="dashboard-content">
        <div className="progress-card">
          <h2>Your Progress</h2>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <p className="progress-text">
            {user.balance} total points
          </p>
        </div>

        <div className="activities-grid">
          {user.activities.map((activity) => {
            const check = canCompleteActivity(activity);
            const isLocked = activity.completed && !check.canComplete;
            const isResettable = activity.completed && check.reset;

            return (
              <div
                key={activity.id}
                ref={(el) => (activityRefs.current[activity.id] = el)}
                className={`activity-card ${activity.completed ? 'completed' : ''} ${isLocked ? 'locked' : ''} ${isResettable ? 'resettable' : ''}`}
                onClick={() => !isLocked && handleActivityToggle(activity.id)}
              >
                <div className="activity-icon">{activity.icon}</div>
                <div className="activity-info">
                  <h3>{activity.name}</h3>
                  <p>{activity.points} points</p>
                  <span className={`frequency-badge ${activity.frequency}`}>
                    {activity.frequency === 'daily' ? '📅 Daily' : '📆 Weekly'}
                  </span>
                </div>
                <div className={`activity-status ${activity.completed ? 'checked' : ''}`}>
                  {activity.completed ? '✓' : '○'}
                </div>
              </div>
            );
          })}
        </div>

        <section className="rewards-section">
          <h2 className="section-title">🎁 Rewards</h2>
          <p className="section-subtitle">Redeem your points for awesome rewards!</p>
          <div className="rewards-grid">
            {REWARDS.map((reward) => {
              const canAfford = user.balance >= reward.cost;
              return (
                <div
                  key={reward.id}
                  className={`reward-card ${canAfford ? 'affordable' : 'expensive'}`}
                  onClick={() => canAfford && handleRedeemReward(reward.id)}
                >
                  <div className="reward-icon">{reward.icon}</div>
                  <div className="reward-info">
                    <h3>{reward.name}</h3>
                    <p className="reward-cost">{reward.cost} points</p>
                  </div>
                  <button
                    className={`redeem-button ${canAfford ? 'can-redeem' : 'cannot-redeem'}`}
                    disabled={!canAfford}
                  >
                    {canAfford ? 'Redeem' : 'Need more points'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {user.redeemedRewards.length > 0 && (
          <section className="redeemed-section">
            <h2 className="section-title">✅ Redeemed Rewards</h2>
            <div className="redeemed-list">
              {user.redeemedRewards.map((reward, index) => (
                <div key={index} className="redeemed-item">
                  <span className="redeemed-icon">{reward.icon}</span>
                  <span className="redeemed-name">{reward.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="history-section">
          <h2 className="section-title">📋 Activity Log</h2>
          <p className="section-subtitle">A timeline of all your activities and rewards</p>
          {user.history.length === 0 ? (
            <p className="empty-history">No activity yet. Complete tasks or redeem rewards to see your history!</p>
          ) : (
            <div className="history-timeline">
              {user.history.map((entry) => (
                <div key={entry.id} className={`history-item ${entry.type}`}>
                  <div className="history-icon">
                    {entry.type === 'activity_completed' ? '✅' :
                     entry.type === 'activity_uncompleted' ? '❌' : '🎁'}
                  </div>
                  <div className="history-details">
                    <span className="history-action">
                      {entry.type === 'activity_completed' ? `Completed ${entry.activityName}` :
                       entry.type === 'activity_uncompleted' ? `Uncompleted ${entry.activityName}` :
                       `Redeemed ${entry.rewardName}`}
                    </span>
                    <span className={`history-points ${entry.points > 0 ? 'positive' : 'negative'}`}>
                      {entry.points > 0 ? '+' : ''}{entry.points} pts
                    </span>
                  </div>
                  <span className="history-time">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="games-section">
          <button className="open-games-button" onClick={() => setShowGames(true)}>
            🎮 Play Mini Games
          </button>
          {showGames && <GamesHub onClose={() => setShowGames(false)} />}
        </section>
      </main>
    </div>
  );
}

export default App;
