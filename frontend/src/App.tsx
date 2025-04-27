import { useState, useEffect, JSX } from 'react';
import CodeEditor from './components/CodeEditor';
import Visualization from './components/Visualization';
import ConceptLibrary from './components/ConceptLibrary';
import Navbar from './components/Navbar';
import { parseCode, ParsedCode } from './utils/codeParser';
import { connectToSocket } from './services/socketService';
import './App.css';
import VisualizationStatus from './components/VisualizationStatus';

function App(): JSX.Element {
  const [code, setCode] = useState<string>('function example() {\n  const array = [1, 2, 3, 4, 5];\n  let sum = 0;\n  \n  for(let i = 0; i < array.length; i++) {\n    sum += array[i];\n  }\n  \n  return sum;\n}');
  const [visualization, setVisualization] = useState<ParsedCode | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('editor');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socketConnection = connectToSocket();
    setSocket(socketConnection);

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  const handleCodeChange = (newCode: string): void => {
    setCode(newCode);
    setError(null);
  };

  const handleVisualize = (): void => {
    try {
      const parsedCode = parseCode(code);
      setVisualization(parsedCode);
      
      if (socket) {
        socket.emit('visualize_code', { code, parsedStructure: parsedCode });
      }
      
      setActiveTab('visualization');
      setError(null);
    } catch (error: any) {
      console.error("Error parsing code:", error);
      setError(error.message || "There was an error parsing your code. Please check for syntax errors.");
    }
  };

  const handleLaunchVR = (): void => {
    if (!visualization) {
      setError("Please visualize your code first before launching VR mode.");
      return;
    }
    
    if (socket) {
      socket.emit('launch_vr', { code, parsedStructure: visualization });
      alert('VR visualization request sent! Please put on your VR headset.');
    } else {
      setError('Cannot connect to VR service. Please try again later.');
    }
  };

  return (
    <div className="app">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="content-area">
        {activeTab === 'editor' && (
          <div className="editor-container">
            <CodeEditor code={code} onCodeChange={handleCodeChange} />
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
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
          <div className="visualization-container">
          <Visualization data={visualization} />
          <VisualizationStatus /> {/* Add the component here */}
        </div>
        )}
        
        {activeTab === 'library' && (
          <ConceptLibrary />
        )}
      </div>
    </div>
  );
}

export default App;