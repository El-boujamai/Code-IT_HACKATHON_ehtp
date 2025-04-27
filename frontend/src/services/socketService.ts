import { io, Socket } from 'socket.io-client';

import { create } from 'zustand'; // or whatever state management you're using

// Define types
export interface Vector3Data {
  x: number;
  y: number;
  z: number;
}

export interface VisualizationElement {
  id: string;
  type: string;
  label: string;
  position: Vector3Data;
  state: string;
  color: string;
}

export interface VisualizationData {
  sessionId: string;
  codeId: string;
  elements: VisualizationElement[];
  cameraPosition: string;
  userInteraction: string;
}

// Store for visualization state
interface VisualizationStore {
  currentVisualization: VisualizationData | null;
  isConnectedToUnity: boolean;
  setVisualization: (data: VisualizationData) => void;
  setUnityConnection: (connected: boolean) => void;
}

export const useVisualizationStore = create<VisualizationStore>((set) => ({
  currentVisualization: null,
  isConnectedToUnity: false,
  setVisualization: (data) => set({ currentVisualization: data }),
  setUnityConnection: (connected) => set({ isConnectedToUnity: connected }),
}));

// Socket connection logic
let socket: Socket | null = null;

export function connectToSocket(): Socket {
  // Replace with your actual socket server URL
  const socket: Socket = io('http://localhost:5000', {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });

  socket.on('connect', () => {
    console.log('Connected to socket server');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from socket server');
  });

  socket.on('error', (error: any) => {
    console.error('Socket error:', error);
  });

   // Listen for visualization updates from Unity
   socket.on('unity_visualization_update', (data: VisualizationData) => {
    console.log('Received visualization update from Unity:', data);
    useVisualizationStore.getState().setVisualization(data);
  });


  return socket;
}
export function sendCodeForVisualization(code: string) {
  if (!socket) {
    console.error('Socket not connected');
    return;
  }
  
  socket.emit('visualize_code', { code });
}