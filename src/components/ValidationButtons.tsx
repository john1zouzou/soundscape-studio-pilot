
import React from 'react';

interface ValidationButtonsProps {
  onValidate: () => void;
  onReject: () => void;
  onRegenerate?: () => void;
  status: 'pending' | 'validated' | 'rejected';
  loading?: boolean;
}

const ValidationButtons: React.FC<ValidationButtonsProps> = ({ 
  onValidate, 
  onReject, 
  onRegenerate, 
  status, 
  loading = false
}) => {
  if (loading) {
    return (
      <div className="flex justify-end space-x-2">
        <button 
          className="px-4 py-2 bg-secondary text-gray-400 rounded-md cursor-not-allowed opacity-50"
          disabled
        >
          <span className="animate-pulse">Loading...</span>
        </button>
      </div>
    );
  }

  if (status === 'rejected' && onRegenerate) {
    return (
      <div className="flex justify-end">
        <button 
          onClick={onRegenerate}
          className="flex items-center px-4 py-2 bg-music-purple text-white rounded-md hover:bg-music-purple/90"
        >
          <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 2v6h-6"></path>
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
            <path d="M3 22v-6h6"></path>
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
          </svg>
          Regenerate
        </button>
      </div>
    );
  }

  if (status === 'validated') {
    return (
      <div className="flex justify-end">
        <span className="inline-flex items-center px-4 py-2 bg-music-green text-white rounded-md">
          <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Validated
        </span>
      </div>
    );
  }

  return (
    <div className="flex justify-end space-x-2">
      <button 
        onClick={onReject}
        className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/80"
      >
        Reject
      </button>
      <button 
        onClick={onValidate}
        className="px-4 py-2 bg-music-green text-white rounded-md hover:bg-music-green/90"
      >
        Validate
      </button>
    </div>
  );
};

export default ValidationButtons;
