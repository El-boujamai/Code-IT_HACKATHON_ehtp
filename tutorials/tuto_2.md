# CodeVision VR Project Setup Guide

I'll help you organize your codebase using Vite for the frontend with React Router v7. Here's how to structure your files and link between your frontend, backend, and Unity components.

## Frontend Setup (React + Vite)

First, let's set up your Vite project structure:

1. Create your Vite project:
```bash
npm create vite@latest frontend --template react
cd frontend
npm install
```

2. Install necessary dependencies:
```bash
npm install react-router-dom@7 @monaco-editor/react socket.io-client @react-three/fiber @react-three/drei three
```

3. Frontend directory structure:
```
frontend/
├── src/
│   ├── components/
│   │   ├── CodeEditor.jsx
│   │   ├── Visualization.jsx
│   │   ├── ConceptLibrary.jsx
│   │   ├── Navbar.jsx
│   │   └── visualizations/
│   │       ├── ArrayVisualization.jsx
│   │       ├── LoopVisualization.jsx
│   │       └── VariableVisualization.jsx
│   ├── services/
│   │   └── socketService.js
│   ├── utils/
│   │   └── codeParser.js
│   ├── App.jsx
│   ├── main.jsx
│   └── App.css
├── public/
├── index.html
└── package.json
```

4. Here's how to implement your React components:

```javascript
// src/components/visualizations/ArrayVisualization.jsx
import React from 'react';
import { Box, Text } from '@react-three/drei';

function ArrayVisualization({ array, position }) {
  return (
    <group position={position}>
      {array.elements.map((element, index) => (
        <group key={index} position={[index * 1.2, 0, 0]}>
          <Box args={[1, 1, 1]} position={[0, 0, 0]}>
            <meshStandardMaterial color="orange" />
          </Box>
          <Text 
            position={[0, 0, 0.6]} 
            fontSize={0.5}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {element}
          </Text>
        </group>
      ))}
      <Text 
        position={[(array.elements.length - 1) * 0.6, -1.5, 0]} 
        fontSize={0.5}
        color="white"
        anchorX="center"
      >
        {array.name} [length: {array.elements.length}]
      </Text>
    </group>
  );
}

export default ArrayVisualization;

// src/components/visualizations/LoopVisualization.jsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Text, Line } from '@react-three/drei';

function LoopVisualization({ loop, position }) {
  const rotationRef = useRef();
  
  useFrame(({ clock }) => {
    if (rotationRef.current) {
      rotationRef.current.rotation.y = clock.getElapsedTime() * 0.5;
    }
  });
  
  return (
    <group position={position}>
      <group ref={rotationRef}>
        <Line 
          points={[[-1, -1, 0], [1, -1, 0], [1, 1, 0], [-1, 1, 0], [-1, -1, 0]]} 
          color="cyan" 
          lineWidth={2}
        />
        <Box args={[0.5, 0.5, 0.5]} position={[0, 0, 0]}>
          <meshStandardMaterial color="blue" />
        </Box>
      </group>
      <Text 
        position={[0, -1.5, 0]} 
        fontSize={0.5}
        color="white"
        anchorX="center"
      >
        {loop.type} loop: {loop.variable}
      </Text>
    </group>
  );
}

export default LoopVisualization;

// src/components/visualizations/VariableVisualization.jsx
import React from 'react';
import { Box, Text } from '@react-three/drei';

function VariableVisualization({ variable, position }) {
  // Color based on type
  const getColor = () => {
    switch(variable.type) {
      case 'number': return 'blue';
      case 'string': return 'green';
      case 'boolean': return 'red';
      default: return 'gray';
    }
  };
  
  return (
    <group position={position}>
      <Box args={[1.5, 1, 0.5]} position={[0, 0, 0]}>
        <meshStandardMaterial color={getColor()} />
      </Box>
      <Text 
        position={[0, 0.2, 0.3]} 
        fontSize={0.3}
        color="white"
        anchorX="center"
      >
        {variable.name}
      </Text>
      <Text 
        position={[0, -0.2, 0.3]} 
        fontSize={0.3}
        color="white"
        anchorX="center"
      >
        {variable.value}
      </Text>
    </group>
  );
}

export default VariableVisualization;

```

```javascript
// src/components/CodeEditor.jsx
import React from 'react';
import Editor from '@monaco-editor/react';

function CodeEditor({ code, onCodeChange }) {
  const handleEditorChange = (value) => {
    onCodeChange(value);
  };

  return (
    <div className="code-editor">
      <h2>Code Editor</h2>
      <Editor
        height="70vh"
        defaultLanguage="javascript"
        value={code}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          automaticLayout: true,
        }}
      />
    </div>
  );
}

export default CodeEditor;

// src/components/Visualization.jsx
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ArrayVisualization from './visualizations/ArrayVisualization';
import LoopVisualization from './visualizations/LoopVisualization';
import VariableVisualization from './visualizations/VariableVisualization';

function Visualization({ data }) {
  if (!data) {
    return <div className="visualization-placeholder">No code to visualize yet.</div>;
  }

  return (
    <div className="visualization-container">
      <h2>Code Visualization</h2>
      <div className="visualization-canvas">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <OrbitControls />
          {data.variables && data.variables.map((variable, index) => (
            <VariableVisualization 
              key={`var-${index}`}
              variable={variable} 
              position={[-5 + (index * 2), 2, 0]} 
            />
          ))}
          {data.arrays && data.arrays.map((array, index) => (
            <ArrayVisualization 
              key={`array-${index}`}
              array={array} 
              position={[-5 + (index * 3), 0, 0]} 
            />
          ))}
          {data.loops && data.loops.map((loop, index) => (
            <LoopVisualization 
              key={`loop-${index}`}
              loop={loop} 
              position={[0, -3, 0]} 
            />
          ))}
        </Canvas>
      </div>
      <div className="code-structure">
        <h3>Detected Code Elements:</h3>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
}

export default Visualization;

// src/components/ConceptLibrary.jsx
import React from 'react';

function ConceptLibrary() {
  return (
    <div className="concept-library">
      <h2>Programming Concepts Library</h2>
      <div className="concept-cards">
        <div className="concept-card">
          <h3>Variables</h3>
          <p>Storage locations with names that hold values in programming.</p>
        </div>
        <div className="concept-card">
          <h3>Arrays</h3>
          <p>Collections of elements stored at contiguous memory locations.</p>
        </div>
        <div className="concept-card">
          <h3>Loops</h3>
          <p>Control structures that repeat a block of code until a condition is met.</p>
        </div>
        <div className="concept-card">
          <h3>Functions</h3>
          <p>Reusable blocks of code that perform specific tasks.</p>
        </div>
      </div>
    </div>
  );
}

export default ConceptLibrary;

// src/components/Navbar.jsx
import React from 'react';

function Navbar({ activeTab, setActiveTab }) {
  return (
    <nav className="navbar">
      <div className="logo">CodeVision VR</div>
      <div className="nav-tabs">
        <button 
          className={activeTab === 'editor' ? 'active' : ''} 
          onClick={() => setActiveTab('editor')}
        >
          Code Editor
        </button>
        <button 
          className={activeTab === 'visualization' ? 'active' : ''} 
          onClick={() => setActiveTab('visualization')}
        >
          Visualization
        </button>
        <button 
          className={activeTab === 'library' ? 'active' : ''} 
          onClick={() => setActiveTab('library')}
        >
          Concept Library
        </button>
      </div>
    </nav>
  );
}

export default Navbar;

```

```javascript
// src/services/socketService.js
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

// src/utils/codeParser.js
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

export const parseCode = (code) => {
  try {
    const ast = acorn.parse(code, { ecmaVersion: 2020 });
    
    const result = {
      variables: [],
      arrays: [],
      loops: [],
      functions: [],
      conditionals: []
    };
    
    // Extract variables
    walk.simple(ast, {
      VariableDeclarator(node) {
        const varName = node.id.name;
        let value = null;
        
        if (node.init) {
          if (node.init.type === 'Literal') {
            value = node.init.value;
          } else if (node.init.type === 'ArrayExpression') {
            const arrayElements = node.init.elements.map(el => 
              el.type === 'Literal' ? el.value : 'complex'
            );
            
            result.arrays.push({
              name: varName,
              elements: arrayElements,
              length: arrayElements.length
            });
            return;
          }
        }
        
        result.variables.push({
          name: varName,
          value: value,
          type: typeof value
        });
      }
    });
    
    // Extract loops
    walk.simple(ast, {
      ForStatement(node) {
        let initVar = '';
        let condition = '';
        let update = '';
        
        if (node.init && node.init.type === 'VariableDeclaration') {
          initVar = node.init.declarations[0].id.name;
        }
        
        result.loops.push({
          type: 'for',
          variable: initVar,
          body: 'loop body'
        });
      },
      WhileStatement(node) {
        result.loops.push({
          type: 'while',
          body: 'loop body'
        });
      }
    });
    
    // Extract functions
    walk.simple(ast, {
      FunctionDeclaration(node) {
        result.functions.push({
          name: node.id.name,
          params: node.params.map(p => p.name)
        });
      }
    });
    
    // Extract conditionals
    walk.simple(ast, {
      IfStatement(node) {
        result.conditionals.push({
          type: 'if',
          hasElse: node.alternate !== null
        });
      }
    });
    
    return result;
  } catch (error) {
    console.error('Error parsing code:', error);
    throw new Error('Failed to parse code');
  }
};

```

```javascript
// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CodeEditor from './components/CodeEditor';
import Visualization from './components/Visualization';
import ConceptLibrary from './components/ConceptLibrary';
import Navbar from './components/Navbar';
import { parseCode } from './utils/codeParser';
import { connectToSocket } from './services/socketService';
import './App.css';

function App() {
  const [code, setCode] = useState('function example() {\n  const array = [1, 2, 3, 4, 5];\n  let sum = 0;\n  \n  for(let i = 0; i < array.length; i++) {\n    sum += array[i];\n  }\n  \n  return sum;\n}');
  const [visualization, setVisualization] = useState(null);
  const [socket, setSocket] = useState(null);
  const [activeTab, setActiveTab] = useState('editor');

  useEffect(() => {
    const socketConnection = connectToSocket();
    setSocket(socketConnection);

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };

  const handleVisualize = () => {
    try {
      const parsedCode = parseCode(code);
      setVisualization(parsedCode);
      
      if (socket) {
        socket.emit('visualize_code', { code, parsedStructure: parsedCode });
      }
      
      setActiveTab('visualization');
    } catch (error) {
      console.error("Error parsing code:", error);
      alert("There was an error parsing your code. Please check for syntax errors.");
    }
  };

  const handleLaunchVR = () => {
    if (socket) {
      socket.emit('launch_vr', { code, parsedStructure: visualization });
      alert('VR visualization request sent! Please put on your VR headset.');
    } else {
      alert('Cannot connect to VR service. Please try again later.');
    }
  };

  const MainContent = () => (
    <>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="content-area">
        {activeTab === 'editor' && (
          <div className="editor-container">
            <CodeEditor code={code} onCodeChange={handleCodeChange} />
            <div className="button-container">
              <button onClick={handleVisualize} className="visualize-button">
                Visualize Code
              </button>
              <button onClick={handleLaunchVR} className="vr-button">
                Launch in VR
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'visualization' && (
          <Visualization data={visualization} />
        )}
        
        {activeTab === 'library' && (
          <ConceptLibrary />
        )}
      </div>
    </>
  );

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<MainContent />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

```

```css
/* src/App.css */
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #1e1e1e;
  color: #f0f0f0;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #2d2d2d;
  padding: 0.5rem 1rem;
  height: 60px;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #61dafb;
}

.nav-tabs {
  display: flex;
  gap: 1rem;
}

.nav-tabs button {
  background: none;
  border: none;
  color: #e0e0e0;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-tabs button.active {
  background-color: #3e3e3e;
  color: #61dafb;
}

.content-area {
  flex: 1;
  padding: 1rem;
  overflow: auto;
}

.editor-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px);
}

.code-editor {
  flex: 1;
  border-radius: 4px;
  overflow: hidden;
}

.button-container {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: center;
}

button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.visualize-button {
  background-color: #61dafb;
  color: #1e1e1e;
}

.vr-button {
  background-color: #bb86fc;
  color: #1e1e1e;
}

.visualization-container {
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
}

.visualization-canvas {
  flex: 1;
  background-color: #2d2d2d;
  border-radius: 4px;
}

.visualization-placeholder {
  height: 70vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #2d2d2d;
  border-radius: 4px;
  font-size: 1.2rem;
  color: #a0a0a0;
}

.code-structure {
  margin-top: 1rem;
  background-color: #2d2d2d;
  padding: 1rem;
  border-radius: 4px;
  max-height: 20vh;
  overflow: auto;
}

pre {
  margin: 0;
  font-family: 'Courier New', monospace;
}

.concept-library {
  padding: 1rem;
}

.concept-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.concept-card {
  background-color: #2d2d2d;
  padding: 1.5rem;
  border-radius: 4px;
  transition: transform 0.2s;
}

.concept-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.concept-card h3 {
  color: #61dafb;
  margin-top: 0;
  margin-bottom: 1rem;
}

```

5. Don't forget to install the necessary dependencies for code parsing:
```bash
npm install acorn acorn-walk
```

## Backend Setup (Node.js)

1. Create a new directory for your backend:
```bash
mkdir backend
cd backend
npm init -y
```

2. Install necessary dependencies:
```bash
npm install express socket.io cors ws
```

3. Backend directory structure:
```
backend/
├── index.js
├── controllers/
│   └── codeController.js
├── routes/
│   └── codeRoutes.js
├── temp/
└── package.json
```

```javascript
// backend/index.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const codeController = require('./controllers/codeController');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Default Vite dev server port
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

```

4. Create the required directories:
```bash
mkdir controllers routes temp saved-visualizations
```

5. Add a start script to your `package.json`:
```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```

6. For development, install nodemon:
```bash
npm install --save-dev nodemon
```

## Unity VR Setup

1. Create a new Unity project with VR support (use the VR template if available).

2. Set up the following scripts in your Unity project:

```csharp
// CodeVisualization.cs - Add to your main visualization scene GameObject
using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Newtonsoft.Json;
using NativeWebSocket;

public class CodeVisualization : MonoBehaviour
{
    [SerializeField] private GameObject variablePrefab;
    [SerializeField] private GameObject arrayPrefab;
    [SerializeField] private GameObject loopPrefab;
    [SerializeField] private GameObject functionPrefab;
    [SerializeField] private Transform visualizationRoot;
    
    private WebSocket webSocket;
    private string dataFilePath;
    private Dictionary<string, GameObject> visualElements = new Dictionary<string, GameObject>();
    
    private void Start()
    {
        // Path to look for data file (this would be coordinated with the backend)
        dataFilePath = Path.Combine(Application.persistentDataPath, "current-visualization.json");
        
        // Set up periodic checking for file changes if using file-based approach
        InvokeRepeating("CheckForVisualizationData", 2.0f, 1.0f);
        
        // Set up WebSocket connection
        ConnectToWebSocket();
    }
    
    async void ConnectToWebSocket()
    {
        webSocket =
```