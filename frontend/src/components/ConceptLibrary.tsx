import { JSX } from 'react';
import './ConceptLibrary.css';

interface Concept {
  id: number;
  title: string;
  description: string;
  examples: string[];
}

function ConceptLibrary(): JSX.Element {
  const concepts: Concept[] = [
    {
      id: 1,
      title: 'Variables',
      description: 'A variable is a named storage location in a program that holds a value.',
      examples: ['let name = "John";', 'const age = 30;', 'var isActive = true;']
    },
    {
      id: 2,
      title: 'Arrays',
      description: 'An array is a data structure that stores a collection of items.',
      examples: ['const numbers = [1, 2, 3, 4, 5];', 'let fruits = ["apple", "banana", "orange"];']
    },
    {
      id: 3,
      title: 'Loops',
      description: 'Loops are used to execute a block of code multiple times.',
      examples: ['for(let i = 0; i < 5; i++) { ... }', 'while(condition) { ... }', 'array.forEach(item => { ... })']
    }
  ];

  return (
    <div className="concept-library">
      <h2>Programming Concepts</h2>
      <div className="concepts-list">
        {concepts.map(concept => (
          <div key={concept.id} className="concept-card">
            <h3>{concept.title}</h3>
            <p>{concept.description}</p>
            <div className="examples">
              <h4>Examples:</h4>
              <ul>
                {concept.examples.map((example, index) => (
                  <li key={index}><code>{example}</code></li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ConceptLibrary;