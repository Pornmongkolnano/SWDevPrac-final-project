import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import Navbar from '../components/Navbar';
import SpaceCard from '../components/SpaceCard';
import api from '../api/axios'; // Import your API helper

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  
  // --- STATE ---
  const [spaces, setSpaces] = useState([]); // Store fetched spaces here
  const [loadingSpaces, setLoadingSpaces] = useState(true);
  const [reservations, setReservations] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarMode, setSidebarMode] = useState('reserves');

  // --- 1. FETCH SPACES ON LOAD ---
  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        // Call GET /api/v1/coworking-spaces
        const res = await api.get('/coworking-spaces');
        setSpaces(res.data.data); // Backend returns { success: true, data: [...] }
        setLoadingSpaces(false);
      } catch (err) {
        console.error("Error fetching spaces:", err);
        setLoadingSpaces(false);
      }
    };

    fetchSpaces();
  }, []);

  // --- HANDLERS ---
  const handleToggleSidebar = (mode) => {
    if (showSidebar && sidebarMode === mode) {
      setShowSidebar(false);
    } else {
      setShowSidebar(true);
      setSidebarMode(mode);
    }
  };

  const handleReserve = (space) => {
    // Handle MongoDB _id vs Mock id
    const spaceId = space._id || space.id;
    const dateInput = document.getElementById(`date-${spaceId}`).value;
    
    if (!dateInput) return alert("Please select a date first.");
    
    if (reservations.filter(r => r.userEmail === user.email).length >= 3) {
        return alert("Limit reached: 3 slots.");
    }

    const newRes = {
      id: Date.now(), // Temporary ID for frontend state
      userEmail: user.email,
      spaceName: space.name,
      date: dateInput
    };
    setReservations([...reservations, newRes]);
    
    if (!showSidebar || sidebarMode !== 'reserves') {
      setShowSidebar(true);
      setSidebarMode('reserves');
    }
  };

  const toggleFavorite = (id) => {
    if (favorites.includes(id)) setFavorites(favorites.filter(favId => favId !== id));
    else setFavorites([...favorites, id]);
  };

  // --- RENDER HELPERS ---
  const displayedSpaces = selectedSpace ? [selectedSpace] : spaces;
  const myReservations = reservations.filter(r => r.userEmail === user.email);
  
  // Filter favorites from the real 'spaces' array
  const myFavoriteSpaces = spaces.filter(space => favorites.includes(space._id || space.id));

  return (
    <div>
      <Navbar 
        user={user} 
        logout={logout} 
        toggleSidebar={handleToggleSidebar} 
        sidebarMode={sidebarMode} 
        showSidebar={showSidebar} 
      />

      <div className="dashboard-container">
        {/* LEFT PANEL */}
        <div className="main-panel">
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 20}}>
            <h2>{selectedSpace ? "Reserve Space" : "Available Spaces"}</h2>
            {selectedSpace && (
                <button className="btn-back" onClick={() => setSelectedSpace(null)}>
                ← Back to All Spaces
                </button>
            )}
            </div>

            {loadingSpaces ? (
                <p>Loading spaces from database...</p>
            ) : (
                <div>
                {displayedSpaces.map(space => (
                    <SpaceCard 
                        key={space._id || space.id} 
                        space={space} 
                        isFavorite={favorites.includes(space._id || space.id)}
                        toggleFavorite={toggleFavorite}
                        onReserve={handleReserve}
                    />
                ))}
                </div>
            )}
        </div>

        {/* RIGHT PANEL (SIDEBAR) */}
        <div className={`sidebar-panel ${showSidebar ? '' : 'closed'}`}>
          <div className="sidebar-content">
            
            {sidebarMode === 'reserves' && (
              <>
                <h3 style={{borderBottom:'1px solid #ccc', paddingBottom:10, marginBottom:15}}>
                  My Reserves ({myReservations.length}/3)
                </h3>
                {myReservations.length === 0 && <p>No bookings yet.</p>}
                {myReservations.map(res => (
                  <div key={res.id} className="mini-card" style={{cursor: 'default'}}>
                    <div>
                      <strong>{res.spaceName}</strong>
                      <div style={{fontSize: '0.9rem', marginTop: 4}}>{res.date}</div>
                    </div>
                    <button className="icon-btn" onClick={() => setReservations(reservations.filter(r => r.id !== res.id))} style={{color: '#ef4444'}}>🗑️</button>
                  </div>
                ))}
              </>
            )}

            {sidebarMode === 'favorites' && (
              <>
                <h3 style={{borderBottom:'1px solid #ccc', paddingBottom:10, marginBottom:15, color: '#ec4899'}}>
                  My Favorites ({favorites.length})
                </h3>
                {favorites.length === 0 && <p>No favorites added yet.</p>}
                {myFavoriteSpaces.map(space => (
                  <div 
                    key={space._id || space.id} 
                    className="mini-card"
                    onClick={() => setSelectedSpace(space)}
                    title="Click to Reserve"
                  >
                    <div>
                      <strong>{space.name}</strong>
                      <div style={{fontSize: '0.85rem', color: '#666', marginTop:2}}>{space.address}</div>
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
};

export default Dashboard;