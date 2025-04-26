import { io } from 'socket.io-client';

const URL = 'http://localhost:3001'; // L'URL de votre serveur backend

export const socket = io(URL, {
  autoConnect: true // Se connecter automatiquement au serveur
});

// Vous pouvez ajouter ici des gestionnaires d'événements globaux pour le socket côté client
socket.on('connect', () => {
  console.log('Connecté au serveur Socket.IO');
});

socket.on('disconnect', () => {
  console.log('Déconnecté du serveur Socket.IO');
});

socket.on('code-to-unity', (code) => {
  console.log('Code reçu du backend pour Unity:', code);
  // Ici, vous pourriez mettre à jour l'état de votre application frontend
  // pour indiquer que le code a été transmis à Unity
});

socket.on('data-to-frontend', (data) => {
  console.log('Données reçues de Unity via le backend:', data);
  // Ici, vous mettriez à jour l'état de votre application frontend
  // pour afficher les informations provenant de Unity
});