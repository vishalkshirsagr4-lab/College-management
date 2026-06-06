import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as authApi from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { startPendingAuth } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.login({ email, password });
      startPendingAuth({ email, mode: 'login' });
      navigate('/verify-otp');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to send OTP.');
      alert(err);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="card card-panel auth-card">
        <h1>Login</h1>
        <p className="text-muted">Secure access for admin, teacher and student.</p>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <div className="alert-error">{error}</div>}
          <button type="submit" className="button button-primary" disabled={loading}>
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
        <p className="text-sm">
          Don’t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
