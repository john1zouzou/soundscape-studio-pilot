
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBatchById } from '../services/mockApi';
import { Batch } from '../mock/fakeBatches';
import { Track } from '../mock/fakeTracks';
import { isTrackFullyValidated } from '../utils/statusHelpers';
import AudioPlayer from '../components/AudioPlayer';
import { toast } from 'sonner';

const FinalPlayer: React.FC = () => {
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
        <div className="animate-pulse text-xl">Loading final player...</div>
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
  
  const validatedTracks = batch.tracks.filter(isTrackFullyValidated);

  return (
    <div className="container py-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">Final Player</h1>
          <p className="text-gray-400">
            Batch: {batch.name}
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => navigate(`/batch/${batchId}/playlists`)}
            className="px-4 py-2 bg-music-purple text-white rounded-md hover:bg-music-purple/90"
          >
            Assign to Playlists
          </button>
          
          <button
            onClick={() => navigate(`/batch/${batchId}`)}
            className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/80"
          >
            Back to Overview
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Batch Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Theme Prompt</h3>
              <p>{batch.themePrompt}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Style Prompt</h3>
              <p>{batch.stylePrompt}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Lyrics Prompt</h3>
              <p>{batch.lyricsPrompt}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-gray-400">
              {validatedTracks.length} of {batch.tracks.length} tracks fully validated
            </p>
          </div>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold mb-4">Validated Tracks ({validatedTracks.length})</h2>
      
      {validatedTracks.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <h2 className="text-xl font-semibold mb-2">No validated tracks available</h2>
          <p className="mb-4 text-gray-400">
            Complete the validation process for at least one track.
          </p>
          <button 
            onClick={() => navigate(`/batch/${batchId}`)}
            className="px-4 py-2 bg-music-purple text-white rounded-md"
          >
            Back to Batch Overview
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {validatedTracks.map((track, index) => {
            const trackIndex = batch.tracks.findIndex(t => t.id === track.id);
            
            // Find the validated audio version
            const validatedAudio = track.audio_versions.find(av => av.status === 'validated');
            
            return (
              <div
                key={track.id}
                className="bg-card rounded-lg border border-border p-6"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                  <h3 className="text-xl font-semibold">
                    Track {trackIndex + 1}
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Theme</h4>
                    <p className="bg-secondary rounded-md p-3">{track.theme}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Style</h4>
                    <p className="bg-secondary rounded-md p-3">{track.style}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Lyrics</h4>
                  <div className="bg-secondary rounded-md p-3">
                    <pre className="whitespace-pre-wrap break-words text-sm">
                      {track.lyrics}
                    </pre>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Audio</h4>
                  {validatedAudio ? (
                    <AudioPlayer
                      url={validatedAudio.url}
                      status="validated"
                    />
                  ) : (
                    <div className="text-red-500">Audio not found</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FinalPlayer;
