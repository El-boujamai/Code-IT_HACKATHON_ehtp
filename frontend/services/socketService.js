import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export const connectToSocket = () => {
  const socket = io(SOCKET_URL);
  
  socket.on('connect', () => {
    console.log('Connected to server');
  });
  
  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });
  
  socket.on('vr_ready', (data) => {
    console.log('VR environment is ready:', data);
    alert('VR environment is ready! Put on your headset to view the visualization.');
  });
  
  socket.on('error', (error) => {
    console.error('Socket error:', error);
    alert(`Error: ${error.message}`);
  });
  
  return socket;
};
