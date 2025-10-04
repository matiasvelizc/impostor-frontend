import { io } from 'socket.io-client';

// La URL de tu servidor backend que está corriendo en el puerto 4000
const URL = 'http://localhost:4000';

export const socket = io(URL);