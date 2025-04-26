import React from 'react';

function ConceptLibrary() {
  return (
    <div className="concept-library">
      <h2>Programming Concepts Library</h2>
      <div className="concept-cards">
        <div className="concept-card">
          <h3>Variables</h3>
          <p>Storage locations with names that hold values in programming.</p>
        </div>
        <div className="concept-card">
          <h3>Arrays</h3>
          <p>Collections of elements stored at contiguous memory locations.</p>
        </div>
        <div className="concept-card">
          <h3>Loops</h3>
          <p>Control structures that repeat a block of code until a condition is met.</p>
        </div>
        <div className="concept-card">
          <h3>Functions</h3>
          <p>Reusable blocks of code that perform specific tasks.</p>
        </div>
      </div>
    </div>
  );
}

export default ConceptLibrary;