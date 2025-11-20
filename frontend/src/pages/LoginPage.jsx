import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import '../App.css'; // Keep using your CSS

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard'); // Redirect on success
    } catch (err) {
      alert("Login Failed. Check credentials.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 style={{textAlign:'center', marginBottom: 10}}>Login</h2>
        <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:15}}>
            <input className="auth-input" type="email" placeholder="Email" required
                onChange={e => setFormData({...formData, email: e.target.value})} />
            <input className="auth-input" type="password" placeholder="Password" required
                onChange={e => setFormData({...formData, password: e.target.value})} />
            <button className="btn-primary" type="submit">Login</button>
        </form>
        <Link to="/register">
            <button className="btn-secondary" style={{width:'100%'}}>Create Account</button>
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;