import React, { useState, useEffect } from 'react';
import { socket } from '../socket';
import './GameView.css';

export const GameView = ({ gameState, clues }) => {
  const [turn, setTurn] = useState(null);
  const [myClue, setMyClue] = useState('');

  useEffect(() => {
    // Establece el turno inicial y escucha las actualizaciones
    if (gameState && gameState.alivePlayers && gameState.alivePlayers.length > 0) {
      const firstPlayer = gameState.alivePlayers[0];
      setTurn({ playerName: firstPlayer.name, round: gameState.round || 1 });
    }
    const handleNextTurn = (data) => setTurn(data);
    socket.on('nextTurn', handleNextTurn);
    return () => socket.off('nextTurn', handleNextTurn);
  }, [gameState]);

  if (!gameState || !turn || !gameState.alivePlayers) {
    return <div>Cargando partida...</div>;
  }

  const myPlayerId = sessionStorage.getItem('playerId');
  const isAlive = gameState.alivePlayers.some(p => p.id === myPlayerId);
  const isMyTurn = isAlive && turn.playerName === gameState.players.find(p => p.id === myPlayerId)?.name;

  const handleSendClue = () => {
    if (myClue.trim()) {
      socket.emit('submitClue', { roomCode: gameState.roomCode, clue: myClue, playerId: myPlayerId });
    }
    setMyClue('');
  };
  
  const handleVote = (votedPlayerId) => {
    socket.emit('submitVote', { roomCode: gameState.roomCode, votedPlayerId, playerId: myPlayerId });
  };

  // --- Renderizado ---

  const renderInGame = () => (
    <>
      <div className="game-info">
        <span>Ronda {turn.round}</span>
        <span>Turno de: <strong className="turn-player">{turn.playerName}</strong></span>
      </div>

      <div className="role-info">
        <h3>Tu Rol: <span className="role-name">{gameState.role}</span></h3>
        {gameState.role === 'Solucionador' ? (
          <div className="secret-word-container">
            <span className="secret-word-label">La palabra secreta es:</span>
            <strong className="secret-word">{gameState.word}</strong>
          </div>
        ) : (
          <h4>Engaña a los demás y no dejes que descubran la palabra.</h4>
        )}
      </div>
      
      <div className="clue-history">
        <ul>
          {clues.map((c, i) => (
            <li key={i}>
              <strong style={{ color: gameState.players.find(p => p.name === c.playerName)?.color || 'white' }}>{c.playerName}:</strong> {c.clue}
            </li>
          ))}
        </ul>
      </div>

      {!isAlive && <p><strong>Has sido eliminado. Eres un espectador.</strong></p>}
      {isMyTurn && (
        <div className="input-area">
          <input type="text" value={myClue} onChange={(e) => setMyClue(e.target.value)} placeholder="Escribe tu pista..."/>
          <button onClick={handleSendClue}>Enviar</button>
        </div>
        
      )}
    </>
  );

  const renderVoting = (title, playersToVote) => (
    <div>
      <h2>{title}</h2>
      {isAlive ? (
        <ul>
          {playersToVote.map(player => (
            player.id !== myPlayerId && (
              <li key={player.id}>{player.name} <button onClick={() => handleVote(player.id)}>Votar</button></li>
            )
          ))}
        </ul>
      ) : <p><strong>Has sido eliminado. Esperando a que los demás voten...</strong></p>}
    </div>
  );

  let whiteboardContent;
  if (gameState.phase === 'IN_GAME') {
    whiteboardContent = renderInGame();
  } else if (gameState.phase === 'VOTING') {
    whiteboardContent = renderVoting('¡A Votar! ¿Quién es el impostor?', gameState.alivePlayers);
  } else if (gameState.phase === 'TIE_VOTE') {
    const tiedPlayers = gameState.alivePlayers.filter(p => gameState.tiedPlayers.includes(p.name));
    whiteboardContent = renderVoting('¡Empate! Votación de Desempate', tiedPlayers);
  }

  return (
    <div className="game-container">
      <div className="whiteboard">{whiteboardContent}</div>
      <div className="player-bar">
        {gameState.players.map(player => {
          const isPlayerAlive = gameState.alivePlayers.some(p => p.id === player.id);
          const isPlayerTurn = isPlayerAlive && turn.playerName === player.name;
          return (
            <div 
              key={player.id} 
              className={`player-card ${!isPlayerAlive ? 'eliminated' : ''} ${isPlayerTurn ? 'active-turn' : ''}`}
              style={{ borderBottomColor: player.color }}
            >
              <div className="player-name">{player.name}</div>
              <div className="player-role">{player.id === myPlayerId ? `(${gameState.role})` : ''}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};