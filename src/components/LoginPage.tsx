import React, { useState, FormEvent } from 'react';
import styles from './LoginPage.module.css';

// Define the structure for a user for type safety
interface User {
  username: string;
  password?: string; // Assuming we might check passwords later, but mocking for now
}

// Mock user data for login validation
const MOCK_USERS: User[] = [
  { username: 'casey' },
  { username: 'adrian' },
];

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock login validation: Check if the username exists in our mock list
    const userExists = MOCK_USERS.some(user => user.username === username);

    if (!userExists) {
      setError('Invalid credentials. Please check your username.');
      setIsLoading(false);
      return;
    }

    // For this mock, we only check username existence.
    // In a real app, you would validate the password too.
    if (username === 'casey' && password === 'password') { // Example: hardcoding a mock password for testing
        onLoginSuccess({ username: 'casey' });
    } else if (username === 'adrian' && password === 'password') {
        onLoginSuccess({ username: 'adrian' });
    } else {
        setError('Invalid credentials. Please check your username and password.');
        setIsLoading(false);
    }
    
    setIsLoading(false);
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h1>Application Login</h1>
        <p className={styles.subtitle}>Please log in to continue.</p>
        
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.formGroup}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username (casey or adrian)"
              disabled={isLoading}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={isLoading}
              required
            />
          </div>
          
          {error && <p className={styles.error}>{error}</p>}
          
          <button 
            type="submit" 
            className={styles.loginButton} 
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;