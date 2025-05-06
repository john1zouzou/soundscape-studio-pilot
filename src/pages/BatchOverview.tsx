
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBatchById } from '../services/mockApi';
import { Batch, getBatchProgress } from '../mock/fakeBatches';
import TrackCard from '../components/TrackCard';
import BatchStepper from '../components/BatchStepper';
import { toast } from 'sonner';

const BatchOverview: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchBatch = async () => {
      try {
        if (batchId) {
          const fetchedBatch = await getBatchById(batchId);
          if (fetchedBatch) {
            setBatch(fetchedBatch);
          } else {
            toast.error("Batch not found");
            navigate('/');
          }
        }
      } catch (error) {
        console.error("Error fetching batch:", error);
        toast.error("Failed to load batch");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBatch();
  }, [batchId, navigate]);
  
  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center">
        <div className="animate-pulse text-xl">Loading batch details...</div>
      </div>
    );
  }
  
  if (!batch) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Batch not found</h2>
          <p className="mb-4">The batch you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-music-purple text-white rounded-md"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  const progress = getBatchProgress(batch);

  return (
    <div className="container py-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">{batch.name}</h1>
          <p className="text-gray-400">
            Created on {batch.createdAt.toLocaleDateString()}
          </p>
        </div>
        
        <button
          onClick={() => navigate(`/batch/${batchId}/playlists`)}
          className="px-4 py-2 bg-music-purple text-white rounded-md hover:bg-music-purple/90"
        >
          Assign to Playlists
        </button>
      </div>
      
      <div className="bg-card rounded-lg border border-border p-6 mb-8">
        <BatchStepper batch={batch} />
        
        <div className="grid grid-cols-2 gap-6 mt-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Batch Details</h3>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-400">Theme:</span> {batch.themePrompt}</div>
              <div><span className="text-gray-400">Style:</span> {batch.stylePrompt}</div>
              <div><span className="text-gray-400">Lyrics:</span> {batch.lyricsPrompt}</div>
              <div><span className="text-gray-400">Total Tracks:</span> {batch.tracks.length}</div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">Validation Progress</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Theme</span>
                  <span>{progress.themeValidated}/{batch.tracks.length}</span>
                </div>
                <div className="w-full bg-music-gray rounded-full h-2">
                  <div 
                    className="bg-music-purple h-2 rounded-full" 
                    style={{ width: `${progress.themeProgress}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Style</span>
                  <span>{progress.styleValidated}/{batch.tracks.length}</span>
                </div>
                <div className="w-full bg-music-gray rounded-full h-2">
                  <div 
                    className="bg-music-purple h-2 rounded-full" 
                    style={{ width: `${progress.styleProgress}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Lyrics</span>
                  <span>{progress.lyricsValidated}/{batch.tracks.length}</span>
                </div>
                <div className="w-full bg-music-gray rounded-full h-2">
                  <div 
                    className="bg-music-purple h-2 rounded-full" 
                    style={{ width: `${progress.lyricsProgress}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Audio</span>
                  <span>{progress.audioValidated}/{batch.tracks.length}</span>
                </div>
                <div className="w-full bg-music-gray rounded-full h-2">
                  <div 
                    className="bg-music-purple h-2 rounded-full" 
                    style={{ width: `${progress.audioProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="flex space-x-4">
            {progress.themeValidated < batch.tracks.length && (
              <button
                onClick={() => navigate(`/batch/${batchId}/validate/theme`)}
                className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/80"
              >
                Validate Themes
              </button>
            )}
            
            {progress.themeValidated > 0 && progress.styleValidated < batch.tracks.length && (
              <button
                onClick={() => navigate(`/batch/${batchId}/validate/style`)}
                className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/80"
              >
                Validate Styles
              </button>
            )}
            
            {progress.styleValidated > 0 && progress.lyricsValidated < batch.tracks.length && (
              <button
                onClick={() => navigate(`/batch/${batchId}/validate/lyrics`)}
                className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/80"
              >
                Validate Lyrics
              </button>
            )}
            
            {progress.lyricsValidated > 0 && progress.audioValidated < batch.tracks.length && (
              <button
                onClick={() => navigate(`/batch/${batchId}/validate/audio`)}
                className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/80"
              >
                Validate Audio
              </button>
            )}
          </div>
          
          {progress.finalTracks > 0 && (
            <button
              onClick={() => navigate(`/batch/${batchId}/player`)}
              className="px-4 py-2 bg-music-green text-white rounded-md hover:bg-music-green/90"
            >
              View Final Player
            </button>
          )}
        </div>
      </div>
      
      <h2 className="text-2xl font-bold mb-4">Tracks ({batch.tracks.length})</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batch.tracks.map((track, index) => (
          <TrackCard 
            key={track.id}
            track={track}
            batchId={batchId!}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default BatchOverview;
