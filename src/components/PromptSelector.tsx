
import React, { useState, useEffect } from 'react';
import { Prompt, getPromptsByCategory } from '../mock/fakePrompts';

interface PromptSelectorProps {
  category: 'theme' | 'style' | 'lyrics';
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const PromptSelector: React.FC<PromptSelectorProps> = ({ 
  category, 
  label, 
  value, 
  onChange, 
  className = '' 
}) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  useEffect(() => {
    // Load prompts for this category
    const categoryPrompts = getPromptsByCategory(category);
    setPrompts(categoryPrompts);
    
    // If we have a value already, find the matching prompt
    if (value && categoryPrompts.length > 0) {
      const matchingPrompt = categoryPrompts.find(p => p.title === value);
      if (matchingPrompt) {
        setSelectedPrompt(matchingPrompt);
      }
    }
  }, [category, value]);

  const handlePromptSelect = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    onChange(prompt.title);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium mb-1 text-gray-200">
        {label}
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-secondary text-left px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-music-purple flex justify-between items-center"
      >
        <span>{selectedPrompt ? selectedPrompt.title : `Select ${label}`}</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {prompts.map(prompt => (
            <div
              key={prompt.id}
              onClick={() => handlePromptSelect(prompt)}
              className={`px-4 py-2 hover:bg-music-purple/20 cursor-pointer ${
                selectedPrompt?.id === prompt.id ? 'bg-music-purple/40' : ''
              }`}
            >
              <div className="font-medium">{prompt.title}</div>
              <div className="text-sm text-gray-400">{prompt.description}</div>
            </div>
          ))}
        </div>
      )}
      
      {selectedPrompt && (
        <p className="mt-2 text-sm text-gray-400">
          {selectedPrompt.description}
        </p>
      )}
    </div>
  );
};

export default PromptSelector;
