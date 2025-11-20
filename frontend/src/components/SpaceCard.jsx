import React from 'react';

const SpaceCard = ({ space, isFavorite, toggleFavorite, onReserve }) => {
  return (
    <div className="wide-card">
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
            className={`card-fav-btn ${isFavorite ? 'active' : ''}`}
            onClick={() => toggleFavorite(space.id)}
            title="Add to Favorites"
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        </div>
        <button className="btn-primary" onClick={() => onReserve(space)}>Reserve</button>
      </div>
    </div>
  );
};

export default SpaceCard;