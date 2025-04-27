import { JSX } from 'react';
import './FunctionVisualization.css';

interface Function {
  name: string;
  params: string[];
}

interface FunctionVisualizationProps {
  functions: Function[];
}

function FunctionVisualization({ functions }: FunctionVisualizationProps): JSX.Element {
  return (
    <div className="function-visualization">
      {functions.map((func, index) => (
        <div key={index} className="function-container">
          <div className="function-header">
            <div className="function-name">{func.name}</div>
            <div className="function-params">
              {func.params.length === 0 ? (
                <span className="no-params">No parameters</span>
              ) : (
                <>
                  {func.params.map((param, paramIndex) => (
                    <span key={paramIndex} className="function-param">
                      {param}{paramIndex < func.params.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FunctionVisualization;