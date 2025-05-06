
export interface Prompt {
  id: string;
  category: 'theme' | 'style' | 'lyrics';
  title: string;
  description: string;
}

export const fakePrompts: Prompt[] = [
  // Theme prompts
  {
    id: "theme-1",
    category: "theme",
    title: "Love and Romance",
    description: "Songs about falling in love, heartbreak, and romantic relationships."
  },
  {
    id: "theme-2",
    category: "theme",
    title: "Adventure and Journey",
    description: "Songs about exploration, travel, and personal growth."
  },
  {
    id: "theme-3",
    category: "theme",
    title: "Hope and Inspiration",
    description: "Uplifting songs about overcoming challenges and finding hope."
  },
  {
    id: "theme-4",
    category: "theme",
    title: "Social Commentary",
    description: "Songs that reflect on society, culture, and current events."
  },
  {
    id: "theme-5",
    category: "theme",
    title: "Nature and Environment",
    description: "Songs celebrating the natural world and environmental awareness."
  },

  // Style prompts
  {
    id: "style-1",
    category: "style",
    title: "Pop",
    description: "Catchy, commercial, mainstream sound with hooks and repetitive structures."
  },
  {
    id: "style-2",
    category: "style",
    title: "Rock",
    description: "Guitar-driven with strong drums and powerful vocals."
  },
  {
    id: "style-3",
    category: "style",
    title: "Hip-Hop",
    description: "Rhythm-focused with rap vocals, beats, and samples."
  },
  {
    id: "style-4",
    category: "style",
    title: "Electronic",
    description: "Synthesizer-based with digital production and dance beats."
  },
  {
    id: "style-5",
    category: "style",
    title: "Folk",
    description: "Acoustic instruments with storytelling lyrics and traditional elements."
  },

  // Lyrics prompts
  {
    id: "lyrics-1",
    category: "lyrics",
    title: "Narrative",
    description: "Tells a story with characters, plot, and resolution."
  },
  {
    id: "lyrics-2",
    category: "lyrics",
    title: "Emotional",
    description: "Focuses on expressing feelings and personal experiences."
  },
  {
    id: "lyrics-3",
    category: "lyrics",
    title: "Symbolic",
    description: "Uses metaphors and imagery to convey deeper meanings."
  },
  {
    id: "lyrics-4",
    category: "lyrics",
    title: "Direct",
    description: "Straightforward messaging with clear intentions."
  },
  {
    id: "lyrics-5",
    category: "lyrics",
    title: "Abstract",
    description: "Open to interpretation with poetic and non-linear elements."
  }
];

export const getPromptsByCategory = (category: 'theme' | 'style' | 'lyrics'): Prompt[] => {
  return fakePrompts.filter(prompt => prompt.category === category);
};

export const getPromptById = (id: string): Prompt | undefined => {
  return fakePrompts.find(prompt => prompt.id === id);
};
