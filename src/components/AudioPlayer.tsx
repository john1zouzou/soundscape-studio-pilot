
import React, { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  url: string;
  status: 'pending' | 'validated' | 'rejected';
  onValidate?: () => void;
  onReject?: () => void;
  disabled?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  url, 
  status, 
  onValidate, 
  onReject, 
  disabled = false 
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Reset player when URL changes
    setIsPlaying(false);
    setCurrentTime(0);
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [url]);

  useEffect(() => {
    if (audioRef.current) {
      // Stop playing when disabled
      if (disabled && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      
      // When audio ends, reset
      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
        }
      };
      
      audioRef.current.addEventListener('ended', handleEnded);
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('ended', handleEnded);
        }
      };
    }
  }, [disabled, isPlaying]);

  return (
    <div className={`audio-player-container ${
      status === 'validated' ? 'ring-2 ring-music-green' :
      status === 'rejected' ? 'opacity-50' : ''
    }`}>
      <audio 
        ref={audioRef} 
        src={url} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        className="hidden"
      />
      
      <div className="flex items-center gap-3">
        <button 
          onClick={togglePlay}
          disabled={disabled}
          className={`w-8 h-8 rounded-full flex items-center justify-center
           ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-music-purple/20'}`}
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>
        
        <div className="flex-1">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            disabled={disabled}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer bg-music-gray ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          />
          <div className="flex justify-between text-xs mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration || 0)}</span>
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      {(onValidate || onReject) && status === 'pending' && (
        <div className="flex justify-end gap-2 mt-2">
          {onValidate && (
            <button 
              onClick={onValidate}
              disabled={disabled}
              className="px-3 py-1 bg-music-green text-white rounded-md text-sm hover:bg-music-green/90 
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Validate
            </button>
          )}
          
          {onReject && (
            <button 
              onClick={onReject}
              disabled={disabled}
              className="px-3 py-1 bg-music-red text-white rounded-md text-sm hover:bg-music-red/90
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reject
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
