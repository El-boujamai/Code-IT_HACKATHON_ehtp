import  { JSX } from 'react';
import './Navbar.css';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

function Navbar({ activeTab, setActiveTab }: NavbarProps): JSX.Element {
  return (
    <nav className="navbar">
      <div className="logo">Code Visualization</div>
      <ul className="nav-links">
        <li className={activeTab === 'editor' ? 'active' : ''}>
          <button onClick={() => setActiveTab('editor')}>Code Editor</button>
        </li>
        <li className={activeTab === 'visualization' ? 'active' : ''}>
          <button onClick={() => setActiveTab('visualization')}>Visualization</button>
        </li>
        <li className={activeTab === 'library' ? 'active' : ''}>
          <button onClick={() => setActiveTab('library')}>Concept Library</button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;