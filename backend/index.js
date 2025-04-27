const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const WebSocket = require('ws');  // Add this for raw WebSockets
const codeController = require('./controllers/codeController');

const app = express();
const server = http.createServer(app);

// Socket.io for web client communication
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
  }
});

// Raw WebSocket server for Unity communication
const wss = new WebSocket.Server({ noServer: true });
let unityClients = new Set();

const webClients = new Map();


// Handle upgrade for WebSocket connections
server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
  
  if (pathname === '/unity') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Handle WebSocket connections from Unity
wss.on('connection', (ws) => {
  console.log('Unity client connected');
  unityClients.add(ws);
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Message type from Unity:', data.type);
      
      // Handle registration messages
      if (data.type === 'register' && data.client === 'unity') {
        console.log(`Unity client registered on platform ${data.platform}`);
      }
      
      // Handle visualization updates from Unity and forward to web clients
      if (data.type === 'visualization_update') {
        console.log('Received visualization update from Unity');
        console.log('Data:', data.data);
        
        // Forward to all connected web clients
        webClients.forEach((client) => {
          client.emit('unity_visualization_update', data.data);
        });
      }
    } catch (e) {
      console.error('Error parsing message from Unity:', e);
    }
  });

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/code', require('./routes/codeRoutes'));

// Socket.io connection for web clients
io.on('connection', (socket) => {
  console.log('Web client connected');
  
  socket.on('visualize_code', (data) => {
    console.log('Received code for visualization');
    // Process code and prepare visualization data
    const visualizationData = codeController.processCodeForVisualization(data.code);
    socket.emit('visualization_data', visualizationData);
    
    // Forward to Unity clients
    unityClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'visualization_data',
          data: visualizationData
        }));
      }
    });
  });
  
  socket.on('launch_vr', (data) => {
    console.log('Received request to launch VR');
    // Send data to Unity VR application via our WebSocket connection
    const success = Array.from(unityClients).some(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'launch_vr',
          data: data
        }));
        return true;
      }
      return false;
    });
    
    if (success) {
      socket.emit('vr_ready', { status: 'success' });
    } else {
      socket.emit('error', { message: 'No VR client connected' });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Web client disconnected');
  });
  
});

});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});