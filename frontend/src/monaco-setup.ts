import * as monaco from 'monaco-editor';

// Define Monaco editor options
export const editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  theme: 'vs-dark',
  language: 'javascript',
  automaticLayout: true,
  minimap: {
    enabled: true
  },
  scrollBeyondLastLine: false,
  fontSize: 14,
  fontFamily: 'Menlo, Monaco, "Courier New", monospace',
  tabSize: 2,
  wordWrap: 'on',
  scrollbar: {
    verticalScrollbarSize: 12,
    horizontalScrollbarSize: 12
  },
  suggestOnTriggerCharacters: true,
  quickSuggestions: true,
  snippetSuggestions: 'inline',
  formatOnPaste: true,
  formatOnType: true
};

// Configure Monaco editor
export function configureMonaco() {
  // Register TypeScript and JavaScript languages
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    typeRoots: ["node_modules/@types"]
  });

  // Set dark theme
  monaco.editor.defineTheme('vs-dark-custom', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#1e1e1e',
      'editor.lineHighlightBackground': '#2d2d2d',
      'editorCursor.foreground': '#61dafb',
      'editorLineNumber.foreground': '#606060',
      'editor.selectionBackground': '#3a3d41',
      'editor.inactiveSelectionBackground': '#3a3d41'
    }
  });
}
