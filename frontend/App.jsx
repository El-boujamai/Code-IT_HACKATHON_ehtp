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