import React from 'react';

function Navbar({ activeTab, setActiveTab }) {
  return (
    <nav className="navbar">
      <div className="logo">CodeVision VR</div>
      <div className="nav-tabs">
        <button 
          className={activeTab === 'editor' ? 'active' : ''} 
          onClick={() => setActiveTab('editor')}
        >
          Code Editor
        </button>
        <button 
          className={activeTab === 'visualization' ? 'active' : ''} 
          onClick={() => setActiveTab('visualization')}
        >
          Visualization
        </button>
        <button 
          className={activeTab === 'library' ? 'active' : ''} 
          onClick={() => setActiveTab('library')}
        >
          Concept Library
        </button>
      </div>
    </nav>
  );
}

export default Navbar;