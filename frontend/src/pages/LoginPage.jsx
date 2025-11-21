import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import '../App.css';

const LoginPage = () => {
  const { login, verifyOtp } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '', otp: '' });
  const [step, setStep] = useState('password'); // 'password' | 'otp'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info'); // 'info' | 'success' | 'error'
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      setMessageType(location.state.messageType || 'success');
    }
    if (location.state?.email) {
      setFormData(prev => ({ ...prev, email: location.state.email }));
    }
  }, [location.state]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('info');
    try {
      const result = await login(formData.email, formData.password);
      if (result?.otpRequired) {
        setStep('otp');
        setMessage('OTP sent to your email. Please enter the 6-digit code.');
        setMessageType('info');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setMessage('Login failed. Please check your credentials and try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('info');
    try {
      await verifyOtp(formData.email, formData.otp);
      navigate('/dashboard');
    } catch (err) {
      setMessage('OTP verification failed. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 style={{ textAlign: 'center', marginBottom: 10 }}>Login</h2>
        {message && (
          <p
            style={{
              color:
                messageType === 'success'
                  ? '#2f855a'
                  : messageType === 'error'
                  ? '#d14343'
                  : '#444',
              textAlign: 'center',
              marginBottom: 5
            }}
          >
            {message}
          </p>
        )}

        {step === 'password' && (
          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            <input
              className="auth-input"
              type="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
            <input
              className="auth-input"
              type="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Login'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            <input
              className="auth-input"
              type="text"
              placeholder="Enter 6-digit OTP"
              required
              value={formData.otp}
              onChange={e => setFormData({ ...formData, otp: e.target.value })}
            />
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setStep('password');
                setFormData({ ...formData, otp: '' });
                setMessage('');
              }}
            >
              Back to login
            </button>
          </form>
        )}

        <Link to="/register">
          <button className="btn-secondary" style={{ width: '100%', marginTop: 10 }}>Create Account</button>
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
