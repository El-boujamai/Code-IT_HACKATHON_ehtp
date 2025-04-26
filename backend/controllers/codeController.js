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
    // Simplified: write to a file that Unity will read
    // In a real implementation, you would use WebSockets or a dedicated API
    await fs.writeFile(
      path.join(__dirname, '../temp/current-visualization.json'),
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
    
    // In a real app, you would save to a database
    await fs.writeFile(
      path.join(__dirname, `../saved-visualizations/${name}.json`),
      JSON.stringify({ code, name, description, date: new Date() }, null, 2)
    );
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving visualization:', error);
    res.status(500).json({ error: 'Failed to save visualization' });
  }
};