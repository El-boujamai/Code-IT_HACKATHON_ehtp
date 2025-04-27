import { JSX } from 'react';
import './ArrayVisualization.css';

interface ArrayData {
  name: string;
  elements: any[];
}

interface ArrayVisualizationProps {
  arrays: ArrayData[];
}

function ArrayVisualization({ arrays }: ArrayVisualizationProps): JSX.Element {
  return (
    <div className="array-visualization">
      {arrays.map((array, arrayIndex) => (
        <div key={arrayIndex} className="array-container">
          <div className="array-name">{array.name}</div>
          <div className="array-elements">
            {array.elements.map((element, elementIndex) => (
              <div key={elementIndex} className="array-element">
                <div className="array-index">{elementIndex}</div>
                <div className="array-value">{JSON.stringify(element)}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ArrayVisualization;