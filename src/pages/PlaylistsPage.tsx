
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPlaylists, createNewPlaylist, getTracksByIds } from '../services/mockApi';
import { Playlist } from '../mock/fakePlaylists';
import { Track } from '../mock/fakeTracks';
import AudioPlayer from '../components/AudioPlayer';
import { toast } from 'sonner';

const PlaylistsPage: React.FC = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  
  // New playlist form
  const [showNewPlaylistForm, setShowNewPlaylistForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  
  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const fetchedPlaylists = await getAllPlaylists();
        setPlaylists(fetchedPlaylists);
        
        // Select the first playlist by default if available
        if (fetchedPlaylists.length > 0) {
          setSelectedPlaylist(fetchedPlaylists[0]);
        }
      } catch (error) {
        console.error("Error fetching playlists:", error);
        toast.error("Failed to load playlists");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlaylists();
  }, []);
  
  // Load tracks when a playlist is selected
  useEffect(() => {
    const fetchTracks = async () => {
      if (!selectedPlaylist) {
        setPlaylistTracks([]);
        return;
      }
      
      if (selectedPlaylist.trackIds.length === 0) {
        setPlaylistTracks([]);
        return;
      }
      
      setLoadingTracks(true);
      
      try {
        const tracks = await getTracksByIds(selectedPlaylist.trackIds);
        setPlaylistTracks(tracks);
      } catch (error) {
        console.error("Error fetching tracks:", error);
        toast.error("Failed to load playlist tracks");
      } finally {
        setLoadingTracks(false);
      }
    };
    
    fetchTracks();
  }, [selectedPlaylist]);
  
  const handleSelectPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
  };
  
  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPlaylistName) {
      toast.error("Please enter a playlist name");
      return;
    }
    
    setCreatingPlaylist(true);
    
    try {
      const newPlaylist = await createNewPlaylist(
        newPlaylistName,
        newPlaylistDescription
      );
      
      setPlaylists([...playlists, newPlaylist]);
      setSelectedPlaylist(newPlaylist);
      setShowNewPlaylistForm(false);
      setNewPlaylistName('');
      setNewPlaylistDescription('');
      
      toast.success(`Playlist "${newPlaylistName}" created successfully`);
    } catch (error) {
      console.error("Error creating playlist:", error);
      toast.error("Failed to create playlist");
    } finally {
      setCreatingPlaylist(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-3xl font-bold">Playlists</h1>
        
        <button
          onClick={() => setShowNewPlaylistForm(!showNewPlaylistForm)}
          className="px-4 py-2 bg-music-purple text-white rounded-md hover:bg-music-purple/90"
        >
          {showNewPlaylistForm ? 'Cancel' : 'Create New Playlist'}
        </button>
      </div>
      
      {showNewPlaylistForm && (
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Playlist</h2>
          
          <form onSubmit={handleCreatePlaylist}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-200">
                  Playlist Name
                </label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Enter playlist name"
                  className="w-full bg-secondary px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-music-purple"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-200">
                  Description
                </label>
                <input
                  type="text"
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  placeholder="Enter description (optional)"
                  className="w-full bg-secondary px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-music-purple"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newPlaylistName || creatingPlaylist}
                className={`px-4 py-2 bg-music-green text-white rounded-md hover:bg-music-green/90
                  ${(!newPlaylistName || creatingPlaylist) ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {creatingPlaylist ? 'Creating...' : 'Create Playlist'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-pulse text-xl">Loading playlists...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border border-border p-4 sticky top-6">
              <h2 className="text-lg font-semibold mb-3 px-2">Your Playlists</h2>
              
              {playlists.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  No playlists yet
                </div>
              ) : (
                <div className="space-y-1 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
                  {playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className={`px-3 py-2 rounded-md cursor-pointer ${
                        selectedPlaylist?.id === playlist.id
                          ? 'bg-music-purple text-white'
                          : 'hover:bg-secondary'
                      }`}
                      onClick={() => handleSelectPlaylist(playlist)}
                    >
                      <div className="font-medium">{playlist.name}</div>
                      <div className="text-xs">
                        {selectedPlaylist?.id === playlist.id ? (
                          <span>
                            {playlist.trackIds.length} track{playlist.trackIds.length !== 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="text-gray-400">
                            {playlist.trackIds.length} track{playlist.trackIds.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-3">
            {selectedPlaylist ? (
              <div>
                <div className="bg-card rounded-lg border border-border p-6 mb-6">
                  <h2 className="text-2xl font-bold mb-2">{selectedPlaylist.name}</h2>
                  
                  {selectedPlaylist.description && (
                    <p className="text-gray-400 mb-4">
                      {selectedPlaylist.description}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedPlaylist.themePrompt && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">Theme</h3>
                        <p>{selectedPlaylist.themePrompt}</p>
                      </div>
                    )}
                    
                    {selectedPlaylist.stylePrompt && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">Style</h3>
                        <p>{selectedPlaylist.stylePrompt}</p>
                      </div>
                    )}
                    
                    {selectedPlaylist.lyricsPrompt && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">Lyrics</h3>
                        <p>{selectedPlaylist.lyricsPrompt}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 text-sm">
                    <span className="text-gray-400">Created:</span> {selectedPlaylist.createdAt.toLocaleDateString()}
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-4">
                  Tracks ({selectedPlaylist.trackIds.length})
                </h3>
                
                {loadingTracks ? (
                  <div className="text-center py-8">
                    <div className="animate-pulse">Loading tracks...</div>
                  </div>
                ) : selectedPlaylist.trackIds.length === 0 ? (
                  <div className="bg-card rounded-lg border border-border p-6 text-center">
                    <p className="text-gray-400 mb-4">
                      This playlist doesn't have any tracks yet.
                    </p>
                    <button
                      onClick={() => navigate('/')}
                      className="px-4 py-2 bg-music-purple text-white rounded-md"
                    >
                      Add Tracks from a Batch
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {playlistTracks.map((track, index) => (
                      <div
                        key={track.id}
                        className="bg-card rounded-lg border border-border p-6"
                      >
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                          <h4 className="text-lg font-medium">
                            Track {index + 1}
                          </h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-400 mb-1">Theme</h5>
                            <p className="text-sm">{track.theme}</p>
                          </div>
                          
                          <div>
                            <h5 className="text-sm font-medium text-gray-400 mb-1">Style</h5>
                            <p className="text-sm">{track.style}</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-400 mb-1">Lyrics</h5>
                          <div className="bg-secondary rounded-md p-3">
                            <pre className="whitespace-pre-wrap break-words text-sm">
                              {track.lyrics}
                            </pre>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-gray-400 mb-1">Audio</h5>
                          {track.audio_versions.some(av => av.status === 'validated') ? (
                            <AudioPlayer
                              url={track.audio_versions.find(av => av.status === 'validated')!.url}
                              status="validated"
                            />
                          ) : (
                            <div className="bg-secondary rounded-md p-3 text-red-500">
                              No validated audio available
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-card rounded-lg border border-border p-6 text-center">
                <h2 className="text-xl font-semibold mb-4">
                  {playlists.length === 0
                    ? 'No Playlists Yet'
                    : 'Select a Playlist'
                  }
                </h2>
                
                {playlists.length === 0 ? (
                  <p className="text-gray-400">
                    Create your first playlist to start organizing your tracks.
                  </p>
                ) : (
                  <p className="text-gray-400">
                    Choose a playlist from the sidebar to view its tracks.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistsPage;
