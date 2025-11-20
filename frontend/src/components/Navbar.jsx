import React from 'react';

const Navbar = ({ user, toggleSidebar, sidebarMode, showSidebar, logout }) => {
  return (
    <div className="top-navbar">
      <div className="nav-brand">Co-Working Space</div>
      <div className="nav-controls">
        <span>Hi, {user?.name}</span>
        
        {/* Favorites Toggle */}
        <button 
          className="nav-heart-btn" 
          onClick={() => toggleSidebar('favorites')} 
          title="Show Favorites"
        >
          {sidebarMode === 'favorites' && showSidebar ? '❤️' : '🤍'}
        </button>

        {/* Reserves Toggle */}
        <button 
          className="toggle-btn" 
          onClick={() => toggleSidebar('reserves')}
          style={{ background: sidebarMode === 'reserves' && showSidebar ? '#334155' : '#1e293b' }}
        >
          {sidebarMode === 'reserves' && showSidebar ? 'Hide Reserves' : 'Show Reserves'}
        </button>
        
        <button className="btn-logout" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;