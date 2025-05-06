
import { Track } from './fakeTracks';

export interface Playlist {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  themePrompt?: string;
  stylePrompt?: string;
  lyricsPrompt?: string;
  trackIds: string[];
}

export const createPlaylist = (
  name: string,
  description: string,
  themePrompt?: string,
  stylePrompt?: string,
  lyricsPrompt?: string,
  trackIds: string[] = []
): Playlist => {
  return {
    id: Math.random().toString(36).substr(2, 9),
    name,
    description,
    createdAt: new Date(),
    themePrompt,
    stylePrompt,
    lyricsPrompt,
    trackIds,
  };
};

// Sample playlists for initial state
export const initialPlaylists: Playlist[] = [
  createPlaylist(
    "Summer Vibes",
    "Upbeat tracks perfect for summer parties",
    "Adventure and Journey",
    "Pop",
    "Emotional"
  ),
  createPlaylist(
    "Chill Session",
    "Relaxed beats for focus and meditation",
    "Nature and Environment",
    "Electronic",
    "Abstract"
  ),
  createPlaylist(
    "Workout Mix",
    "High energy tracks to keep you motivated",
    "Hope and Inspiration",
    "Hip-Hop",
    "Direct"
  )
];
