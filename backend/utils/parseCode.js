import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

export function parseCode(code) {
  try {
    const ast = acorn.parse(code, { ecmaVersion: 2020 });

    const result = {
      variables: [],
      arrays: [],
      loops: [],
      functions: [],
      conditionals: []
    };

    // Extract variables and arrays
    walk.simple(ast, {
      VariableDeclarator(node) {
        const varName = node.id.name;
        let value = null;

        if (node.init) {
          if (node.init.type === 'Literal') {
            value = node.init.value;
          } else if (node.init.type === 'ArrayExpression') {
            const arrayElements = node.init.elements.map((el) =>
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
          const declaration = node.init.declarations[0];
          initVar = declaration.id.name;
          condition = generateConditionString(node.test);
          update = generateUpdateString(node.update);
        }

        // Mock loop iterations for visualization
        const iterations = [];
        for (let i = 0; i < 5; i++) {
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

      WhileStatement(node) {
        result.loops.push({
          type: 'while',
          condition: generateConditionString(node.test),
          body: 'loop body'
        });
      }
    });

    // Extract functions
    walk.simple(ast, {
      FunctionDeclaration(node) {
        result.functions.push({
          name: node.id.name,
          params: node.params.map((p) => p.name)
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
}

// Helper: Get init string for loop
function generateInitString(initNode) {
  if (!initNode) return '';

  if (initNode.type === 'VariableDeclaration') {
    const decl = initNode.declarations[0];
    const varName = decl.id.name;

    if (decl.init && decl.init.type === 'Literal') {
      return `${varName} = ${decl.init.value}`;
    }
  }

  return 'initialization';
}

// Helper: Get condition string for loop
function generateConditionString(testNode) {
  if (!testNode) return '';

  if (testNode.type === 'BinaryExpression') {
    const left = testNode.left.type === 'Identifier' ? testNode.left.name : '...';
    const right = testNode.right.type === 'Identifier'
      ? testNode.right.name
      : testNode.right.type === 'Literal'
        ? testNode.right.value
        : testNode.right.type === 'MemberExpression'
          ? `${testNode.right.object.name}.${testNode.right.property.name}`
          : '...';

    return `${left} ${testNode.operator} ${right}`;
  }

  return 'condition';
}

// Helper: Get update string for loop
function generateUpdateString(updateNode) {
  if (!updateNode) return '';

  if (updateNode.type === 'UpdateExpression') {
    return `${updateNode.argument.name}${updateNode.operator}`;
  }

  return 'update';
}
