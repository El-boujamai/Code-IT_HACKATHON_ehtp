import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

export const parseCode = (code) => {
  try {
    const ast = acorn.parse(code, { ecmaVersion: 2020 });
    
    const result = {
      variables: [],
      arrays: [],
      loops: [],
      functions: [],
      conditionals: []
    };
    
    // Extract variables
    walk.simple(ast, {
      VariableDeclarator(node) {
        const varName = node.id.name;
        let value = null;
        
        if (node.init) {
          if (node.init.type === 'Literal') {
            value = node.init.value;
          } else if (node.init.type === 'ArrayExpression') {
            const arrayElements = node.init.elements.map(el => 
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
      ForStatement(node) {
        let initVar = '';
        let condition = '';
        let update = '';
        
        if (node.init && node.init.type === 'VariableDeclaration') {
          initVar = node.init.declarations[0].id.name;
        }
        
        result.loops.push({
          type: 'for',
          variable: initVar,
          body: 'loop body'
        });
      },
      WhileStatement(node) {
        result.loops.push({
          type: 'while',
          body: 'loop body'
        });
      }
    });
    
    // Extract functions
    walk.simple(ast, {
      FunctionDeclaration(node) {
        result.functions.push({
          name: node.id.name,
          params: node.params.map(p => p.name)
        });
      }
    });
    
    // Extract conditionals
    walk.simple(ast, {
      IfStatement(node) {
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
};