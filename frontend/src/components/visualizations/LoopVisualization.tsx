import { JSX } from 'react';
import './LoopVisualization.css';

interface LoopIteration {
  variables: Record<string, any>;
}

interface Loop {
  type: string;
  init?: string;
  condition?: string;
  update?: string;
  iterations: LoopIteration[];
}

interface LoopVisualizationProps {
  loops: Loop[];
}

function LoopVisualization({ loops }: LoopVisualizationProps): JSX.Element {
  return (
    <div className="loop-visualization">
      {loops.map((loop, index) => (
        <div key={index} className="loop-container">
          <div className="loop-header">
            <div className="loop-type">{loop.type}</div>
            <div className="loop-info">
              {loop.type === 'for' && (
                <>
                  <span className="loop-init">{loop.init}</span>
                  <span className="loop-condition">{loop.condition}</span>
                  <span className="loop-update">{loop.update}</span>
                </>
              )}
              {loop.type === 'while' && (
                <span className="loop-condition">{loop.condition}</span>
              )}
            </div>
          </div>
          <div className="loop-iterations">
            {loop.iterations.map((iteration, iterIndex) => (
              <div key={iterIndex} className="loop-iteration">
                <div className="iteration-number">Iteration {iterIndex + 1}</div>
                <div className="iteration-variables">
                  {Object.entries(iteration.variables).map(([name, value]) => (
                    <div key={name} className="iteration-variable">
                      <span className="variable-name">{name}: </span>
                      <span className="variable-value">{JSON.stringify(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default LoopVisualization;