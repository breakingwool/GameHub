import { useState } from 'react';
import { MOCK_USERS } from '../data/mockData';
import './LoginPage.css';

function LoginPage({ onLoginSuccess }) {
  const [selectedUser, setSelectedUser] = useState(MOCK_USERS[0]?.username ?? '');

  const handleSelectProfile = (user) => {
    setSelectedUser(user.username);
    onLoginSuccess(user);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Welcome to the GameHub</h1>

        <div className="avatar-selector" role="list">
          {MOCK_USERS.map((user) => {
            const isSelected = selectedUser === user.username;

            return (
              <button
                key={user.username}
                type="button"
                className={`avatar-option ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectProfile(user)}
                aria-label={`Select ${user.username}'s profile`}
              >
                <div className="avatar-circle" aria-hidden="true">
                  <span className="avatar-emoji">{user.avatar || '👤'}</span>
                </div>
                <span className="avatar-name">{user.username}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
