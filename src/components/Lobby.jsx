import React from 'react';
import { socket } from '../socket';
import './Lobby.css';

export const Lobby = ({ roomState }) => {
  if (!roomState) return <div>Cargando lobby...</div>;

  const myPlayerId = sessionStorage.getItem('playerId');
  const isHost = myPlayerId === roomState.hostId;

  const handleStartGame = () => {
    // --- LÍNEA MODIFICADA ---
    // Ahora enviamos nuestro playerId para que el backend nos verifique
    socket.emit('startGame', { roomCode: roomState.code, playerId: myPlayerId });
  };
  
  const handleSubcategoryChange = (mainCategory, subcategory) => {
    const newSelection = JSON.parse(JSON.stringify(roomState.settings.selectedCategories));
    newSelection[mainCategory][subcategory] = !newSelection[mainCategory][subcategory];
    socket.emit('updateSettings', { 
      roomCode: roomState.code, 
      newSettings: { selectedCategories: newSelection }
    });
  };

  const sortedPlayers = [...roomState.players].sort((a, b) => b.score - a.score);

  return (
    <div className="lobby-container">
      <div className="room-code-box">
        <span className="code-label">CÓDIGO DE LA SALA:</span>
        <span className="room-code">{roomState.code}</span>
      </div>
      
      <div className="lobby-body">
        {isHost && roomState.wordStructure && (
          <div className="settings-box">
            <h4>Seleccionar Categorías:</h4>
            {Object.keys(roomState.wordStructure).map(mainCategory => (
              <div key={mainCategory} className="main-category">
                <h5>{mainCategory}</h5>
                <div className="subcategory-filters">
                  {Object.keys(roomState.wordStructure[mainCategory]).map(subcategory => (
                    <label key={subcategory} className="category-label">
                      <input 
                        type="checkbox"
                        checked={roomState.settings.selectedCategories[mainCategory]?.[subcategory] || false}
                        onChange={() => handleSubcategoryChange(mainCategory, subcategory)}
                      />
                      {subcategory}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- NUEVO CONTENEDOR PARA LA DERECHA --- */}
        <div className="player-section">
          <div className="player-list">
            <h3>Jugadores Conectados ({sortedPlayers.length}):</h3>
            <ul>
              {sortedPlayers.map(player => (
                <li key={player.id} className="player-item">
                  <span className="player-name">{player.name} {player.id === roomState.hostId ? '👑' : ''}</span>
                  <span className="player-score">{player.score} puntos</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* MOVIMOS EL BOTÓN AQUÍ ADENTRO */}
          {isHost && (
            <button className="start-game-button" onClick={handleStartGame}>
              ¡INICIAR PARTIDA!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};