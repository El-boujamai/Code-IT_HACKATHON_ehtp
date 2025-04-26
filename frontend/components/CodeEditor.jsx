import React from 'react';
import Editor from '@monaco-editor/react';

function CodeEditor({ code, onCodeChange }) {
  const handleEditorChange = (value) => {
    onCodeChange(value);
  };

  return (
    <div className="code-editor">
      <h2>Code Editor</h2>
      <Editor
        height="70vh"
        defaultLanguage="javascript"
        value={code}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          automaticLayout: true,
        }}
      />
    </div>
  );
}

export default CodeEditor;