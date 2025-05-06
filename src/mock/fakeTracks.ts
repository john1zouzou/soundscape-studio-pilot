
export interface AudioVersion {
  id: string;
  url: string;
  status: 'pending' | 'validated' | 'rejected';
}

export interface Track {
  id: string;
  theme: string;
  style: string;
  lyrics: string;
  status_theme: 'pending' | 'validated' | 'rejected';
  status_style: 'pending' | 'validated' | 'rejected';
  status_lyrics: 'pending' | 'validated' | 'rejected';
  audio_versions: AudioVersion[];
  final_audio_url?: string;
}

// Set of fake audio URLs
const fakeAudioUrls = [
  "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg",
  "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg",
  "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
  "https://actions.google.com/sounds/v1/ambiences/machine_hum.ogg",
  "https://actions.google.com/sounds/v1/ambiences/piano_background.ogg"
];

// Function to get a random audio URL from the list
const getRandomAudioUrl = () => {
  const randomIndex = Math.floor(Math.random() * fakeAudioUrls.length);
  return fakeAudioUrls[randomIndex];
};

// Sample lyric snippets for track generation
const fakeLyricSnippets = [
  "In the shadows of tomorrow, we find our light today",
  "Dancing through the memories of what could have been",
  "The rhythm of your heartbeat guides me home",
  "Lost in the echo of forgotten dreams",
  "When stars align and worlds collide, we'll find our way",
  "Through stormy seas and desert sands, I'll search for you",
  "Chasing whispers in the wind, seeking truths untold",
  "The melody of life plays on in endless harmony",
  "Breaking chains that bind us to the past",
  "In the silence between notes, your voice still resonates"
];

// Function to get a random lyric snippet
const getRandomLyricSnippet = () => {
  const randomIndex = Math.floor(Math.random() * fakeLyricSnippets.length);
  return fakeLyricSnippets[randomIndex];
};

// Generate a single track with initial pending status
export const generateTrack = (themePrompt: string, stylePrompt: string, lyricsPrompt: string): Track => {
  return {
    id: Math.random().toString(36).substr(2, 9),
    theme: `${themePrompt} - ${getRandomLyricSnippet()}`,
    style: `${stylePrompt} with modern production elements`,
    lyrics: `"${getRandomLyricSnippet()}\n${getRandomLyricSnippet()}\n${getRandomLyricSnippet()}"`,
    status_theme: 'pending',
    status_style: 'pending',
    status_lyrics: 'pending',
    audio_versions: [
      {
        id: `audio1-${Math.random().toString(36).substr(2, 9)}`,
        url: getRandomAudioUrl(),
        status: 'pending'
      },
      {
        id: `audio2-${Math.random().toString(36).substr(2, 9)}`,
        url: getRandomAudioUrl(),
        status: 'pending'
      }
    ]
  };
};

// Generate multiple tracks at once for a batch
export const generateTracks = (
  count: number, 
  themePrompt: string, 
  stylePrompt: string, 
  lyricsPrompt: string
): Track[] => {
  return Array.from({ length: count }).map(() => 
    generateTrack(themePrompt, stylePrompt, lyricsPrompt)
  );
};

// Regenerate a theme for a track
export const regenerateTheme = (track: Track, themePrompt: string): Track => {
  return {
    ...track,
    theme: `${themePrompt} - ${getRandomLyricSnippet()}`,
    status_theme: 'pending'
  };
};

// Regenerate a style for a track
export const regenerateStyle = (track: Track, stylePrompt: string): Track => {
  return {
    ...track,
    style: `${stylePrompt} with ${Math.random() > 0.5 ? 'classic' : 'innovative'} elements`,
    status_style: 'pending'
  };
};

// Regenerate lyrics for a track
export const regenerateLyrics = (track: Track, lyricsPrompt: string): Track => {
  return {
    ...track,
    lyrics: `"${getRandomLyricSnippet()}\n${getRandomLyricSnippet()}\n${getRandomLyricSnippet()}"`,
    status_lyrics: 'pending'
  };
};

// Regenerate audio versions for a track
export const regenerateAudio = (track: Track): Track => {
  return {
    ...track,
    audio_versions: [
      {
        id: `audio1-${Math.random().toString(36).substr(2, 9)}`,
        url: getRandomAudioUrl(),
        status: 'pending'
      },
      {
        id: `audio2-${Math.random().toString(36).substr(2, 9)}`,
        url: getRandomAudioUrl(),
        status: 'pending'
      }
    ]
  };
};
