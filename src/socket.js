import { io } from 'socket.io-client';

// Este código le dice a la aplicación:
// "Intenta usar la variable de entorno VITE_BACKEND_URL. 
// Si no existe (porque estamos en local), usa 'http://localhost:4000' en su lugar."
const URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

export const socket = io(URL, {
    // Opciones para mejorar la estabilidad de la conexión
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

console.log("Conectando al backend en:", URL); // Un log útil para depurar