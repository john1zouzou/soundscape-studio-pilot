
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PromptSelector from '../components/PromptSelector';
import { createNewBatch } from '../services/mockApi';
import { toast } from 'sonner';

const CreateBatch: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [trackCount, setTrackCount] = useState(10);
  const [themePrompt, setThemePrompt] = useState('');
  const [stylePrompt, setStylePrompt] = useState('');
  const [lyricsPrompt, setLyricsPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !themePrompt || !stylePrompt || !lyricsPrompt) {
      toast.error('Please fill all required fields');
      return;
    }
    
    if (trackCount < 1 || trackCount > 200) {
      toast.error('Track count must be between 1 and 200');
      return;
    }
    
    setLoading(true);
    
    try {
      const batch = await createNewBatch(
        name,
        trackCount,
        themePrompt,
        stylePrompt,
        lyricsPrompt
      );
      
      toast.success(`Batch "${name}" created successfully with ${trackCount} tracks`);
      navigate(`/batch/${batch.id}`);
    } catch (error) {
      console.error('Error creating batch:', error);
      toast.error('Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Batch</h1>
      
      <div className="max-w-2xl bg-card rounded-lg border border-border p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-200">
              Batch Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter batch name"
              className="w-full bg-secondary px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-music-purple"
              disabled={loading}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="trackCount" className="block text-sm font-medium mb-1 text-gray-200">
              Number of Tracks (1-200)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                id="trackCount"
                min="1"
                max="200"
                value={trackCount}
                onChange={(e) => setTrackCount(parseInt(e.target.value))}
                className="flex-1"
                disabled={loading}
              />
              <input
                type="number"
                value={trackCount}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 1 && value <= 200) {
                    setTrackCount(value);
                  }
                }}
                className="w-20 bg-secondary px-3 py-1 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-music-purple"
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="mb-6">
            <PromptSelector
              category="theme"
              label="Theme Prompt"
              value={themePrompt}
              onChange={setThemePrompt}
            />
          </div>
          
          <div className="mb-6">
            <PromptSelector
              category="style"
              label="Style Prompt"
              value={stylePrompt}
              onChange={setStylePrompt}
            />
          </div>
          
          <div className="mb-6">
            <PromptSelector
              category="lyrics"
              label="Lyrics Prompt"
              value={lyricsPrompt}
              onChange={setLyricsPrompt}
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 bg-music-purple text-white rounded-md hover:bg-music-purple/90 flex items-center
                ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                    <path d="M9.5 16V8l7 4-7 4z"></path>
                  </svg>
                  Generate Batch
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBatch;
