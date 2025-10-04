import React, { useEffect } from 'react';
import { socket } from '../socket';

export const RoundResult = ({ result, roomState }) => {
  // --- LÓGICA DE HOST CORREGIDA ---
  // Obtenemos nuestro ID permanente guardado en el navegador
  const myPlayerId = sessionStorage.getItem('playerId');
  // Comparamos nuestro ID permanente con el ID permanente del anfitrión de la sala
  const isHost = myPlayerId === roomState.hostId;
  // --- FIN DE LA CORRECCIÓN ---

  const handleReturnToLobby = () => {
    socket.emit('returnToLobby', { roomCode: roomState.code });
  };

  // Lógica para el regreso automático al lobby (sin cambios)
  useEffect(() => {
    const isGameOver = result.message.includes('Ganan') || result.message.includes('ganador final');
    if (isHost && isGameOver && !result.message.includes('ganador final')) {
      const timer = setTimeout(() => {
        handleReturnToLobby();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isHost, result.message, handleReturnToLobby]); // Se añade handleReturnToLobby a las dependencias

  if (!result || !roomState) {
    return <div>Cargando resultados...</div>;
  }

  const sortedPlayers = result.players ? [...result.players].sort((a, b) => b.score - a.score) : [];

  return (
    <div style={{ border: '2px solid #ccc', padding: '20px', textAlign: 'center' }}>
      <h2>Resultado</h2>
      <p style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
        {result.message}
      </p>

      <h4>Puntuaciones:</h4>
      <ul style={{ padding: 0 }}>
        {sortedPlayers.map(player => (
          <li key={player.id} style={{ listStyle: 'none', fontSize: '1.1em', margin: '5px 0' }}>
            {player.name}: {player.score} puntos
          </li>
        ))}
      </ul>
      
      {/* El botón para volver manualmente solo aparece si el CAMPEONATO ha terminado */}
      {isHost && result.message.includes('ganador final') && (
        <button onClick={handleReturnToLobby} style={{ marginTop: '20px' }}>
          Volver al Lobby (Reiniciar Puntos)
        </button>
      )}
    </div>
  );
};