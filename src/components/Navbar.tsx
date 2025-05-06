
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();
  
  return (
    <header className="bg-music-dark border-b border-border">
      <div className="container py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="mr-2 text-music-purple"
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
            <path d="M16.24 7.76a6 6 0 0 1 0 8.49" />
            <path d="M7.76 7.76a6 6 0 0 0 0 8.49" />
          </svg>
          Soundscape Studio
        </Link>
        
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link 
                to="/"
                className={`hover:text-music-purple ${location.pathname === '/' ? 'text-music-purple' : ''}`}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/create"
                className={`hover:text-music-purple ${location.pathname === '/create' ? 'text-music-purple' : ''}`}
              >
                Create Batch
              </Link>
            </li>
            <li>
              <Link 
                to="/playlists"
                className={`hover:text-music-purple ${location.pathname === '/playlists' ? 'text-music-purple' : ''}`}
              >
                Playlists
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
