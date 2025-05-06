import { Batch, createBatch, getBatchProgress } from '../mock/fakeBatches';
import { 
  Track, 
  generateTracks, 
  regenerateTheme, 
  regenerateStyle, 
  regenerateLyrics, 
  regenerateAudio 
} from '../mock/fakeTracks';
import { Playlist, initialPlaylists, createPlaylist } from '../mock/fakePlaylists';

// Simulated delay function to mimic API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Initial state
let batches: Batch[] = [];
let playlists: Playlist[] = [...initialPlaylists];

// Batch operations
export const createNewBatch = async (
  name: string,
  count: number,
  themePrompt: string,
  stylePrompt: string,
  lyricsPrompt: string
): Promise<Batch> => {
  await delay(1000); // Simulate network delay
  
  const tracks = generateTracks(count, themePrompt, stylePrompt, lyricsPrompt);
  const newBatch = createBatch(name, themePrompt, stylePrompt, lyricsPrompt, tracks);
  
  batches = [...batches, newBatch];
  return newBatch;
};

export const getAllBatches = async (): Promise<Batch[]> => {
  await delay(500);
  return [...batches];
};

export const getBatchById = async (id: string): Promise<Batch | undefined> => {
  await delay(300);
  return batches.find(batch => batch.id === id);
};

// Track operations
export const updateTrackStatus = async (
  batchId: string,
  trackId: string,
  field: 'theme' | 'style' | 'lyrics',
  status: 'validated' | 'rejected'
): Promise<Track> => {
  await delay(300);
  
  const batchIndex = batches.findIndex(b => b.id === batchId);
  if (batchIndex === -1) throw new Error("Batch not found");
  
  const trackIndex = batches[batchIndex].tracks.findIndex(t => t.id === trackId);
  if (trackIndex === -1) throw new Error("Track not found");
  
  const updatedTrack = {
    ...batches[batchIndex].tracks[trackIndex],
    [`status_${field}`]: status
  };
  
  const updatedTracks = [...batches[batchIndex].tracks];
  updatedTracks[trackIndex] = updatedTrack;
  
  batches = [
    ...batches.slice(0, batchIndex),
    {
      ...batches[batchIndex],
      tracks: updatedTracks
    },
    ...batches.slice(batchIndex + 1)
  ];
  
  return updatedTrack;
};

export const regenerateTrackField = async (
  batchId: string,
  trackId: string,
  field: 'theme' | 'style' | 'lyrics' | 'audio'
): Promise<Track> => {
  await delay(1000); // Longer delay for regeneration
  
  const batchIndex = batches.findIndex(b => b.id === batchId);
  if (batchIndex === -1) throw new Error("Batch not found");
  
  const trackIndex = batches[batchIndex].tracks.findIndex(t => t.id === trackId);
  if (trackIndex === -1) throw new Error("Track not found");
  
  let updatedTrack: Track;
  const track = batches[batchIndex].tracks[trackIndex];
  const { themePrompt, stylePrompt, lyricsPrompt } = batches[batchIndex];
  
  switch (field) {
    case 'theme':
      updatedTrack = regenerateTheme(track, themePrompt);
      break;
    case 'style':
      updatedTrack = regenerateStyle(track, stylePrompt);
      break;
    case 'lyrics':
      updatedTrack = regenerateLyrics(track, lyricsPrompt);
      break;
    case 'audio':
      updatedTrack = regenerateAudio(track);
      break;
    default:
      throw new Error("Invalid field");
  }
  
  const updatedTracks = [...batches[batchIndex].tracks];
  updatedTracks[trackIndex] = updatedTrack;
  
  batches = [
    ...batches.slice(0, batchIndex),
    {
      ...batches[batchIndex],
      tracks: updatedTracks
    },
    ...batches.slice(batchIndex + 1)
  ];
  
  return updatedTrack;
};

// New function to regenerate all non-validated tracks for a specific field
export const regenerateAllTrackField = async (
  batchId: string,
  field: 'theme' | 'style' | 'lyrics' | 'audio'
): Promise<Track[]> => {
  await delay(1500);
  
  const batchIndex = batches.findIndex(b => b.id === batchId);
  if (batchIndex === -1) throw new Error("Batch not found");
  
  const batch = batches[batchIndex];
  const { themePrompt, stylePrompt, lyricsPrompt } = batch;
  
  // Get relevant tracks based on field and previous validation state
  let relevantTracks: Track[];
  if (field === 'theme') {
    relevantTracks = batch.tracks;
  } else if (field === 'style') {
    relevantTracks = batch.tracks.filter(track => track.status_theme === 'validated');
  } else if (field === 'lyrics') {
    relevantTracks = batch.tracks.filter(
      track => track.status_theme === 'validated' && track.status_style === 'validated'
    );
  } else if (field === 'audio') {
    relevantTracks = batch.tracks.filter(
      track => track.status_theme === 'validated' && track.status_style === 'validated' && track.status_lyrics === 'validated'
    );
  } else {
    relevantTracks = [];
  }
  
  // Filter for non-validated tracks (pending or rejected)
  const tracksToRegenerate = relevantTracks.filter(track => 
    field === 'audio'
      ? !track.audio_versions.some(av => av.status === 'validated')
      : track[`status_${field}`] !== 'validated'
  );
  
  // Regenerate each track
  const updatedTracks = [...batch.tracks];
  
  for (const trackToUpdate of tracksToRegenerate) {
    const trackIndex = updatedTracks.findIndex(t => t.id === trackToUpdate.id);
    if (trackIndex === -1) continue;
    
    let updatedTrack: Track;
    
    switch (field) {
      case 'theme':
        updatedTrack = regenerateTheme(trackToUpdate, themePrompt);
        break;
      case 'style':
        updatedTrack = regenerateStyle(trackToUpdate, stylePrompt);
        break;
      case 'lyrics':
        updatedTrack = regenerateLyrics(trackToUpdate, lyricsPrompt);
        break;
      case 'audio':
        updatedTrack = regenerateAudio(trackToUpdate);
        break;
      default:
        continue;
    }
    
    updatedTracks[trackIndex] = updatedTrack;
  }
  
  batches = [
    ...batches.slice(0, batchIndex),
    {
      ...batch,
      tracks: updatedTracks
    },
    ...batches.slice(batchIndex + 1)
  ];
  
  return updatedTracks;
};

export const validateAllTrackField = async (
  batchId: string,
  field: 'theme' | 'style' | 'lyrics'
): Promise<Track[]> => {
  await delay(800);
  
  const batchIndex = batches.findIndex(b => b.id === batchId);
  if (batchIndex === -1) throw new Error("Batch not found");
  
  const updatedTracks = batches[batchIndex].tracks.map(track => {
    // Only update tracks that are pending
    if (track[`status_${field}`] === 'pending') {
      return {
        ...track,
        [`status_${field}`]: 'validated' as const
      };
    }
    return track;
  });
  
  batches = [
    ...batches.slice(0, batchIndex),
    {
      ...batches[batchIndex],
      tracks: updatedTracks
    },
    ...batches.slice(batchIndex + 1)
  ];
  
  return updatedTracks;
};

export const validateAudioVersion = async (
  batchId: string,
  trackId: string,
  audioId: string
): Promise<Track> => {
  await delay(300);
  
  const batchIndex = batches.findIndex(b => b.id === batchId);
  if (batchIndex === -1) throw new Error("Batch not found");
  
  const trackIndex = batches[batchIndex].tracks.findIndex(t => t.id === trackId);
  if (trackIndex === -1) throw new Error("Track not found");
  
  const track = batches[batchIndex].tracks[trackIndex];
  
  // Update audio versions statuses - validate selected one, reject others
  const updatedAudioVersions = track.audio_versions.map(av => {
    if (av.id === audioId) {
      return { ...av, status: 'validated' as const };
    } else {
      return { ...av, status: 'rejected' as const };
    }
  });
  
  // Set final audio URL to the validated version
  const validatedAudio = updatedAudioVersions.find(av => av.id === audioId);
  const finalAudioUrl = validatedAudio ? validatedAudio.url : undefined;
  
  const updatedTrack = {
    ...track,
    audio_versions: updatedAudioVersions,
    final_audio_url: finalAudioUrl
  };
  
  const updatedTracks = [...batches[batchIndex].tracks];
  updatedTracks[trackIndex] = updatedTrack;
  
  batches = [
    ...batches.slice(0, batchIndex),
    {
      ...batches[batchIndex],
      tracks: updatedTracks
    },
    ...batches.slice(batchIndex + 1)
  ];
  
  return updatedTrack;
};

export const rejectAudioVersion = async (
  batchId: string,
  trackId: string,
  audioId: string
): Promise<Track> => {
  await delay(300);
  
  const batchIndex = batches.findIndex(b => b.id === batchId);
  if (batchIndex === -1) throw new Error("Batch not found");
  
  const trackIndex = batches[batchIndex].tracks.findIndex(t => t.id === trackId);
  if (trackIndex === -1) throw new Error("Track not found");
  
  const track = batches[batchIndex].tracks[trackIndex];
  
  // Update the specific audio version to rejected
  const updatedAudioVersions = track.audio_versions.map(av => {
    if (av.id === audioId) {
      return { ...av, status: 'rejected' as const };
    }
    return av;
  });
  
  const updatedTrack = {
    ...track,
    audio_versions: updatedAudioVersions
  };
  
  const updatedTracks = [...batches[batchIndex].tracks];
  updatedTracks[trackIndex] = updatedTrack;
  
  batches = [
    ...batches.slice(0, batchIndex),
    {
      ...batches[batchIndex],
      tracks: updatedTracks
    },
    ...batches.slice(batchIndex + 1)
  ];
  
  return updatedTrack;
};

// Playlist operations
export const getAllPlaylists = async (): Promise<Playlist[]> => {
  await delay(500);
  return [...playlists];
};

export const getPlaylistById = async (id: string): Promise<Playlist | undefined> => {
  await delay(300);
  return playlists.find(playlist => playlist.id === id);
};

export const createNewPlaylist = async (
  name: string,
  description: string,
  themePrompt?: string,
  stylePrompt?: string,
  lyricsPrompt?: string
): Promise<Playlist> => {
  await delay(800);
  
  const newPlaylist = createPlaylist(
    name,
    description,
    themePrompt,
    stylePrompt,
    lyricsPrompt
  );
  
  playlists = [...playlists, newPlaylist];
  return newPlaylist;
};

export const addTracksToPlaylist = async (
  playlistId: string,
  trackIds: string[]
): Promise<Playlist> => {
  await delay(600);
  
  const playlistIndex = playlists.findIndex(p => p.id === playlistId);
  if (playlistIndex === -1) throw new Error("Playlist not found");
  
  const playlist = playlists[playlistIndex];
  
  // Add only unique track IDs
  const updatedTrackIds = [...new Set([...playlist.trackIds, ...trackIds])];
  
  const updatedPlaylist = {
    ...playlist,
    trackIds: updatedTrackIds
  };
  
  playlists = [
    ...playlists.slice(0, playlistIndex),
    updatedPlaylist,
    ...playlists.slice(playlistIndex + 1)
  ];
  
  return updatedPlaylist;
};

export const removeTrackFromPlaylist = async (
  playlistId: string,
  trackId: string
): Promise<Playlist> => {
  await delay(300);
  
  const playlistIndex = playlists.findIndex(p => p.id === playlistId);
  if (playlistIndex === -1) throw new Error("Playlist not found");
  
  const playlist = playlists[playlistIndex];
  
  const updatedTrackIds = playlist.trackIds.filter(id => id !== trackId);
  
  const updatedPlaylist = {
    ...playlist,
    trackIds: updatedTrackIds
  };
  
  playlists = [
    ...playlists.slice(0, playlistIndex),
    updatedPlaylist,
    ...playlists.slice(playlistIndex + 1)
  ];
  
  return updatedPlaylist;
};

// Utility function to get tracks by IDs across all batches
export const getTracksByIds = async (trackIds: string[]): Promise<Track[]> => {
  await delay(400);
  
  const allTracks = batches.flatMap(batch => batch.tracks);
  return allTracks.filter(track => trackIds.includes(track.id));
};

// CSV Export functions
export const exportBatchesToCSV = async (): Promise<string> => {
  await delay(500);
  
  let csv = "Batch ID,Batch Name,Created At,Theme Prompt,Style Prompt,Lyrics Prompt,Total Tracks,Validated Tracks\n";
  
  batches.forEach(batch => {
    const progress = getBatchProgress(batch);
    csv += `${batch.id},${batch.name},${batch.createdAt.toISOString()},${batch.themePrompt},${batch.stylePrompt},${batch.lyricsPrompt},${batch.tracks.length},${progress.finalTracks}\n`;
  });
  
  return csv;
};

export const exportPlaylistsToCSV = async (): Promise<string> => {
  await delay(500);
  
  let csv = "Playlist ID,Playlist Name,Description,Created At,Theme Prompt,Style Prompt,Lyrics Prompt,Track Count\n";
  
  playlists.forEach(playlist => {
    csv += `${playlist.id},${playlist.name},${playlist.description},${playlist.createdAt.toISOString()},${playlist.themePrompt || ""},${playlist.stylePrompt || ""},${playlist.lyricsPrompt || ""},${playlist.trackIds.length}\n`;
  });
  
  return csv;
};
