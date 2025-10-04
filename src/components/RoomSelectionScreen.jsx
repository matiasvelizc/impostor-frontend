import React, { useState } from 'react';
import { socket } from '../socket';
import './RoomSelectionScreen.css';

export const RoomSelectionScreen = ({ nickname }) => {
  const [roomCode, setRoomCode] = useState('');
  const [scoreToWin, setScoreToWin] = useState('50');

// En RoomSelectionScreen.jsx
  const handleCreateRoom = () => {
    const playerId = sessionStorage.getItem('playerId'); // Obtenemos el ID
    const settings = { themes: ['Cine'], scoreToWin: 50 };
    // Lo enviamos al backend
    socket.emit('createRoom', { playerName: nickname, settings, playerId });
  };

  const handleJoinRoom = () => {
    if (roomCode.trim()) {
      const playerId = sessionStorage.getItem('playerId'); // Obtenemos el ID
      // Lo enviamos al backend
      socket.emit('joinRoom', { playerName: nickname, roomCode: roomCode.toUpperCase(), playerId });
    }
  };

  return (
    <div className="selection-container">
      <h1 className="main-title">Impostor</h1>
      <div className="selection-actions">
        <button onClick={handleCreateRoom}>Crear Lobby</button>
        <button disabled>Partida Pública (Próximamente)</button>
      </div>
      <div className="join-lobby-box">
        <h2 style={{color: 'white', textShadow: 'none'}}>¡Unirte a Lobby!</h2>
        <input type="text" placeholder="Escribir Código" value={roomCode} onChange={(e) => setRoomCode(e.target.value)} maxLength="5" />
        <button onClick={handleJoinRoom}>Unirse</button>
      </div>
    </div>
  );
};