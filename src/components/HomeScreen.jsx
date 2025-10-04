import React, { useState } from 'react';
import './HomeScreen.css';

export const HomeScreen = ({ onStart }) => {
  const [nickname, setNickname] = useState('');

  const handleStartClick = () => {
    if (nickname.trim()) {
      onStart(nickname);
    }
  };

  return (
    <div className="home-container">
      {/* Eliminamos el <h3>LUUUDIC</h3> de aquí */}
      
      {/* Añadimos la clase 'main-title' para cambiar la fuente */}
      <h1 className="main-title">EL</h1>
            <h1 className="main-title">Impostor</h1>

      
      <div className="start-form">
        <input 
          type="text" 
          placeholder="Ingresa Tu Nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength="12"
        />
        {/* Añadimos la clase 'start-button' para hacerlo más grande */}
        <button className="start-button" onClick={handleStartClick}>
          ¡Click Para Comenzar!
        </button>
      </div>

      <div className="soon-buttons">
        {/* El botón principal ahora está separado */}
        <button disabled className="new-games-button">¡Nuevos Minijuegos! (Próximamente)</button>
        
        {/* Los otros dos botones están agrupados */}
        <div className="account-buttons">
          <button disabled>Crear Una Cuenta (Próximamente)</button>
          <button disabled>Iniciar Sesión (Próximamente)</button>
        </div>
      </div>
    </div>
  );
};