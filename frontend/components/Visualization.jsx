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