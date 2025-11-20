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
  const [favorites, setFavorites] = useState([]); 
  const [formData, setFormData] = useState({ email: '', password: '', name: '', tel: '' });
  
  // New State for "Space Detail Page"
  const [selectedSpace, setSelectedSpace] = useState(null); 

  // Sidebar Controls
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarMode, setSidebarMode] = useState('reserves'); 

  // --- HANDLERS ---
  const handleLogin = () => {
    const role = formData.email === "admin@test.com" ? "admin" : "user";
    setUser({ ...formData, role });
    setView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setView('login');
    setFavorites([]); 
    setSelectedSpace(null); // Reset selection
    setFormData({ email: '', password: '', name: '', tel: '' });
  };

  const handleToggleSidebar = (mode) => {
    if (showSidebar && sidebarMode === mode) {
      setShowSidebar(false);
    } else {
      setShowSidebar(true);
      setSidebarMode(mode);
    }
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
    
    // Switch sidebar to reserves to show success
    if (!showSidebar || sidebarMode !== 'reserves') {
      setShowSidebar(true);
      setSidebarMode('reserves');
    }
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

  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  // Go to specific space page
  const handleGoToSpace = (space) => {
    setSelectedSpace(space);
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
  const myFavoriteSpaces = MOCK_SPACES.filter(space => favorites.includes(space.id));

  // Determine which spaces to show in main panel
  // If selectedSpace is active, show ONLY that one. Otherwise show ALL.
  const displayedSpaces = selectedSpace ? [selectedSpace] : MOCK_SPACES;

  return (
    <div>
      <div className="top-navbar">
        <div className="nav-brand" onClick={() => setSelectedSpace(null)} style={{cursor:'pointer'}}>
          Co-Working Space
        </div>
        <div className="nav-controls">
          <span>Hi, {user.name || user.email}</span>
          <button className="nav-heart-btn" onClick={() => handleToggleSidebar('favorites')} title="Show Favorites">
            {sidebarMode === 'favorites' && showSidebar ? '❤️' : '🤍'}
          </button>
          <button className="toggle-btn" onClick={() => handleToggleSidebar('reserves')}
            style={{ background: sidebarMode === 'reserves' && showSidebar ? '#334155' : '#1e293b' }}>
            {sidebarMode === 'reserves' && showSidebar ? 'Hide Reserves' : 'Show Reserves'}
          </button>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="dashboard-container">
        {/* LEFT PANEL */}
        <div className="main-panel">
          {user.role === 'admin' ? (
            // ADMIN VIEW
            <>
              <h2 style={{marginBottom: 20}}>Admin Dashboard</h2>
              <div style={{background: 'white', padding: 20, borderRadius: 8, border: '1px solid #cbd5e1'}}>
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                  <thead>
                    <tr style={{textAlign:'left', borderBottom: '2px solid #eee'}}>
                      <th style={{padding: 10}}>User</th><th>Space</th><th>Date</th><th>Action</th>
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
            </>
          ) : (
            // USER VIEW
            <>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 20}}>
                <h2>{selectedSpace ? "Reserve Space" : "Available Spaces"}</h2>
                {selectedSpace && (
                  <button className="btn-back" onClick={() => setSelectedSpace(null)}>
                    ← Back to All Spaces
                  </button>
                )}
              </div>

              <div>
                {displayedSpaces.map(space => (
                  <div key={space.id} className="wide-card">
                    <div className="wide-card-info">
                      <h3>{space.name}</h3>
                      <p>📍 {space.address}</p>
                      <p>📞 {space.tel}</p>
                      <p>⏰ {space.open}</p>
                    </div>
                    <div style={{display:'flex', flexDirection:'column', gap:10}}>
                      <div style={{display:'flex', alignItems:'center'}}>
                        <input type="date" id={`date-${space.id}`} style={{flex:1, padding: 8, border:'1px solid #ccc', borderRadius:4}} />
                        <button 
                          className={`card-fav-btn ${favorites.includes(space.id) ? 'active' : ''}`}
                          onClick={() => toggleFavorite(space.id)}
                          title="Add to Favorites"
                        >
                          {favorites.includes(space.id) ? '❤️' : '🤍'}
                        </button>
                      </div>
                      <button className="btn-primary" onClick={() => handleReserve(space)}>Reserve</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* RIGHT PANEL (SIDEBAR) */}
        <div className={`sidebar-panel ${showSidebar ? '' : 'closed'}`}>
          <div className="sidebar-content">
            
            {/* RESERVATIONS LIST */}
            {sidebarMode === 'reserves' && (
              <>
                <h3 style={{borderBottom:'1px solid #ccc', paddingBottom:10, marginBottom:15}}>
                  My Reserves ({myReservations.length}/3)
                </h3>
                {myReservations.length === 0 && <p>No bookings yet.</p>}
                {myReservations.map(res => (
                  <div key={res.id} className="mini-card" style={{cursor: 'default'}}> {/* Reserve cards not clickable for navigation */}
                    <div>
                      <strong>{res.spaceName}</strong>
                      <div style={{fontSize: '0.9rem', marginTop: 4}}>{res.date}</div>
                    </div>
                    <div style={{display:'flex', gap:5}}>
                      <button className="icon-btn" onClick={() => handleEdit(res.id)}>✏️</button>
                      <button className="icon-btn" onClick={() => handleDelete(res.id)} style={{color: '#ef4444'}}>🗑️</button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* FAVORITES LIST - CLICKABLE */}
            {sidebarMode === 'favorites' && (
              <>
                <h3 style={{borderBottom:'1px solid #ccc', paddingBottom:10, marginBottom:15, color: '#ec4899'}}>
                  My Favorites ({favorites.length})
                </h3>
                {favorites.length === 0 && <p>No favorites added yet.</p>}
                {myFavoriteSpaces.map(space => (
                  <div 
                    key={space.id} 
                    className="mini-card"
                    onClick={() => handleGoToSpace(space)} /* CLICK TO GO TO PAGE */
                    title="Click to Reserve"
                  >
                    <div>
                      <strong>{space.name}</strong>
                      <div style={{fontSize: '0.85rem', color: '#666', marginTop:2}}>{space.address}</div>
                    </div>
                    <div style={{display:'flex', gap:5}}>
                      <button 
                         className="icon-btn" 
                         title="Remove Favorite"
                         onClick={(e) => { e.stopPropagation(); toggleFavorite(space.id); }} /* Stop prop so we don't navigate when deleting */
                         style={{fontSize: '1rem'}}
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default App