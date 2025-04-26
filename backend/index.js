const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const codeController = require('./controllers/codeController');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Default Vite dev server port
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/code', require('./routes/codeRoutes'));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('visualize_code', (data) => {
    console.log('Received code for visualization');
    // Process code and prepare visualization data
    const visualizationData = codeController.processCodeForVisualization(data.code);
    socket.emit('visualization_data', visualizationData);
  });
  
  socket.on('launch_vr', (data) => {
    console.log('Received request to launch VR');
    // Send data to Unity VR application
    codeController.sendToVREnvironment(data)
      .then(() => {
        socket.emit('vr_ready', { status: 'success' });
      })
      .catch(error => {
        socket.emit('error', { message: error.message });
      });
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// backend/controllers/codeController.js
const fs = require('fs').promises;
const path = require('path');
const WebSocket = require('ws');

// URL for the Unity WebSocket server
const UNITY_WS_URL = 'ws://localhost:8080';
let unitySocket = null;

// Connect to Unity WebSocket server
const connectToUnity = () => {
  if (!unitySocket || unitySocket.readyState !== WebSocket.OPEN) {
    unitySocket = new WebSocket(UNITY_WS_URL);
    
    unitySocket.on('open', () => {
      console.log('Connected to Unity WebSocket server');
    });
    
    unitySocket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
    
    unitySocket.on('close', () => {
      console.log('Disconnected from Unity WebSocket server');
      unitySocket = null;
    });
  }
  
  return unitySocket;
};

exports.processCodeForVisualization = (code) => {
  // In a real implementation, this would perform deeper code analysis
  // For hackathon purposes, we'll just do basic extraction
  
  const hasArrays = code.includes('[') && code.includes(']');
  const hasLoops = code.includes('for') || code.includes('while');
  const hasConditionals = code.includes('if');
  const hasFunctions = code.includes('function');
  
  return {
    codeStructure: {
      hasArrays,
      hasLoops,
      hasConditionals,
      hasFunctions
    },
    visualElements: [
      { type: 'text', content: 'Code Analysis Result', position: [0, 2, 0] },
      { type: 'container', content: 'Variables', position: [-3, 0, 0] },
      { type: 'container', content: 'Arrays', position: [0, 0, 0] },
      { type: 'container', content: 'Loops', position: [3, 0, 0] }
    ]
  };
};

exports.sendToVREnvironment = async (data) => {
  try {
    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, '../temp');
    try {
      await fs.access(tempDir);
    } catch (e) {
      await fs.mkdir(tempDir, { recursive: true });
    }
    
    // Simplified: write to a file that Unity will read
    await fs.writeFile(
      path.join(tempDir, 'current-visualization.json'),
      JSON.stringify(data, null, 2)
    );
    
    // Try sending via WebSocket if available
    try {
      const socket = connectToUnity();
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'visualization_data',
          data
        }));
      }
    } catch (wsError) {
      console.warn('Could not send data via WebSocket:', wsError.message);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error sending data to VR environment:', error);
    throw new Error('Failed to send data to VR environment');
  }
};

exports.saveVisualization = async (req, res) => {
  try {
    const { code, name, description } = req.body;
    
    // Create saved-visualizations directory if it doesn't exist
    const savedDir = path.join(__dirname, '../saved-visualizations');
    try {
      await fs.access(savedDir);
    } catch (e) {
      await fs.mkdir(savedDir, { recursive: true });
    }
    
    // In a real app, you would save to a database
    await fs.writeFile(
      path.join(savedDir, `${name}.json`),
      JSON.stringify({ code, name, description, date: new Date() }, null, 2)
    );
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving visualization:', error);
    res.status(500).json({ error: 'Failed to save visualization' });
  }
};

// backend/routes/codeRoutes.js
const express = require('express');
const codeController = require('../controllers/codeController');

const router = express.Router();

router.post('/visualize', (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }
    
    const visualization = codeController.processCodeForVisualization(code);
    res.status(200).json(visualization);
  } catch (error) {
    console.error('Error processing code:', error);
    res.status(500).json({ error: 'Failed to process code' });
  }
});

router.post('/save', codeController.saveVisualization);

module.exports = router;