import React from 'react';
import CodeEditor from './components/CodeEditor.jsx';
import './App.css'; // Vous pouvez créer ce fichier pour le style

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Interface CodeVision VR</h1>
      </header>
      <main>
        <CodeEditor />
      </main>
    </div>
  );
}

export default App;