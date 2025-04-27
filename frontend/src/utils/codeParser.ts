import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

interface Variable {
  name: string;
  value: any;
  type: string;
}

interface ArrayData {
  name: string;
  elements: any[];
  length: number;
}

interface LoopIteration {
  variables: Record<string, any>;
}

interface Loop {
  type: string;
  variable?: string;
  init?: string;
  condition?: string;
  update?: string;
  body?: string;
  iterations?: LoopIteration[];
}

interface Function {
  name: string;
  params: string[];
}

interface Conditional {
  type: string;
  hasElse: boolean;
}

export interface ParsedCode {
  variables: Variable[];
  arrays: ArrayData[];
  loops: Loop[];
  functions: Function[];
  conditionals: Conditional[];
}

export function parseCode(code: string): ParsedCode {
  try {
    const ast = acorn.parse(code, { ecmaVersion: 2020 });
    
    const result: ParsedCode = {
      variables: [],
      arrays: [],
      loops: [],
      functions: [],
      conditionals: []
    };
    
    // Extract variables and arrays
    walk.simple(ast, {
      VariableDeclarator(node: any) {
        const varName = node.id.name;
        let value = null;
        
        if (node.init) {
          if (node.init.type === 'Literal') {
            value = node.init.value;
          } else if (node.init.type === 'ArrayExpression') {
            const arrayElements = node.init.elements.map((el: any) =>
              el.type === 'Literal' ? el.value : 'complex'
            );
            
            result.arrays.push({
              name: varName,
              elements: arrayElements,
              length: arrayElements.length
            });
            return;
          }
        }
        
        result.variables.push({
          name: varName,
          value: value,
          type: typeof value
        });
      }
    });
    
    // Extract loops
    walk.simple(ast, {
      ForStatement(node: any) {
        let initVar = '';
        let condition = '';
        let update = '';
        
        if (node.init) {
          if (node.init.type === 'VariableDeclaration') {
            const declaration = node.init.declarations[0];
            initVar = declaration.id.name;
            condition = generateConditionString(node.test);
            update = generateUpdateString(node.update);
          }
        }
        
        // Mock loop iterations for visualization
        const iterations: LoopIteration[] = [];
        for (let i = 0; i < 5; i++) {  // Limit to 5 iterations for visualization
          iterations.push({
            variables: {
              [initVar]: i
            }
          });
        }
        
        result.loops.push({
          type: 'for',
          variable: initVar,
          init: generateInitString(node.init),
          condition: condition,
          update: update,
          body: 'loop body',
          iterations: iterations
        });
      },
      WhileStatement(node: any) {
        result.loops.push({
          type: 'while',
          condition: generateConditionString(node.test),
          body: 'loop body'
        });
      }
    });
    
    // Extract functions
    walk.simple(ast, {
      FunctionDeclaration(node: any) {
        result.functions.push({
          name: node.id.name,
          params: node.params.map((p: any) => p.name)
        });
      }
    });
    
    // Extract conditionals
    walk.simple(ast, {
      IfStatement(node: any) {
        result.conditionals.push({
          type: 'if',
          hasElse: node.alternate !== null
        });
      }
    });
    
    return result;
  } catch (error) {
    console.error('Error parsing code:', error);
    throw new Error('Failed to parse code');
  }
}

// Helper functions to generate code strings from AST nodes
function generateInitString(initNode: any): string {
  if (!initNode) return '';
  
  if (initNode.type === 'VariableDeclaration') {
    const decl = initNode.declarations[0];
    const varName = decl.id.name;
    
    if (decl.init.type === 'Literal') {
      return `${varName} = ${decl.init.value}`;
    }
  }
  
  return 'initialization';
}

function generateConditionString(testNode: any): string {
  if (!testNode) return '';
  
  if (testNode.type === 'BinaryExpression') {
    const left = testNode.left.type === 'Identifier' ? testNode.left.name : '...';
    const right = testNode.right.type === 'Identifier' ? 
                  testNode.right.name : 
                  testNode.right.type === 'Literal' ? 
                  testNode.right.value : 
                  testNode.right.type === 'MemberExpression' ?
                  `${testNode.right.object.name}.${testNode.right.property.name}` : '...';
    
    return `${left} ${testNode.operator} ${right}`;
  }
  
  return 'condition';
}

function generateUpdateString(updateNode: any): string {
  if (!updateNode) return '';
  
  if (updateNode.type === 'UpdateExpression') {
    return `${updateNode.argument.name}${updateNode.operator}`;
  }
  
  return 'update';
}