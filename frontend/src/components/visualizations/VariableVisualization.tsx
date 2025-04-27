import { JSX } from 'react';
import './VariableVisualization.css';

interface Variable {
  name: string;
  value: any;
}

interface VariableVisualizationProps {
  variables: Variable[];
}

function VariableVisualization({ variables }: VariableVisualizationProps): JSX.Element {
  return (
    <div className="variable-visualization">
      {variables.map((variable, index) => (
        <div key={index} className="variable-card">
          <div className="variable-name">{variable.name}</div>
          <div className="variable-type">{typeof variable.value}</div>
          <div className="variable-value">{JSON.stringify(variable.value)}</div>
        </div>
      ))}
    </div>
  );
}

export default VariableVisualization;

// src/utils/codeParser.ts
interface Variable {
  name: string;
  value: any;
}

interface ArrayData {
  name: string;
  elements: any[];
}

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

interface ParsedCode {
  variables: Variable[];
  arrays: ArrayData[];
  loops: Loop[];
}

export function parseCode(code: string): ParsedCode {
  // This is a simplified parser for demonstration
  // In a real application, you would use a proper JavaScript parser like Babel or Acorn
  
  try {
    // Mock parser results for demonstration
    const result: ParsedCode = {
      variables: [],
      arrays: [],
      loops: []
    };
    
    // Extract variable declarations
    const varRegex = /(?:let|const|var)\s+(\w+)\s*=\s*([^;]+)/g;
    let varMatch: RegExpExecArray | null;
    
    while ((varMatch = varRegex.exec(code)) !== null) {
      const name = varMatch[1];
      const valueStr = varMatch[2].trim();
      
      // Check if it's an array
      if (valueStr.startsWith('[') && valueStr.endsWith(']')) {
        try {
          // Parse array value
          const arrayValue = JSON.parse(valueStr);
          result.arrays.push({
            name,
            elements: arrayValue
          });
        } catch (e) {
          // If parsing fails, add as a regular variable
          result.variables.push({
            name,
            value: valueStr
          });
        }
      } else {
        // Handle primitive values
        let value: string | boolean | number = valueStr;
        if (valueStr === 'true') value = true;
        else if (valueStr === 'false') value = false;
        else if (!isNaN(Number(valueStr))) value = Number(valueStr);
        
        result.variables.push({
          name,
          value
        });
      }
    }
    
    // Extract for loops
    const forLoopRegex = /for\s*\(\s*(?:let|var|const)?\s*(\w+)\s*=\s*([^;]+);\s*([^;]+);\s*([^\)]+)\s*\)/g;
    let forMatch: RegExpExecArray | null;
    
    while ((forMatch = forLoopRegex.exec(code)) !== null) {
      const iterator = forMatch[1];
      const init = forMatch[2].trim();
      const condition = forMatch[3].trim();
      const update = forMatch[4].trim();
      
      // Mock loop iterations for demonstration
      const iterations: LoopIteration[] = [];
      const initValue = Number(init);
      const limit = 5; // Limit iterations for visualization
      
      for (let i = initValue; i < limit; i++) {
        iterations.push({
          variables: {
            [iterator]: i
          }
        });
      }
      
      result.loops.push({
        type: 'for',
        init: `${iterator} = ${init}`,
        condition,
        update,
        iterations
      });
    }
    
    return result;
  } catch (error) {
    console.error("Error parsing code:", error);
    throw new Error("Failed to parse code");
  }
}
