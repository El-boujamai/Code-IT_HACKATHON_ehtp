import React, { useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { socket } from '../services/socket'; // Nous créerons ce fichier plus tard

function CodeEditor() {
  const [code, setCode] = useState('');

  const handleEditorChange = (value, event) => {
    setCode(value);
  };

  const handleSendCode = () => {
    console.log('Envoi du code au backend:', code);
    socket.emit('code-from-frontend', code);
  };

  return (
    <div>
      <h2>Éditeur de Code</h2>
      <MonacoEditor
        height="400"
        defaultLanguage="javascript"
        value={code}
        onChange={handleEditorChange}
      />
      <button onClick={handleSendCode}>Envoyer le Code</button>
      <p>Code actuel :</p>
      <pre>{code}</pre>
    </div>
  );
}

export default CodeEditor;