
import React from 'react';
import { Track } from '../mock/fakeTracks';
import { getStatusClass, isTrackReadyForAudio, hasValidatedAudio } from '../utils/statusHelpers';
import { Link } from 'react-router-dom';

interface TrackCardProps {
  track: Track;
  batchId: string;
  index: number;
}

const TrackCard: React.FC<TrackCardProps> = ({ track, batchId, index }) => {
  const isAudioValidated = hasValidatedAudio(track);
  const isReadyForAudio = isTrackReadyForAudio(track);
  
  // Calculate overall completion
  const completedSteps = [
    track.status_theme === 'validated',
    track.status_style === 'validated',
    track.status_lyrics === 'validated',
    isAudioValidated
  ].filter(Boolean).length;
  
  const progressPercentage = (completedSteps / 4) * 100;

  return (
    <div className="track-card">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-lg">Track {index + 1}</h3>
        <span className={`status-tag ${
          isAudioValidated ? 'status-validated' : 
          track.audio_versions.some(av => av.status === 'rejected') ? 'status-rejected' : 
          'status-pending'
        }`}>
          {isAudioValidated ? 'Validated' : 
           track.audio_versions.every(av => av.status === 'rejected') ? 'Rejected' :
           'Pending'}
        </span>
      </div>
      
      <div className="mb-4">
        <div className="h-2 w-full bg-music-gray rounded-full">
          <div 
            className="h-2 bg-music-purple rounded-full"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="text-xs mt-1 text-right text-gray-400">
          {completedSteps}/4 steps completed
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="text-center">
          <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${getStatusClass(track.status_theme)}`}></div>
          <div className="text-xs">Theme</div>
        </div>
        <div className="text-center">
          <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${getStatusClass(track.status_style)}`}></div>
          <div className="text-xs">Style</div>
        </div>
        <div className="text-center">
          <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${getStatusClass(track.status_lyrics)}`}></div>
          <div className="text-xs">Lyrics</div>
        </div>
        <div className="text-center">
          <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
            isAudioValidated ? 'status-validated' : 
            track.audio_versions.every(av => av.status === 'rejected') ? 'status-rejected' : 
            'status-pending'
          }`}></div>
          <div className="text-xs">Audio</div>
        </div>
      </div>
      
      <div className="space-y-1 text-sm mb-4">
        <div className="truncate"><span className="text-gray-400">Theme:</span> {track.theme}</div>
        <div className="truncate"><span className="text-gray-400">Style:</span> {track.style}</div>
        <div className="truncate"><span className="text-gray-400">Lyrics:</span> {track.lyrics.substring(0, 30)}...</div>
      </div>
      
      <div className="flex justify-between items-center">
        {/* Theme validation */}
        {track.status_theme !== 'validated' ? (
          <Link 
            to={`/batch/${batchId}/validate/theme`}
            className="text-xs text-music-purple hover:underline"
          >
            Validate Theme
          </Link>
        ) : null}
        
        {/* Style validation - only if theme is validated */}
        {track.status_theme === 'validated' && track.status_style !== 'validated' ? (
          <Link 
            to={`/batch/${batchId}/validate/style`}
            className="text-xs text-music-purple hover:underline"
          >
            Validate Style
          </Link>
        ) : null}
        
        {/* Lyrics validation - only if theme and style are validated */}
        {track.status_theme === 'validated' && 
         track.status_style === 'validated' && 
         track.status_lyrics !== 'validated' ? (
          <Link 
            to={`/batch/${batchId}/validate/lyrics`}
            className="text-xs text-music-purple hover:underline"
          >
            Validate Lyrics
          </Link>
        ) : null}
        
        {/* Audio validation - only if all previous steps are validated */}
        {isReadyForAudio && !isAudioValidated ? (
          <Link 
            to={`/batch/${batchId}/validate/audio`}
            className="text-xs text-music-purple hover:underline"
          >
            Validate Audio
          </Link>
        ) : null}
        
        <Link 
          to={`/batch/${batchId}/track/${track.id}`}
          className="px-3 py-1 text-xs bg-music-purple text-white rounded-md hover:bg-music-purple/90"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default TrackCard;
