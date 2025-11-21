import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import '../App.css';

const RegisterPage = () => {
  const { register } = useContext(AuthContext);
  const [formData, setFormData] = useState({ name: '', telephone: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(formData.name, formData.telephone, formData.email, formData.password);
      navigate('/login', {
        state: {
          message: 'Registration successful. Please login with your credentials.',
          email: formData.email
        }
      });
    } catch (err) {
      setError('Registration failed. Please check your inputs and try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 style={{textAlign:'center', marginBottom: 10}}>Register</h2>
        {error && <p style={{ color: '#d14343', textAlign: 'center', marginBottom: 5 }}>{error}</p>}
        <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:15}}>
            <input className="auth-input" placeholder="Name" required
                onChange={e => setFormData({...formData, name: e.target.value})} />
            <input className="auth-input" placeholder="Telephone" required
                onChange={e => setFormData({...formData, telephone: e.target.value})} />
            <input className="auth-input" type="email" placeholder="Email" required
                onChange={e => setFormData({...formData, email: e.target.value})} />
            <input className="auth-input" type="password" placeholder="Password" required
                onChange={e => setFormData({...formData, password: e.target.value})} />
            <button className="btn-primary" type="submit">Submit Register</button>
        </form>
        <Link to="/login">
            <button className="btn-secondary" style={{width:'100%'}}>Back to Login</button>
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
