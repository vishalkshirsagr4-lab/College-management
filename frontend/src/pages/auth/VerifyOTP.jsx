import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const { pendingAuth, setAuthState, clearPendingAuth } = useAuth();
  const [code, setCode] = useState(new Array(6).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);

  useEffect(() => {
    if (!pendingAuth?.email || !pendingAuth?.mode) {
      navigate('/login');
    }
  }, [pendingAuth, navigate]);

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...code];
    next[index] = value;
    setCode(next);
    if (value && inputs.current[index + 1]) {
      inputs.current[index + 1].focus();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const otp = code.join('');
    if (otp.length !== 6) {
      setError('Enter the 6-digit code.');
      setLoading(false);
      return;
    }

    try {
      if (pendingAuth.mode === 'login') {
        const response = await authApi.verifyLogin({ email: pendingAuth.email, otp });
        setAuthState({ user: response.data.user, token: response.data.token });
        clearPendingAuth();
        navigate('/');
      } else {
        await authApi.verifyRegister({ email: pendingAuth.email, otp });
        clearPendingAuth();
        navigate('/login');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="card card-panel auth-card">
        <h1>Verify OTP</h1>
        <p className="text-muted">Enter the 6-digit code sent to {pendingAuth?.email}</p>
        <form className="otp-form" onSubmit={handleSubmit}>
          <div className="otp-grid">
            {code.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                ref={(el) => (inputs.current[index] = el)}
                onChange={(e) => handleChange(index, e.target.value)}
              />
            ))}
          </div>
          {error && <div className="alert-error">{error}</div>}
          <button type="submit" className="button button-primary" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
