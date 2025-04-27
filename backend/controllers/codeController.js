import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import WebSocket from 'ws';
import { fileURLToPath } from 'url';
import { parseCode } from '../utils/parseCode.js';

// Manually define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// URL for the Unity WebSocket server
const UNITY_WS_URL = 'ws://localhost:5000/unity';
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

// Modify the processCodeForVisualization to use the parseCode function
export function processCodeForVisualization(code) {
  try {
    // Use the parseCode function to parse the provided code
    const parsedCode = parseCode(code); // Get parsed data from acorn parser

    return {
      codeStructure: parsedCode,
      visualElements: [
        { type: 'text', content: 'Code Analysis Result', position: [0, 2, 0] },
        { type: 'container', content: 'Variables', position: [-3, 0, 0] },
        { type: 'container', content: 'Arrays', position: [0, 0, 0] },
        { type: 'container', content: 'Loops', position: [3, 0, 0] }
      ]
    };
  } catch (error) {
    console.error('Error processing code for visualization:', error);
    throw new Error('Failed to process code for visualization');
  }
}

// Send parsed visualization data to the VR environment or save it
export async function sendToVREnvironment(data) {
  try {
    // Simplified: write to a file that Unity will read
    // In a real implementation, you would use WebSockets or a dedicated API
    await fs.writeFile(
      join(__dirname, '../temp/current-visualization.json'),
      JSON.stringify(data, null, 2)
    );

    // Log to ensure the object is populated correctly
    console.log('Visualization Data:', JSON.stringify(data, null, 2));
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
}

// Save visualization to a file
export async function saveVisualization(req, res) {
  try {
    const { code, name, description } = req.body;

    // Parse the code first before saving
    const parsedData = processCodeForVisualization(code); // This gives you the parsed code data

    // In a real app, you would save to a database or a more structured system
    await fs.writeFile(
      join(__dirname, `../saved-visualizations/${name}.json`),
      JSON.stringify({ code, name, description, parsedData, date: new Date() }, null, 2)
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving visualization:', error);
    res.status(500).json({ error: 'Failed to save visualization' });
  }
}
