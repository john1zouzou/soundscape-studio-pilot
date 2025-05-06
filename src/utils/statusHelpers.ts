
import { Track } from "../mock/fakeTracks";
import { Batch } from "../mock/fakeBatches";

// Helper functions to determine track status
export const isTrackFullyValidated = (track: Track): boolean => {
  return (
    track.status_theme === 'validated' &&
    track.status_style === 'validated' &&
    track.status_lyrics === 'validated' &&
    track.audio_versions.some(av => av.status === 'validated')
  );
};

export const isTrackReadyForAudio = (track: Track): boolean => {
  return (
    track.status_theme === 'validated' &&
    track.status_style === 'validated' &&
    track.status_lyrics === 'validated'
  );
};

export const hasValidatedAudio = (track: Track): boolean => {
  return track.audio_versions.some(av => av.status === 'validated');
};

export const areAllAudioVersionsRejected = (track: Track): boolean => {
  return track.audio_versions.every(av => av.status === 'rejected');
};

export const getStatusColor = (status: 'pending' | 'validated' | 'rejected'): string => {
  switch (status) {
    case 'pending':
      return 'bg-music-gray';
    case 'validated':
      return 'bg-music-green';
    case 'rejected':
      return 'bg-music-red';
    default:
      return 'bg-music-gray';
  }
};

export const getStatusClass = (status: 'pending' | 'validated' | 'rejected'): string => {
  switch (status) {
    case 'pending':
      return 'status-pending';
    case 'validated':
      return 'status-validated';
    case 'rejected':
      return 'status-rejected';
    default:
      return 'status-pending';
  }
};

export const countTracksWithStatus = (
  tracks: Track[], 
  field: 'theme' | 'style' | 'lyrics', 
  status: 'pending' | 'validated' | 'rejected'
): number => {
  return tracks.filter(t => t[`status_${field}`] === status).length;
};

export const countTracksWithAudioStatus = (
  tracks: Track[],
  status: 'pending' | 'validated' | 'rejected'
): number => {
  return tracks.filter(t => {
    if (status === 'validated') {
      return t.audio_versions.some(av => av.status === 'validated');
    } else if (status === 'rejected') {
      return t.audio_versions.every(av => av.status === 'rejected');
    } else {
      return t.audio_versions.every(av => av.status === 'pending');
    }
  }).length;
};

export const countFullyValidatedTracks = (tracks: Track[]): number => {
  return tracks.filter(isTrackFullyValidated).length;
};

// CSV Export helpers
export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
