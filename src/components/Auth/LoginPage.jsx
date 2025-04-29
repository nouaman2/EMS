import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/LoginPage.css';
import { loginUser, getApiKeys } from '../../services/authService';

const LoginPage = ({ isDarkMode, toggleTheme }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { success, sessionid, message } = await loginUser(username, password);

      if (success) {
        localStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', username);
        localStorage.setItem('sessionId', sessionid);
        window.dispatchEvent(new Event('auth-change'));

        try {
          const { success: apiSuccess, apikey_read } = await getApiKeys(username, password);
          if (apiSuccess && apikey_read) {
            localStorage.setItem('apikey', apikey_read);
          }
        } catch (apiErr) {
          console.warn('Failed to retrieve API keys:', apiErr.message);
        }

        navigate('/dashboard/', { replace: true });
      } else {
        setError(message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to connect to the server');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = ({ id, label, type, value, onChange, showToggle }) => (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div className={showToggle ? 'password-input-container' : ''}>
        <input
          type={showToggle && showPassword ? 'text' : type}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter your ${label.toLowerCase()}`}
          required
          disabled={isLoading}
        />
        {showToggle && (
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg viewBox="0 0 24 24" className="eye-icon"><path fill="currentColor" d="M12 4.5C7..." /></svg>
            ) : (
              <svg viewBox="0 0 24 24" className="eye-icon"><path fill="currentColor" d="M12 7c2.76..." /></svg>
            )}
          </button>
        )}
      </div>
    </div>
  );

  const ThemeToggle = () => (
    <button className="theme-toggle" onClick={toggleTheme} title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
      {isDarkMode ? (
        <svg className="theme-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 7c-2.76..." /></svg>
      ) : (
        <svg className="theme-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3c-4.97..." /></svg>
      )}
    </button>
  );

  return (
    <div className="login-container">
      <div className="login-header">
        <div className="brand">
          <img src="/EWlogo.jpg" alt="Electric Wave Logo" className="logo" />
          <h1>Electric Wave EMS</h1>
        </div>
        <ThemeToggle />
      </div>

      <div className="login-form-container">
        <h3>Login</h3>
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          <InputField id="username" label="Username" type="text" value={username} onChange={setUsername} />
          <InputField id="password" label="Password" type="password" value={password} onChange={setPassword} showToggle />
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="register-link">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="register-link-text">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
