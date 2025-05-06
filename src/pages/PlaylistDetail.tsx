
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlaylistById, getTracksByIds, removeTrackFromPlaylist } from '../services/mockApi';
import { Playlist } from '../mock/fakePlaylists';
import { Track } from '../mock/fakeTracks';
import { toast } from 'sonner';

const PlaylistDetail: React.FC = () => {
  const { playlistId } = useParams<{ playlistId: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        if (!playlistId) {
          toast.error("Playlist ID is missing");
          navigate('/playlists');
          return;
        }

        const fetchedPlaylist = await getPlaylistById(playlistId);
        if (fetchedPlaylist) {
          setPlaylist(fetchedPlaylist);
          
          // Fetch tracks only if there are any
          if (fetchedPlaylist.trackIds.length > 0) {
            const fetchedTracks = await getTracksByIds(fetchedPlaylist.trackIds);
            setTracks(fetchedTracks);
          }
        } else {
          toast.error("Playlist not found");
          navigate('/playlists');
        }
      } catch (error) {
        console.error("Error fetching playlist:", error);
        toast.error("Failed to load playlist data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlaylist();
  }, [playlistId, navigate]);

  const handleRemoveTrack = async (trackId: string) => {
    if (!playlist) return;
    
    setRemoving(prev => ({ ...prev, [trackId]: true }));
    
    try {
      await removeTrackFromPlaylist(playlist.id, trackId);
      
      // Update local state
      setTracks(tracks.filter(track => track.id !== trackId));
      setPlaylist({
        ...playlist,
        trackIds: playlist.trackIds.filter(id => id !== trackId)
      });
      
      toast.success("Track removed from playlist");
    } catch (error) {
      console.error("Error removing track:", error);
      toast.error("Failed to remove track from playlist");
    } finally {
      setRemoving(prev => ({ ...prev, [trackId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center">
        <div className="animate-pulse text-xl">Loading playlist...</div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="container py-8 text-center">
        <h2 className="text-2xl font-semibold mb-2">Playlist not found</h2>
        <p className="mb-4">The playlist you're looking for doesn't exist.</p>
        <button 
          onClick={() => navigate('/playlists')}
          className="px-4 py-2 bg-music-purple text-white rounded-md"
        >
          Back to Playlists
        </button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">{playlist.name}</h1>
          <p className="text-gray-400 mb-1">
            {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}
          </p>
          <p className="text-gray-400">
            Created on {new Date(playlist.createdAt).toLocaleDateString()}
          </p>
        </div>
        
        <button
          onClick={() => navigate('/playlists')}
          className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/80"
        >
          Back to All Playlists
        </button>
      </div>
      
      {playlist.description && (
        <div className="bg-card rounded-lg border border-border p-4 mb-6">
          <h3 className="font-medium mb-1">Description</h3>
          <p>{playlist.description}</p>
        </div>
      )}
      
      {(playlist.themePrompt || playlist.stylePrompt || playlist.lyricsPrompt) && (
        <div className="bg-card rounded-lg border border-border p-4 mb-6">
          <h3 className="font-medium mb-2">Generation Prompts</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {playlist.themePrompt && (
              <div>
                <h4 className="text-sm text-gray-400">Theme</h4>
                <p>{playlist.themePrompt}</p>
              </div>
            )}
            {playlist.stylePrompt && (
              <div>
                <h4 className="text-sm text-gray-400">Style</h4>
                <p>{playlist.stylePrompt}</p>
              </div>
            )}
            {playlist.lyricsPrompt && (
              <div>
                <h4 className="text-sm text-gray-400">Lyrics</h4>
                <p>{playlist.lyricsPrompt}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold mb-4">Tracks</h2>
        
        {tracks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No tracks in this playlist yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tracks.map((track, index) => (
              <div
                key={track.id}
                className="flex justify-between items-center p-4 bg-secondary rounded-lg hover:bg-secondary/70 transition-colors"
              >
                <div>
                  <h3 className="font-medium">Track {index + 1}</h3>
                  <div className="text-sm text-gray-400 mt-1">
                    Theme: {track.theme}
                  </div>
                  {track.final_audio_url && (
                    <div className="mt-2">
                      <audio 
                        controls 
                        className="h-8 w-full max-w-md" 
                        src={track.final_audio_url}
                      />
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => handleRemoveTrack(track.id)}
                  disabled={removing[track.id]}
                  className={`px-3 py-1 text-sm rounded-md ${removing[track.id] ? 'bg-gray-500 cursor-not-allowed' : 'bg-music-red hover:bg-music-red/80'}`}
                >
                  {removing[track.id] ? 'Removing...' : 'Remove'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistDetail;
