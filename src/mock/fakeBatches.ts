
import { Track } from './fakeTracks';

export interface Batch {
  id: string;
  name: string;
  createdAt: Date;
  themePrompt: string;
  stylePrompt: string;
  lyricsPrompt: string;
  tracks: Track[];
}

export const createBatch = (
  name: string,
  themePrompt: string,
  stylePrompt: string,
  lyricsPrompt: string,
  tracks: Track[]
): Batch => {
  return {
    id: Math.random().toString(36).substr(2, 9),
    name,
    createdAt: new Date(),
    themePrompt,
    stylePrompt,
    lyricsPrompt,
    tracks,
  };
};

export const getBatchProgress = (batch: Batch) => {
  const trackCount = batch.tracks.length;
  
  const themeValidated = batch.tracks.filter(t => t.status_theme === 'validated').length;
  const styleValidated = batch.tracks.filter(t => t.status_style === 'validated').length;
  const lyricsValidated = batch.tracks.filter(t => t.status_lyrics === 'validated').length;
  
  const audioValidated = batch.tracks.filter(t => 
    t.audio_versions.some(av => av.status === 'validated')
  ).length;
  
  const finalTracks = batch.tracks.filter(t => 
    t.status_theme === 'validated' && 
    t.status_style === 'validated' && 
    t.status_lyrics === 'validated' && 
    t.audio_versions.some(av => av.status === 'validated')
  ).length;
  
  return {
    total: trackCount,
    themeValidated,
    styleValidated,
    lyricsValidated,
    audioValidated,
    finalTracks,
    themeProgress: Math.round((themeValidated / trackCount) * 100),
    styleProgress: Math.round((styleValidated / trackCount) * 100),
    lyricsProgress: Math.round((lyricsValidated / trackCount) * 100),
    audioProgress: Math.round((audioValidated / trackCount) * 100),
    finalProgress: Math.round((finalTracks / trackCount) * 100),
  };
};
