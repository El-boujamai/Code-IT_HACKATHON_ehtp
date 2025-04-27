import { JSX } from 'react';
import ArrayVisualization from './visualizations/ArrayVisualization';
import LoopVisualization from './visualizations/LoopVisualization';
import VariableVisualization from './visualizations/VariableVisualization';
import FunctionVisualization from './visualizations/FunctionVisualization';
import ConditionalVisualization from './visualizations/ConditionalVisualization';
import { ParsedCode } from '../utils/codeParser';
import './Visualization.css';

interface VisualizationProps {
  data: ParsedCode | null;
}

function Visualization({ data }: VisualizationProps): JSX.Element {
  if (!data) {
    return <div className="visualization-container empty">No visualization data available. Please visualize your code first.</div>;
  }

  return (
    <div className="visualization-container">
      <h2>Code Visualization</h2>
      
      {data.variables && data.variables.length > 0 && (
        <div className="visualization-section">
          <h3>Variables</h3>
          <VariableVisualization variables={data.variables} />
        </div>
      )}
      
      {data.arrays && data.arrays.length > 0 && (
        <div className="visualization-section">
          <h3>Arrays</h3>
          <ArrayVisualization arrays={data.arrays} />
        </div>
      )}
      
      {data.loops && data.loops.length > 0 && (
        <div className="visualization-section">
          <h3>Loops</h3>
          <LoopVisualization loops={data.loops.map(loop => ({ ...loop, iterations: loop.iterations || [] }))} />
        </div>
      )}
      
      {data.functions && data.functions.length > 0 && (
        <div className="visualization-section">
          <h3>Functions</h3>
          <FunctionVisualization functions={data.functions} />
        </div>
      )}
      
      {data.conditionals && data.conditionals.length > 0 && (
        <div className="visualization-section">
          <h3>Conditionals</h3>
          <ConditionalVisualization conditionals={data.conditionals} />
        </div>
      )}
    </div>
  );
}

export default Visualization;