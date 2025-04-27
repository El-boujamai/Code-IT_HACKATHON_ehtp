import { JSX } from 'react';
import './ConditionalVisualization.css';

interface Conditional {
  type: string;
  hasElse: boolean;
}

interface ConditionalVisualizationProps {
  conditionals: Conditional[];
}

function ConditionalVisualization({ conditionals }: ConditionalVisualizationProps): JSX.Element {
  return (
    <div className="conditional-visualization">
      {conditionals.map((conditional, index) => (
        <div key={index} className="conditional-container">
          <div className="conditional-type">
            {conditional.type.toUpperCase()}
          </div>
          <div className="conditional-details">
            <div className="conditional-structure">
              <div className="conditional-if">IF</div>
              {conditional.hasElse && (
                <div className="conditional-else">ELSE</div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ConditionalVisualization;