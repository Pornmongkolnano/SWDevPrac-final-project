import { useState } from 'react'
import './App.css'

const MOCK_SPACES = [
  { id: 1, name: "The Hive", address: "123 Main St", tel: "02-111-1111", open: "08:00 - 20:00" },
  { id: 2, name: "WorkLoft", address: "456 Silom Rd", tel: "02-222-2222", open: "24 Hours" },
  { id: 3, name: "DraftBoard", address: "789 Sukhumvit", tel: "02-333-3333", open: "09:00 - 18:00" },
  { id: 4, name: "Paperwork", address: "101 Sathorn", tel: "02-444-4444", open: "10:00 - 22:00" },
];

function App() {
  // --- STATE ---
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [formData, setFormData] = useState({ email: '', password: '', name: '', tel: '' });
  const [showSidebar, setShowSidebar] = useState(true);

  // --- HANDLERS ---
  const handleLogin = () => {
    const role = formData.email === "admin@test.com" ? "admin" : "user";
    setUser({ ...formData, role });
    setView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setView('login');
    setFormData({ email: '', password: '', name: '', tel: '' });
  };

  const handleReserve = (space) => {
    const dateInput = document.getElementById(`date-${space.id}`).value;
    if (!dateInput) return alert("Please select a date first.");

    const myCount = reservations.filter(r => r.userEmail === user.email).length;
    if (myCount >= 3) return alert("Limit reached: You can only reserve 3 slots.");

    const newRes = {
      id: Date.now(),
      userEmail: user.email,
      spaceName: space.name,
      date: dateInput
    };
    setReservations([...reservations, newRes]);
    
    if (!showSidebar) setShowSidebar(true);
  };

  const handleDelete = (id) => {
    if (confirm("Delete this reservation?")) {
      setReservations(reservations.filter(r => r.id !== id));
    }
  };

  const handleEdit = (id) => {
    const newDate = prompt("Enter new date (YYYY-MM-DD):");
    if (newDate) {
      setReservations(reservations.map(r => r.id === id ? { ...r, date: newDate } : r));
    }
  };

  // --- VIEW 1: LOGIN / REGISTER ---
  if (view === 'login' || view === 'register') {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h2 style={{textAlign:'center', marginBottom: 10}}>
            {view === 'login' ? 'Login' : 'Register'}
          </h2>
          
          {view === 'register' && (
            <>
              <input className="auth-input" placeholder="Name" onChange={e => setFormData({...formData, name: e.target.value})} />
              <input className="auth-input" placeholder="Telephone" onChange={e => setFormData({...formData, tel: e.target.value})} />
            </>
          )}
          
          <input className="auth-input" type="email" placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} />
          <input className="auth-input" type="password" placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} />

          {view === 'login' ? (
            <>
              <button className="btn-primary" onClick={handleLogin}>Login</button>
              <button className="btn-secondary" onClick={() => setView('register')}>Register</button>
            </>
          ) : (
            <>
              <button className="btn-primary" onClick={() => { alert("Registered!"); setView('login'); }}>Submit Register</button>
              <button className="btn-secondary" onClick={() => setView('login')}>Back to Login</button>
            </>
          )}
        </div>
      </div>
    );
  }

  // --- VIEW 2: DASHBOARD ---
  const myReservations = reservations.filter(r => r.userEmail === user.email);

  return (
    <div>
      {/* TOP NAVIGATION BAR */}
      <div className="top-navbar">
        <div className="nav-brand">Co-Working Space</div>
        <div className="nav-controls">
          <span>Hi, {user.name || user.email}</span>
          
          {/* TOGGLE BUTTON IN BAR */}
          <button className="toggle-btn" onClick={() => setShowSidebar(!showSidebar)}>
            {showSidebar ? 'Hide Reserves' : 'Show Reserves'}
          </button>
          
          {/* UPDATED LOGOUT BUTTON */}
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-container">
        {/* LEFT PANEL */}
        <div className="main-panel">
          <h2 style={{marginBottom: 20}}>
            {user.role === 'admin' ? "Admin Dashboard" : "Available Spaces"}
          </h2>

          {user.role === 'admin' ? (
            /* ADMIN TABLE */
            <div style={{background: 'white', padding: 20, borderRadius: 8, border: '1px solid #cbd5e1'}}>
              <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{textAlign:'left', borderBottom: '2px solid #eee'}}>
                    <th style={{padding: 10}}>User</th>
                    <th style={{padding: 10}}>Space</th>
                    <th style={{padding: 10}}>Date</th>
                    <th style={{padding: 10}}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map(res => (
                    <tr key={res.id} style={{borderBottom: '1px solid #eee'}}>
                      <td style={{padding: 10}}>{res.userEmail}</td>
                      <td style={{padding: 10}}>{res.spaceName}</td>
                      <td style={{padding: 10}}>{res.date}</td>
                      <td style={{padding: 10}}>
                        <button onClick={() => handleEdit(res.id)} style={{marginRight:10}}>✏️</button>
                        <button onClick={() => handleDelete(res.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* USER LIST */
            <div>
              {MOCK_SPACES.map(space => (
                <div key={space.id} className="wide-card">
                  <div className="wide-card-info">
                    <h3>{space.name}</h3>
                    <p>📍 {space.address}</p>
                    <p>📞 {space.tel}</p>
                    <p>⏰ {space.open}</p>
                  </div>
                  <div style={{display:'flex', flexDirection:'column', gap:10}}>
                    <input type="date" id={`date-${space.id}`} style={{padding: 8, border:'1px solid #ccc', borderRadius:4}} />
                    <button className="btn-primary" onClick={() => handleReserve(space)}>Reserve</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT PANEL (SIDEBAR) */}
        <div className={`sidebar-panel ${showSidebar ? '' : 'closed'}`}>
          <div className="sidebar-content">
            <h3 style={{borderBottom:'1px solid #ccc', paddingBottom:10, marginBottom:15}}>
              My Reserves ({myReservations.length}/3)
            </h3>
            
            {myReservations.length === 0 && <p>No bookings yet.</p>}

            {myReservations.map(res => (
              <div key={res.id} className="mini-card">
                <div>
                  <strong>{res.spaceName}</strong>
                  <div style={{fontSize: '0.9rem', marginTop: 4}}>{res.date}</div>
                </div>
                <div style={{display:'flex', gap:5}}>
                  <button className="icon-btn" onClick={() => handleEdit(res.id)} title="Edit">✏️</button>
                  <button className="icon-btn" onClick={() => handleDelete(res.id)} title="Delete" style={{color: '#ef4444'}}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App