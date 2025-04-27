// VisualizationStatus.tsx
import React from 'react';
import { useVisualizationStore } from '../services/socketService';

const VisualizationStatus: React.FC = () => {
  const { currentVisualization, isConnectedToUnity } = useVisualizationStore();
  
  return (
    <div className="visualization-status">
      <h3>Unity VR Status</h3>
      <div className="status-indicator">
        Connection Status: 
        <span className={isConnectedToUnity ? 'connected' : 'disconnected'}>
          {isConnectedToUnity ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      
      {currentVisualization && (
        <div className="visualization-info">
          <h4>Current Visualization</h4>
          <p>Session: {currentVisualization.sessionId}</p>
          <p>Code ID: {currentVisualization.codeId}</p>
          <p>Elements: {currentVisualization.elements.length}</p>
          
          <div className="elements-list">
            <h5>Elements:</h5>
            <ul>
              {currentVisualization.elements.map(element => (
                <li key={element.id}>
                  {element.label} ({element.type}) - {element.state}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualizationStatus;