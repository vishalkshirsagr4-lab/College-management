import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as authApi from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { startPendingAuth } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await authApi.register({ name, email, password });
      startPendingAuth({ email, mode: 'register' });
      setSuccess('OTP sent. Verify it to complete registration.');
      navigate('/verify-otp');
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="card card-panel auth-card">
        <h1>Register</h1>
        <p className="text-muted">Create a student account with secure OTP email verification.</p>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <div className="alert-error">{error}</div>}
          {success && <div className="alert-success">{success}</div>}
          <button type="submit" className="button button-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="text-sm">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
