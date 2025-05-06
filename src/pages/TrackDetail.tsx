
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBatchById, updateTrackStatus, regenerateTrackField, validateAudioVersion, rejectAudioVersion } from '../services/mockApi';
import { Batch } from '../mock/fakeBatches';
import { Track } from '../mock/fakeTracks';
import { isTrackReadyForAudio, areAllAudioVersionsRejected, getStatusClass } from '../utils/statusHelpers';
import AudioPlayer from '../components/AudioPlayer';
import ValidationButtons from '../components/ValidationButtons';
import { toast } from 'sonner';

const TrackDetail: React.FC = () => {
  const { batchId, trackId } = useParams<{ batchId: string; trackId: string }>();
  const navigate = useNavigate();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<{[key: string]: boolean}>({});
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (batchId) {
          const fetchedBatch = await getBatchById(batchId);
          if (fetchedBatch) {
            setBatch(fetchedBatch);
            
            const foundTrack = fetchedBatch.tracks.find(t => t.id === trackId);
            if (foundTrack) {
              setTrack(foundTrack);
            } else {
              toast.error("Track not found");
              navigate(`/batch/${batchId}`);
            }
          } else {
            toast.error("Batch not found");
            navigate('/');
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load track details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [batchId, trackId, navigate]);
  
  // Handle validation of a field
  const handleValidate = async (field: 'theme' | 'style' | 'lyrics') => {
    if (!batchId || !trackId || !track) return;
    
    setUpdating(prev => ({ ...prev, [field]: true }));
    
    try {
      await updateTrackStatus(batchId, trackId, field, 'validated');
      
      // Update the track in state
      setTrack({
        ...track,
        [`status_${field}`]: 'validated' as const
      });
      
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} validated successfully`);
    } catch (error) {
      console.error(`Error validating ${field}:`, error);
      toast.error(`Failed to validate ${field}`);
    } finally {
      setUpdating(prev => ({ ...prev, [field]: false }));
    }
  };
  
  // Handle rejection of a field
  const handleReject = async (field: 'theme' | 'style' | 'lyrics') => {
    if (!batchId || !trackId || !track) return;
    
    setUpdating(prev => ({ ...prev, [field]: true }));
    
    try {
      await updateTrackStatus(batchId, trackId, field, 'rejected');
      
      // Update the track in state
      setTrack({
        ...track,
        [`status_${field}`]: 'rejected' as const
      });
      
      toast.info(`${field.charAt(0).toUpperCase() + field.slice(1)} rejected`);
    } catch (error) {
      console.error(`Error rejecting ${field}:`, error);
      toast.error(`Failed to reject ${field}`);
    } finally {
      setUpdating(prev => ({ ...prev, [field]: false }));
    }
  };
  
  // Handle regeneration of a field
  const handleRegenerate = async (field: 'theme' | 'style' | 'lyrics' | 'audio') => {
    if (!batchId || !trackId || !track) return;
    
    setUpdating(prev => ({ ...prev, [field]: true }));
    
    try {
      const updatedTrack = await regenerateTrackField(batchId, trackId, field);
      setTrack(updatedTrack);
      
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} regenerated`);
    } catch (error) {
      console.error(`Error regenerating ${field}:`, error);
      toast.error(`Failed to regenerate ${field}`);
    } finally {
      setUpdating(prev => ({ ...prev, [field]: false }));
    }
  };
  
  // Handle validation of an audio version
  const handleValidateAudio = async (audioId: string) => {
    if (!batchId || !trackId || !track) return;
    
    setUpdating(prev => ({ ...prev, audio: true }));
    
    try {
      const updatedTrack = await validateAudioVersion(batchId, trackId, audioId);
      setTrack(updatedTrack);
      
      toast.success("Audio version validated successfully");
    } catch (error) {
      console.error("Error validating audio:", error);
      toast.error("Failed to validate audio");
    } finally {
      setUpdating(prev => ({ ...prev, audio: false }));
    }
  };
  
  // Handle rejection of an audio version
  const handleRejectAudio = async (audioId: string) => {
    if (!batchId || !trackId || !track) return;
    
    setUpdating(prev => ({ ...prev, audio: true }));
    
    try {
      const updatedTrack = await rejectAudioVersion(batchId, trackId, audioId);
      setTrack(updatedTrack);
      
      toast.info("Audio version rejected");
    } catch (error) {
      console.error("Error rejecting audio:", error);
      toast.error("Failed to reject audio");
    } finally {
      setUpdating(prev => ({ ...prev, audio: false }));
    }
  };
  
  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center">
        <div className="animate-pulse text-xl">Loading track details...</div>
      </div>
    );
  }
  
  if (!batch || !track) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Track not found</h2>
          <p className="mb-4">The track you're looking for doesn't exist.</p>
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
  
  const trackIndex = batch.tracks.findIndex(t => t.id === trackId);
  const isReadyForAudio = isTrackReadyForAudio(track);
  const hasValidatedAudio = track.audio_versions.some(av => av.status === 'validated');
  const bothAudioRejected = areAllAudioVersionsRejected(track);

  return (
    <div className="container py-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">Track Details</h1>
          <p className="text-gray-400">
            Batch: {batch.name} - Track {trackIndex + 1}
          </p>
        </div>
        
        <button
          onClick={() => navigate(`/batch/${batchId}`)}
          className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/80"
        >
          Back to Batch
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Theme Validation */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Theme</h2>
            <span className={`status-tag ${getStatusClass(track.status_theme)}`}>
              {track.status_theme.charAt(0).toUpperCase() + track.status_theme.slice(1)}
            </span>
          </div>
          
          <div className="mb-6">
            <div className="bg-secondary rounded-lg p-4">
              <p>{track.theme}</p>
            </div>
          </div>
          
          <ValidationButtons
            onValidate={() => handleValidate('theme')}
            onReject={() => handleReject('theme')}
            onRegenerate={track.status_theme === 'rejected' ? () => handleRegenerate('theme') : undefined}
            status={track.status_theme}
            loading={updating['theme']}
          />
        </div>
        
        {/* Style Validation */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Style</h2>
            <span className={`status-tag ${getStatusClass(track.status_style)}`}>
              {track.status_style.charAt(0).toUpperCase() + track.status_style.slice(1)}
            </span>
          </div>
          
          <div className="mb-6">
            <div className="bg-secondary rounded-lg p-4">
              <p>{track.style}</p>
            </div>
          </div>
          
          <ValidationButtons
            onValidate={() => handleValidate('style')}
            onReject={() => handleReject('style')}
            onRegenerate={track.status_style === 'rejected' ? () => handleRegenerate('style') : undefined}
            status={track.status_style}
            loading={updating['style']}
          />
        </div>
        
        {/* Lyrics Validation */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Lyrics</h2>
            <span className={`status-tag ${getStatusClass(track.status_lyrics)}`}>
              {track.status_lyrics.charAt(0).toUpperCase() + track.status_lyrics.slice(1)}
            </span>
          </div>
          
          <div className="mb-6">
            <div className="bg-secondary rounded-lg p-4">
              <pre className="whitespace-pre-wrap break-words text-sm">
                {track.lyrics}
              </pre>
            </div>
          </div>
          
          <ValidationButtons
            onValidate={() => handleValidate('lyrics')}
            onReject={() => handleReject('lyrics')}
            onRegenerate={track.status_lyrics === 'rejected' ? () => handleRegenerate('lyrics') : undefined}
            status={track.status_lyrics}
            loading={updating['lyrics']}
          />
        </div>
        
        {/* Audio Validation */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Audio</h2>
            <span className={`status-tag ${
              hasValidatedAudio ? 'status-validated' :
              bothAudioRejected ? 'status-rejected' :
              'status-pending'
            }`}>
              {hasValidatedAudio ? 'Validated' :
               bothAudioRejected ? 'Rejected' :
               'Pending'}
            </span>
          </div>
          
          {!isReadyForAudio ? (
            <div className="text-center py-6">
              <p className="mb-4 text-gray-400">
                Complete theme, style, and lyrics validation first to unlock audio validation.
              </p>
              
              {track.status_theme !== 'validated' && (
                <div className="text-sm text-music-purple mb-2">
                  ⚠️ Theme needs validation
                </div>
              )}
              
              {track.status_style !== 'validated' && (
                <div className="text-sm text-music-purple mb-2">
                  ⚠️ Style needs validation
                </div>
              )}
              
              {track.status_lyrics !== 'validated' && (
                <div className="text-sm text-music-purple mb-2">
                  ⚠️ Lyrics need validation
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {track.audio_versions.map((audioVersion, index) => (
                  <div key={audioVersion.id}>
                    <h3 className="text-sm font-medium mb-2">Version {index + 1}</h3>
                    <AudioPlayer
                      url={audioVersion.url}
                      status={audioVersion.status}
                      onValidate={() => handleValidateAudio(audioVersion.id)}
                      onReject={() => handleRejectAudio(audioVersion.id)}
                      disabled={hasValidatedAudio || updating['audio']}
                    />
                  </div>
                ))}
              </div>
              
              {bothAudioRejected && (
                <div className="flex justify-end">
                  <button
                    onClick={() => handleRegenerate('audio')}
                    disabled={updating['audio']}
                    className={`px-4 py-2 bg-music-purple text-white rounded-md hover:bg-music-purple/90 flex items-center
                      ${updating['audio'] ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {updating['audio'] ? (
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackDetail;
