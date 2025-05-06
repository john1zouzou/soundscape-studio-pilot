
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBatchById, validateAudioVersion, rejectAudioVersion, regenerateTrackField } from '../services/mockApi';
import { Batch } from '../mock/fakeBatches';
import { Track } from '../mock/fakeTracks';
import BatchStepper from '../components/BatchStepper';
import AudioPlayer from '../components/AudioPlayer';
import { isTrackReadyForAudio, areAllAudioVersionsRejected } from '../utils/statusHelpers';
import { toast } from 'sonner';

const AudioValidation: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<{[key: string]: boolean}>({});
  
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
  
  // Handle validation of an audio version
  const handleValidateAudio = async (trackId: string, audioId: string) => {
    if (!batchId) return;
    
    setUpdating(prev => ({ ...prev, [trackId]: true }));
    
    try {
      await validateAudioVersion(batchId, trackId, audioId);
      
      // Update the batch in state
      const updatedBatch = await getBatchById(batchId);
      if (updatedBatch) {
        setBatch(updatedBatch);
      }
      
      toast.success("Audio version validated successfully");
    } catch (error) {
      console.error("Error validating audio:", error);
      toast.error("Failed to validate audio");
    } finally {
      setUpdating(prev => ({ ...prev, [trackId]: false }));
    }
  };
  
  // Handle rejection of an audio version
  const handleRejectAudio = async (trackId: string, audioId: string) => {
    if (!batchId) return;
    
    setUpdating(prev => ({ ...prev, [trackId]: true }));
    
    try {
      await rejectAudioVersion(batchId, trackId, audioId);
      
      // Update the batch in state
      const updatedBatch = await getBatchById(batchId);
      if (updatedBatch) {
        setBatch(updatedBatch);
      }
      
      toast.info("Audio version rejected");
    } catch (error) {
      console.error("Error rejecting audio:", error);
      toast.error("Failed to reject audio");
    } finally {
      setUpdating(prev => ({ ...prev, [trackId]: false }));
    }
  };
  
  // Handle regeneration of audio
  const handleRegenerateAudio = async (trackId: string) => {
    if (!batchId) return;
    
    setUpdating(prev => ({ ...prev, [trackId]: true }));
    
    try {
      await regenerateTrackField(batchId, trackId, 'audio');
      
      // Update the batch in state
      const updatedBatch = await getBatchById(batchId);
      if (updatedBatch) {
        setBatch(updatedBatch);
      }
      
      toast.success("Audio versions regenerated");
    } catch (error) {
      console.error("Error regenerating audio:", error);
      toast.error("Failed to regenerate audio");
    } finally {
      setUpdating(prev => ({ ...prev, [trackId]: false }));
    }
  };
  
  // Get tracks ready for audio validation
  const getReadyTracks = (): Track[] => {
    if (!batch) return [];
    
    return batch.tracks.filter(track => isTrackReadyForAudio(track));
  };
  
  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center">
        <div className="animate-pulse text-xl">Loading audio validation page...</div>
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
  
  const readyTracks = getReadyTracks();
  const pendingCount = readyTracks.filter(track => 
    track.audio_versions.every(av => av.status === 'pending')
  ).length;
  
  const validatedCount = readyTracks.filter(track => 
    track.audio_versions.some(av => av.status === 'validated')
  ).length;
  
  const rejectedCount = readyTracks.filter(track => 
    track.audio_versions.every(av => av.status === 'rejected')
  ).length;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">Validate Audio</h1>
          <p className="text-gray-400">
            Batch: {batch.name}
          </p>
        </div>
        
        <button
          onClick={() => navigate(`/batch/${batchId}`)}
          className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/80"
        >
          Back to Overview
        </button>
      </div>
      
      <div className="bg-card rounded-lg border border-border p-6 mb-8">
        <BatchStepper batch={batch} currentStep="audio" />
      </div>
      
      <div className="flex space-x-4 mb-6">
        <div className="px-3 py-1 bg-secondary rounded-md">
          <span className="font-medium">{pendingCount}</span> Pending
        </div>
        <div className="px-3 py-1 bg-music-green/20 text-music-green rounded-md">
          <span className="font-medium">{validatedCount}</span> Validated
        </div>
        <div className="px-3 py-1 bg-music-red/20 text-music-red rounded-md">
          <span className="font-medium">{rejectedCount}</span> Rejected
        </div>
      </div>
      
      <div className="space-y-8">
        {readyTracks.map((track) => {
          const trackIndex = batch.tracks.findIndex(t => t.id === track.id);
          const hasValidatedVersion = track.audio_versions.some(av => av.status === 'validated');
          const bothRejected = areAllAudioVersionsRejected(track);
          
          return (
            <div
              key={track.id}
              className="bg-card rounded-lg border border-border p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold">
                  Track {trackIndex + 1}
                </h3>
                <div>
                  <span
                    className={`status-tag ${
                      hasValidatedVersion ? 'status-validated' :
                      bothRejected ? 'status-rejected' :
                      'status-pending'
                    }`}
                  >
                    {hasValidatedVersion ? 'Validated' :
                     bothRejected ? 'Rejected' :
                     'Pending'}
                  </span>
                </div>
              </div>
              
              <div className="mb-4 space-y-2">
                <div><span className="text-gray-400">Theme:</span> {track.theme}</div>
                <div><span className="text-gray-400">Style:</span> {track.style}</div>
                <div><span className="text-gray-400">Lyrics:</span> <span className="text-sm">{track.lyrics.substring(0, 50)}...</span></div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3 text-gray-400">
                  Compare Audio Versions
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {track.audio_versions.map((audioVersion) => (
                    <div
                      key={audioVersion.id}
                      className={`${
                        hasValidatedVersion && audioVersion.status !== 'validated' ? 'opacity-50' : ''
                      }`}
                    >
                      <h5 className="text-sm font-medium mb-2">
                        Version {track.audio_versions.indexOf(audioVersion) + 1}
                      </h5>
                      
                      <AudioPlayer
                        url={audioVersion.url}
                        status={audioVersion.status}
                        onValidate={() => handleValidateAudio(track.id, audioVersion.id)}
                        onReject={() => handleRejectAudio(track.id, audioVersion.id)}
                        disabled={hasValidatedVersion || updating[track.id]}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {bothRejected && (
                <div className="flex justify-end">
                  <button
                    onClick={() => handleRegenerateAudio(track.id)}
                    disabled={updating[track.id]}
                    className={`px-4 py-2 bg-music-purple text-white rounded-md hover:bg-music-purple/90 flex items-center
                      ${updating[track.id] ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {updating[track.id] ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 2v6h-6"></path>
                          <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                          <path d="M3 22v-6h6"></path>
                          <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                        </svg>
                        Regenerate Audio
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {readyTracks.length === 0 && (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No tracks ready for audio validation</h2>
          <p className="mb-4 text-gray-400">
            Complete theme, style, and lyrics validation first.
          </p>
          <button 
            onClick={() => navigate(`/batch/${batchId}`)}
            className="px-4 py-2 bg-music-purple text-white rounded-md"
          >
            Back to Batch Overview
          </button>
        </div>
      )}
      
      {validatedCount > 0 && (
        <div className="mt-8 text-center">
          <p className="mb-4">
            {validatedCount} track{validatedCount !== 1 ? 's' : ''} {validatedCount === 1 ? 'has' : 'have'} validated audio!
          </p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => navigate(`/batch/${batchId}`)}
              className="px-4 py-2 bg-secondary text-white rounded-md"
            >
              Back to Overview
            </button>
            
            <button 
              onClick={() => navigate(`/batch/${batchId}/playlists`)}
              className="px-4 py-2 bg-music-purple text-white rounded-md"
            >
              Assign to Playlists
            </button>
            
            <button 
              onClick={() => navigate(`/batch/${batchId}/player`)}
              className="px-4 py-2 bg-music-green text-white rounded-md"
            >
              View Final Player
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioValidation;
