import React, { useState, useEffect, useCallback } from 'react';
import { socket } from './socket';
import { HomeScreen } from './components/HomeScreen';
import { RoomSelectionScreen } from './components/RoomSelectionScreen';
import { Lobby } from './components/Lobby';
import { GameView } from './components/GameView';
import { RoundResult } from './components/RoundResult';

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [nickname, setNickname] = useState('');
  const [roomState, setRoomState] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [clues, setClues] = useState([]);

  useEffect(() => {
    if (!sessionStorage.getItem('playerId')) {
      sessionStorage.setItem('playerId', `player_${Math.random().toString(36).substring(2, 9)}`);
    }
  }, []);

  const onUpdate = useCallback((data) => {
    const newRoomState = data.roomState || data;
    setRoomState(newRoomState);
    if (!newRoomState.gameState) {
      setCurrentScreen('lobby');
      setGameState(null);
      setRoundResult(null);
    }
  }, []);

  const onGameStarted = useCallback((data) => {
    setGameState(data);
    setClues([]);
    setCurrentScreen('game');
  }, []);

  const onNewRound = useCallback((data) => {
    setRoundResult(null);
    setGameState(prev => ({ ...prev, phase: 'IN_GAME', alivePlayers: data.alivePlayers }));
    setCurrentScreen('game');
  }, []);
  
  const onGameOver = useCallback((data) => {
    const message = data.winner.includes('ganador final') ? data.winner : `¡Partida Terminada! Ganan: ${data.winner}`;
    setRoundResult({ message, players: data.players });
    setGameState(null);
    setCurrentScreen('result');
  }, []);

  useEffect(() => {
    const onConnect = () => console.log('Conectado');
    const onDisconnect = () => console.log('Desconectado');
    const onError = (data) => alert(`Error: ${data.message}`);
    const onNewClue = (data) => setClues(prev => [...prev, data]);
    const onStartVoting = (data) => setGameState(prev => ({ ...prev, phase: 'VOTING', players: data.players, alivePlayers: data.players }));
    const onVoteTie = (data) => setGameState(prev => ({ ...prev, phase: 'TIE_VOTE', tiedPlayers: data.tiedPlayers }));
    const onRoundResult = (data) => {
      setRoundResult(data);
      setCurrentScreen('result');
    };

    const events = {
      connect: onConnect, disconnect: onDisconnect, error: onError,
      roomCreated: onUpdate, updateRoomState: onUpdate,
      gameStarted: onGameStarted, newClue: onNewClue,
      startVoting: onStartVoting, voteTie: onVoteTie,
      roundResult: onRoundResult, gameOver: onGameOver, newRound: onNewRound,
    };

    for (const event in events) { socket.on(event, events[event]); }
    return () => { for (const event in events) { socket.off(event, events[event]); } };
  }, [onUpdate, onGameStarted, onNewRound, onGameOver]);

  const handleStart = (name) => {
    setNickname(name);
    setCurrentScreen('room_selection');
  };

  const renderContent = () => {
    switch (currentScreen) {
      case 'home': return <HomeScreen onStart={handleStart} />;
      case 'room_selection': return <RoomSelectionScreen nickname={nickname} />;
      case 'lobby': return <Lobby roomState={roomState} />;
      case 'game': return <GameView gameState={gameState} clues={clues} />;
      case 'result': return <RoundResult result={roundResult} roomState={roomState} />;
      default: return <HomeScreen onStart={handleStart} />;
    }
  };

  return (
    <div className="App">
      <header className="header"><h1 className="header-brand">LUUUDIC</h1><h2 className="header-sub">MINIGAMES</h2></header>
      {renderContent()}
      <footer className="footer">© 2025 LUUUDIC. TODOS LOS DERECHOS RESERVADOS.</footer>
    </div>
  );
}

export default App;