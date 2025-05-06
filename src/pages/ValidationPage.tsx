
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getBatchById, 
  validateAllTrackField, 
  updateTrackStatus, 
  regenerateTrackField,
  regenerateAllTrackField 
} from '../services/mockApi';
import { Batch } from '../mock/fakeBatches';
import { Track } from '../mock/fakeTracks';
import BatchStepper from '../components/BatchStepper';
import ValidationButtons from '../components/ValidationButtons';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';

const ValidationPage: React.FC = () => {
  const { batchId, field } = useParams<{ batchId: string; field: 'theme' | 'style' | 'lyrics' }>();
  const navigate = useNavigate();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<{[key: string]: boolean}>({});
  const [validatingAll, setValidatingAll] = useState(false);
  const [regeneratingAll, setRegeneratingAll] = useState(false);
  
  // Filter for validation type based on the field
  const isValidField = field === 'theme' || field === 'style' || field === 'lyrics';
  
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
  
  // Handle validation of a single track
  const handleValidate = async (trackId: string) => {
    if (!batchId || !field || !isValidField) return;
    
    setUpdating(prev => ({ ...prev, [trackId]: true }));
    
    try {
      await updateTrackStatus(batchId, trackId, field, 'validated');
      
      // Update the batch in state
      if (batch) {
        const updatedTracks = batch.tracks.map(track => {
          if (track.id === trackId) {
            return {
              ...track,
              [`status_${field}`]: 'validated' as const
            };
          }
          return track;
        });
        
        setBatch({
          ...batch,
          tracks: updatedTracks
        });
      }
      
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} validated successfully`);
    } catch (error) {
      console.error(`Error validating ${field}:`, error);
      toast.error(`Failed to validate ${field}`);
    } finally {
      setUpdating(prev => ({ ...prev, [trackId]: false }));
    }
  };
  
  // Handle rejection of a single track
  const handleReject = async (trackId: string) => {
    if (!batchId || !field || !isValidField) return;
    
    setUpdating(prev => ({ ...prev, [trackId]: true }));
    
    try {
      await updateTrackStatus(batchId, trackId, field, 'rejected');
      
      // Update the batch in state
      if (batch) {
        const updatedTracks = batch.tracks.map(track => {
          if (track.id === trackId) {
            return {
              ...track,
              [`status_${field}`]: 'rejected' as const
            };
          }
          return track;
        });
        
        setBatch({
          ...batch,
          tracks: updatedTracks
        });
      }
      
      toast.info(`${field.charAt(0).toUpperCase() + field.slice(1)} rejected`);
    } catch (error) {
      console.error(`Error rejecting ${field}:`, error);
      toast.error(`Failed to reject ${field}`);
    } finally {
      setUpdating(prev => ({ ...prev, [trackId]: false }));
    }
  };
  
  // Handle regeneration of a rejected track
  const handleRegenerate = async (trackId: string) => {
    if (!batchId || !field || !isValidField) return;
    
    setUpdating(prev => ({ ...prev, [trackId]: true }));
    
    try {
      await regenerateTrackField(batchId, trackId, field);
      
      // Refetch the batch to get updated data
      const updatedBatch = await getBatchById(batchId);
      if (updatedBatch) {
        setBatch(updatedBatch);
      }
      
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} regenerated`);
    } catch (error) {
      console.error(`Error regenerating ${field}:`, error);
      toast.error(`Failed to regenerate ${field}`);
    } finally {
      setUpdating(prev => ({ ...prev, [trackId]: false }));
    }
  };
  
  // Handle regeneration of all non-validated tracks
  const handleRegenerateAll = async () => {
    if (!batchId || !field || !isValidField || !batch) return;
    
    setRegeneratingAll(true);
    
    try {
      await regenerateAllTrackField(batchId, field);
      
      // Refetch the batch to get updated data
      const updatedBatch = await getBatchById(batchId);
      if (updatedBatch) {
        setBatch(updatedBatch);
      }
      
      toast.success(`All non-validated ${field}s regenerated successfully`);
    } catch (error) {
      console.error(`Error regenerating all ${field}s:`, error);
      toast.error(`Failed to regenerate all ${field}s`);
    } finally {
      setRegeneratingAll(false);
    }
  };
  
  // Handle validation of all pending tracks
  const handleValidateAll = async () => {
    if (!batchId || !field || !isValidField || !batch) return;
    
    // Check if there are any rejected tracks
    const hasRejectedTracks = batch.tracks.some(track => 
      track[`status_${field}`] === 'rejected'
    );
    
    if (hasRejectedTracks) {
      toast.error("Cannot validate all while there are rejected tracks");
      return;
    }
    
    setValidatingAll(true);
    
    try {
      await validateAllTrackField(batchId, field);
      
      // Refetch the batch to get updated data
      const updatedBatch = await getBatchById(batchId);
      if (updatedBatch) {
        setBatch(updatedBatch);
      }
      
      toast.success(`All pending ${field}s validated successfully`);
    } catch (error) {
      console.error(`Error validating all ${field}s:`, error);
      toast.error(`Failed to validate all ${field}s`);
    } finally {
      setValidatingAll(false);
    }
  };
  
  // Get the relevant tracks for this validation step
  const getRelevantTracks = (): Track[] => {
    if (!batch) return [];
    
    // For theme validation, show all tracks
    if (field === 'theme') {
      return batch.tracks;
    }
    
    // For style validation, only show tracks with validated themes
    if (field === 'style') {
      return batch.tracks.filter(track => track.status_theme === 'validated');
    }
    
    // For lyrics validation, only show tracks with validated themes and styles
    if (field === 'lyrics') {
      return batch.tracks.filter(
        track => track.status_theme === 'validated' && track.status_style === 'validated'
      );
    }
    
    return [];
  };
  
  // Check if all tracks are validated for the current field
  const areAllValidated = (): boolean => {
    if (!batch) return false;
    
    return batch.tracks.every(track => track[`status_${field}`] === 'validated');
  };
  
  // Check if there are any rejected tracks
  const hasRejectedTracks = (): boolean => {
    if (!batch) return false;
    
    return batch.tracks.some(track => track[`status_${field}`] === 'rejected');
  };
  
  // Check if there are any non-validated tracks (rejected or pending)
  const hasNonValidatedTracks = (): boolean => {
    if (!batch) return false;
    
    return batch.tracks.some(track => track[`status_${field}`] !== 'validated');
  };
  
  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center">
        <div className="animate-pulse text-xl">Loading validation page...</div>
      </div>
    );
  }
  
  if (!batch || !isValidField) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Invalid validation page</h2>
          <p className="mb-4">The page you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate(`/batch/${batchId}`)}
            className="px-4 py-2 bg-music-purple text-white rounded-md"
          >
            Back to Batch
          </button>
        </div>
      </div>
    );
  }
  
  const relevantTracks = getRelevantTracks();
  const pendingCount = relevantTracks.filter(
    track => track[`status_${field}`] === 'pending'
  ).length;
  const validatedCount = relevantTracks.filter(
    track => track[`status_${field}`] === 'validated'
  ).length;
  const rejectedCount = relevantTracks.filter(
    track => track[`status_${field}`] === 'rejected'
  ).length;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">Validate {field.charAt(0).toUpperCase() + field.slice(1)}</h1>
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
        <BatchStepper batch={batch} currentStep={field} />
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
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
        
        <div className="flex space-x-3">
          {hasNonValidatedTracks() && (
            <button
              onClick={handleRegenerateAll}
              disabled={regeneratingAll}
              className={`px-4 py-2 bg-music-purple text-white rounded-md hover:bg-music-purple/90 flex items-center
                ${regeneratingAll ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {regeneratingAll ? (
                <>
                  <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Regenerating All...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate All Non-Validated
                </>
              )}
            </button>
          )}
          
          {pendingCount > 0 && !hasRejectedTracks() && (
            <button
              onClick={handleValidateAll}
              disabled={validatingAll}
              className={`px-4 py-2 bg-music-green text-white rounded-md hover:bg-music-green/90 flex items-center
                ${validatingAll ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {validatingAll ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Validating All...
                </>
              ) : (
                <>
                  <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Validate All Pending
                </>
              )}
            </button>
          )}
        </div>
        
        {areAllValidated() && (
          <div className="flex items-center text-music-green">
            <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            All {field}s validated
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {relevantTracks.map((track) => (
          <div
            key={track.id}
            className="bg-card rounded-lg border border-border p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold">
                Track {batch.tracks.findIndex(t => t.id === track.id) + 1}
              </h3>
              <div>
                <span
                  className={`status-tag ${
                    track[`status_${field}`] === 'validated' ? 'status-validated' :
                    track[`status_${field}`] === 'rejected' ? 'status-rejected' :
                    'status-pending'
                  }`}
                >
                  {track[`status_${field}`].charAt(0).toUpperCase() + track[`status_${field}`].slice(1)}
                </span>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2 text-gray-400">
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </h4>
              
              <div className="bg-secondary rounded-lg p-4">
                {field === 'lyrics' ? (
                  <pre className="whitespace-pre-wrap break-words text-sm">
                    {track[field]}
                  </pre>
                ) : (
                  <p>{track[field]}</p>
                )}
              </div>
            </div>
            
            <ValidationButtons
              onValidate={() => handleValidate(track.id)}
              onReject={() => handleReject(track.id)}
              onRegenerate={track[`status_${field}`] === 'rejected' ? () => handleRegenerate(track.id) : undefined}
              status={track[`status_${field}`]}
              loading={updating[track.id]}
            />
          </div>
        ))}
      </div>
      
      {relevantTracks.length === 0 && (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No tracks available for validation</h2>
          <p className="mb-4 text-gray-400">
            {field === 'style' ? 'Validate themes first before proceeding to styles.' : 
             field === 'lyrics' ? 'Validate themes and styles first before proceeding to lyrics.' :
             'No tracks found in this batch.'}
          </p>
          <button 
            onClick={() => navigate(`/batch/${batchId}`)}
            className="px-4 py-2 bg-music-purple text-white rounded-md"
          >
            Back to Batch Overview
          </button>
        </div>
      )}
      
      {areAllValidated() && relevantTracks.length > 0 && (
        <div className="mt-8 text-center">
          <p className="mb-4 text-xl">
            All {field}s have been validated! 
          </p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => navigate(`/batch/${batchId}`)}
              className="px-4 py-2 bg-secondary text-white rounded-md"
            >
              Back to Overview
            </button>
            
            {field === 'theme' && (
              <button 
                onClick={() => navigate(`/batch/${batchId}/validate/style`)}
                className="px-4 py-2 bg-music-purple text-white rounded-md"
              >
                Continue to Style Validation
              </button>
            )}
            
            {field === 'style' && (
              <button 
                onClick={() => navigate(`/batch/${batchId}/validate/lyrics`)}
                className="px-4 py-2 bg-music-purple text-white rounded-md"
              >
                Continue to Lyrics Validation
              </button>
            )}
            
            {field === 'lyrics' && (
              <button 
                onClick={() => navigate(`/batch/${batchId}/validate/audio`)}
                className="px-4 py-2 bg-music-purple text-white rounded-md"
              >
                Continue to Audio Validation
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationPage;
