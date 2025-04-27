import { useRef, useEffect, JSX } from 'react';
import * as monaco from 'monaco-editor';
import { editorOptions, configureMonaco } from '../monaco-setup';
import './CodeEditor.css';

interface CodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
}

function CodeEditor({ code, onCodeChange }: CodeEditorProps): JSX.Element {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    // Configure Monaco editor
    configureMonaco();
    
    if (editorContainerRef.current) {
      // Initialize Monaco editor with custom options
      const editor = monaco.editor.create(editorContainerRef.current, {
        ...editorOptions,
        value: code,
        theme: 'vs-dark-custom',
      });

      // Set up change event listener
      editor.onDidChangeModelContent(() => {
        const value = editor.getValue();
        onCodeChange(value);
      });

      // Add key bindings for common actions
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        // Save code - can be customized
        console.log('Save action triggered');
      });

      // Add support for code formatting
      editor.addAction({
        id: 'format-code',
        label: 'Format Code',
        keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.KeyF],
        run: (ed) => {
          const formatAction = ed.getAction('editor.action.formatDocument');
          if (formatAction) {
            formatAction.run();
          }
        }
      });

      // Store editor instance
      editorInstanceRef.current = editor;

      // Focus the editor
      editor.focus();

      // Clean up on unmount
      return () => {
        editor.dispose();
      };
    }
  }, []);

  // Update editor content if code prop changes externally
  useEffect(() => {
    if (editorInstanceRef.current) {
      const currentValue = editorInstanceRef.current.getValue();
      if (code !== currentValue) {
        editorInstanceRef.current.setValue(code);
      }
    }
  }, [code]);

  return (
    <div className="code-editor">
      <div ref={editorContainerRef} className="editor-container-monaco" />
    </div>
  );
}

export default CodeEditor;