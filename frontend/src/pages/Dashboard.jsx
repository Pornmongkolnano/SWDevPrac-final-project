import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import Navbar from '../components/Navbar';
import SpaceCard from '../components/SpaceCard';
import api from '../api/axios';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  
  // --- STATE ---
  const [spaces, setSpaces] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState(null);
  
  // Sidebar State
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarMode, setSidebarMode] = useState('reserves');

  // --- EDITING STATE (NEW) ---
  const [editingReservationId, setEditingReservationId] = useState(null);
  const [editDate, setEditDate] = useState(""); 

  // --- 1. FETCH DATA ON LOAD ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const spacesRes = await api.get('/coworking-spaces');
        setSpaces(spacesRes.data.data);
        await fetchReservations();
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const fetchReservations = async () => {
    try {
      const res = await api.get('/reservations');
      setReservations(res.data.data);
    } catch (err) {
      console.error("Failed to fetch reservations", err);
    }
  };

  // --- HANDLERS ---
  const handleToggleSidebar = (mode) => {
    if (showSidebar && sidebarMode === mode) {
      setShowSidebar(false);
    } else {
      setShowSidebar(true);
      setSidebarMode(mode);
    }
  };

  const handleReserve = async (space) => {
    const spaceId = space._id || space.id;
    const dateInput = document.getElementById(`date-${spaceId}`).value;
    
    if (!dateInput) return alert("Please select a date first.");

    try {
      await api.post(`/coworking-spaces/${spaceId}/reservations`, {
        reservationDate: dateInput
      });
      await fetchReservations();
      if (!showSidebar || sidebarMode !== 'reserves') {
        setShowSidebar(true);
        setSidebarMode('reserves');
      }
      alert("Reservation successful!");
    } catch (err) {
      const msg = err.response?.data?.message || "Reservation failed";
      alert(msg);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this reservation?")) {
      try {
        await api.delete(`/reservations/${id}`);
        await fetchReservations();
      } catch (err) {
        alert(err.response?.data?.message || "Delete failed");
      }
    }
  };

  // --- NEW EDIT HANDLERS (No more prompt!) ---
  
  const startEdit = (reservation) => {
    setEditingReservationId(reservation._id);
    // Convert ISO date to YYYY-MM-DD for the input
    const currentDate = reservation.reservationDate ? reservation.reservationDate.split('T')[0] : '';
    setEditDate(currentDate);
  };

  const cancelEdit = () => {
    setEditingReservationId(null);
    setEditDate("");
  };

  const saveEdit = async (id) => {
    if (!editDate) return alert("Please select a date");
    try {
        await api.put(`/reservations/${id}`, {
            reservationDate: editDate
        });
        await fetchReservations(); // Refresh data
        setEditingReservationId(null); // Exit edit mode
    } catch (err) {
        alert(err.response?.data?.message || "Update failed");
    }
  };

  const toggleFavorite = (id) => {
    if (favorites.includes(id)) setFavorites(favorites.filter(favId => favId !== id));
    else setFavorites([...favorites, id]);
  };

  // --- RENDER HELPERS ---
  const displayedSpaces = selectedSpace ? [selectedSpace] : spaces;
  const myReservations = reservations; 
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
        {/* LEFT PANEL: MAIN CONTENT */}
        <div className="main-panel">
            {/* USER: SPACE LIST */}
            {user.role !== 'admin' && (
                <>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 20}}>
                        <h2>{selectedSpace ? "Reserve Space" : "Available Spaces"}</h2>
                        {selectedSpace && (
                            <button className="btn-back" onClick={() => setSelectedSpace(null)}>
                            ← Back to All Spaces
                            </button>
                        )}
                    </div>

                    {loading ? <p>Loading...</p> : (
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
                </>
            )}

            {/* ADMIN: RESERVATION TABLE */}
            {user.role === 'admin' && (
                <>
                    <h2 style={{marginBottom: 20}}>Admin Dashboard: All Reservations</h2>
                    <div style={{background: 'white', padding: 20, borderRadius: 8, border: '1px solid #cbd5e1'}}>
                        {loading ? <p>Loading...</p> : (
                        <table style={{width: '100%', borderCollapse: 'collapse'}}>
                            <thead>
                            <tr style={{textAlign:'left', borderBottom: '2px solid #eee'}}>
                                <th style={{padding: 10}}>User ID</th>
                                <th style={{padding: 10}}>Space</th>
                                <th style={{padding: 10}}>Date</th>
                                <th style={{padding: 10}}>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {reservations.map(res => (
                                <tr key={res._id} style={{borderBottom: '1px solid #eee'}}>
                                <td style={{padding: 10, fontSize:'0.85rem', color:'#666'}}>
                                    {res.user}
                                </td>
                                <td style={{padding: 10}}>
                                    {res.coworkingSpace ? res.coworkingSpace.name : 'Unknown Space'}
                                </td>
                                <td style={{padding: 10}}>
                                    {/* TOGGLE BETWEEN VIEW AND EDIT MODE */}
                                    {editingReservationId === res._id ? (
                                        <input 
                                            type="date" 
                                            value={editDate}
                                            onChange={(e) => setEditDate(e.target.value)}
                                            style={{padding: '5px'}}
                                        />
                                    ) : (
                                        res.reservationDate ? res.reservationDate.split('T')[0] : 'N/A'
                                    )}
                                </td>
                                <td style={{padding: 10}}>
                                    {editingReservationId === res._id ? (
                                        <>
                                            <button onClick={() => saveEdit(res._id)} style={{marginRight:10, background:'none', border:'none', cursor:'pointer'}}>✅</button>
                                            <button onClick={cancelEdit} style={{background:'none', border:'none', cursor:'pointer'}}>❌</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => startEdit(res)} style={{marginRight:10, background:'none', border:'none', cursor:'pointer'}}>✏️</button>
                                            <button onClick={() => handleDelete(res._id)} style={{background:'none', border:'none', cursor:'pointer'}}>🗑️</button>
                                        </>
                                    )}
                                </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        )}
                    </div>
                </>
            )}
        </div>

        {/* RIGHT PANEL: SIDEBAR (User Only) */}
        {user.role !== 'admin' && (
            <div className={`sidebar-panel ${showSidebar ? '' : 'closed'}`}>
            <div className="sidebar-content">
                
                {/* MY RESERVATIONS */}
                {sidebarMode === 'reserves' && (
                <>
                    <h3 style={{borderBottom:'1px solid #ccc', paddingBottom:10, marginBottom:15}}>
                    My Reserves ({reservations.length})
                    </h3>
                    {reservations.length === 0 && <p>No bookings yet.</p>}
                    
                    {reservations.map(res => (
                    <div key={res._id} className="mini-card" style={{cursor: 'default'}}>
                        <div style={{width: '100%'}}>
                            <strong>
                                {res.coworkingSpace ? res.coworkingSpace.name : "Loading..."}
                            </strong>
                            
                            {/* TOGGLE BETWEEN VIEW AND EDIT MODE */}
                            {editingReservationId === res._id ? (
                                <div style={{marginTop: 5, display:'flex', alignItems:'center', gap: 5}}>
                                    <input 
                                        type="date" 
                                        value={editDate}
                                        onChange={(e) => setEditDate(e.target.value)}
                                        style={{padding: '4px', borderRadius: '4px', border: '1px solid #ccc', width: '100%'}}
                                    />
                                </div>
                            ) : (
                                <div style={{fontSize: '0.9rem', marginTop: 4}}>
                                    {res.reservationDate ? res.reservationDate.split('T')[0] : ''}
                                </div>
                            )}
                        </div>

                        <div style={{display:'flex', gap:2, marginLeft: 10}}>
                             {editingReservationId === res._id ? (
                                <>
                                    <button className="icon-btn" onClick={() => saveEdit(res._id)} title="Save">✅</button>
                                    <button className="icon-btn" onClick={cancelEdit} title="Cancel">❌</button>
                                </>
                             ) : (
                                <>
                                    <button className="icon-btn" onClick={() => startEdit(res)} title="Edit">✏️</button>
                                    <button className="icon-btn" onClick={() => handleDelete(res._id)} style={{color: '#ef4444'}} title="Delete">🗑️</button>
                                </>
                             )}
                        </div>
                    </div>
                    ))}
                </>
                )}

                {/* MY FAVORITES */}
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
        )}
      </div>
    </div>
  );
};

export default Dashboard;