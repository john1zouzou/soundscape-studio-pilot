
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getBatchById, 
  getAllPlaylists, 
  createNewPlaylist, 
  addTracksToPlaylist 
} from '../services/mockApi';
import { Batch } from '../mock/fakeBatches';
import { Playlist } from '../mock/fakePlaylists';
import { Track } from '../mock/fakeTracks';
import { isTrackFullyValidated } from '../utils/statusHelpers';
import { toast } from 'sonner';
import { Checkbox } from '../components/ui/checkbox';

const PlaylistAssignment: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [assigning, setAssigning] = useState(false);
  
  // Form state
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [showNewPlaylistForm, setShowNewPlaylistForm] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (batchId) {
          // Fetch batch and playlists in parallel
          const [fetchedBatch, fetchedPlaylists] = await Promise.all([
            getBatchById(batchId),
            getAllPlaylists()
          ]);
          
          if (fetchedBatch) {
            setBatch(fetchedBatch);
            
            // Pre-select all fully validated tracks
            const validatedTrackIds = fetchedBatch.tracks
              .filter(isTrackFullyValidated)
              .map(track => track.id);
            
            setSelectedTracks(validatedTrackIds);
          } else {
            toast.error("Batch not found");
            navigate('/');
          }
          
          setPlaylists(fetchedPlaylists);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [batchId, navigate]);
  
  // Toggle track selection
  const toggleTrackSelection = (trackId: string) => {
    if (selectedTracks.includes(trackId)) {
      setSelectedTracks(selectedTracks.filter(id => id !== trackId));
    } else {
      setSelectedTracks([...selectedTracks, trackId]);
    }
  };
  
  // Toggle all tracks
  const toggleAllTracks = () => {
    if (!batch) return;
    
    const validatedTracks = batch.tracks.filter(isTrackFullyValidated);
    
    if (selectedTracks.length === validatedTracks.length) {
      setSelectedTracks([]);
    } else {
      setSelectedTracks(validatedTracks.map(track => track.id));
    }
  };
  
  // Toggle playlist selection
  const togglePlaylistSelection = (playlistId: string) => {
    if (selectedPlaylists.includes(playlistId)) {
      setSelectedPlaylists(selectedPlaylists.filter(id => id !== playlistId));
    } else {
      setSelectedPlaylists([...selectedPlaylists, playlistId]);
    }
  };
  
  // Handle new playlist checkbox
  const toggleNewPlaylist = (checked: boolean) => {
    setShowNewPlaylistForm(checked);
    if (!checked) {
      setNewPlaylistName('');
      setNewPlaylistDescription('');
    }
  };
  
  // Create new playlist
  const handleCreatePlaylist = async () => {
    if (!newPlaylistName) {
      toast.error("Please enter a playlist name");
      return;
    }
    
    setCreatingPlaylist(true);
    
    try {
      const newPlaylist = await createNewPlaylist(
        newPlaylistName,
        newPlaylistDescription,
        batch?.themePrompt,
        batch?.stylePrompt,
        batch?.lyricsPrompt
      );
      
      setPlaylists([...playlists, newPlaylist]);
      setSelectedPlaylists([...selectedPlaylists, newPlaylist.id]);
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
  
  // Assign tracks to playlists
  const handleAssignTracks = async () => {
    if (selectedTracks.length === 0) {
      toast.error("Please select at least one track");
      return;
    }
    
    if (selectedPlaylists.length === 0) {
      toast.error("Please select at least one playlist");
      return;
    }
    
    setAssigning(true);
    
    try {
      // For each selected playlist, add the tracks
      const promises = selectedPlaylists.map(playlistId => 
        addTracksToPlaylist(playlistId, selectedTracks)
      );
      
      const results = await Promise.all(promises);
      
      // Update the playlists in state
      const updatedPlaylists = playlists.map(p => {
        const updatedPlaylist = results.find(up => up.id === p.id);
        return updatedPlaylist || p;
      });
      
      setPlaylists(updatedPlaylists);
      
      toast.success(
        `${selectedTracks.length} track${selectedTracks.length !== 1 ? 's' : ''} added to ${selectedPlaylists.length} playlist${selectedPlaylists.length !== 1 ? 's' : ''}`
      );
    } catch (error) {
      console.error("Error assigning tracks:", error);
      toast.error("Failed to assign tracks to playlists");
    } finally {
      setAssigning(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center">
        <div className="animate-pulse text-xl">Loading playlist assignment...</div>
      </div>
    );
  }
  
  if (!batch) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Batch not found</h2>
          <p className="mb-4">The batch you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-music-purple text-white rounded-md"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  const validatedTracks = batch.tracks.filter(isTrackFullyValidated);
  const areAllSelected = selectedTracks.length === validatedTracks.length && validatedTracks.length > 0;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">Playlist Assignment</h1>
          <p className="text-gray-400">
            Batch: {batch.name}
          </p>
        </div>
        
        <button
          onClick={() => navigate(`/batch/${batchId}`)}
          className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/80"
        >
          Back to Overview
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg border border-border p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Validated Tracks ({validatedTracks.length})
              </h2>
              
              {validatedTracks.length > 0 && (
                <button
                  onClick={toggleAllTracks}
                  className="text-sm text-music-purple hover:underline"
                >
                  {areAllSelected ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>
            
            {validatedTracks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">
                  No validated tracks available.
                </p>
                <p className="mt-2">
                  Complete the validation process first.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {validatedTracks.map((track) => {
                  const isSelected = selectedTracks.includes(track.id);
                  const trackIndex = batch.tracks.findIndex(t => t.id === track.id);
                  
                  return (
                    <div
                      key={track.id}
                      className={`p-4 rounded-lg border ${
                        isSelected ? 'border-music-purple bg-music-purple/10' : 'border-border bg-secondary'
                      } flex items-center justify-between cursor-pointer transition-colors`}
                      onClick={() => toggleTrackSelection(track.id)}
                    >
                      <div className="flex items-center">
                        <Checkbox
                          id={`track-${track.id}`}
                          checked={isSelected}
                          onCheckedChange={() => toggleTrackSelection(track.id)}
                          className="mr-3 h-4 w-4 rounded text-music-purple focus:ring-music-purple"
                        />
                        <div>
                          <h3 className="font-medium">Track {trackIndex + 1}</h3>
                          <p className="text-sm text-gray-400 truncate max-w-md">{track.theme}</p>
                        </div>
                      </div>
                      
                      <div className="text-sm text-music-green">
                        Validated
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg border border-border p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4">
              Assign to Playlists
            </h2>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3 text-gray-200">
                Select Playlists
              </h3>
              
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2 mb-4">
                {playlists.map(playlist => (
                  <div 
                    key={playlist.id}
                    className={`flex items-center p-3 rounded-md cursor-pointer ${
                      selectedPlaylists.includes(playlist.id) ? 'bg-music-purple/10 border border-music-purple' : 'bg-secondary hover:bg-secondary/70 border border-transparent'
                    }`}
                    onClick={() => togglePlaylistSelection(playlist.id)}
                  >
                    <Checkbox
                      id={`playlist-${playlist.id}`}
                      checked={selectedPlaylists.includes(playlist.id)}
                      onCheckedChange={() => togglePlaylistSelection(playlist.id)}
                      className="mr-3 h-4 w-4 rounded text-music-purple focus:ring-music-purple"
                    />
                    <div>
                      <label htmlFor={`playlist-${playlist.id}`} className="font-medium cursor-pointer">
                        {playlist.name}
                      </label>
                      <p className="text-xs text-gray-400">
                        {playlist.trackIds.length} tracks
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div 
                className={`flex items-center p-3 rounded-md cursor-pointer mb-2 ${
                  showNewPlaylistForm ? 'bg-music-purple/10 border border-music-purple' : 'bg-secondary hover:bg-secondary/70 border border-transparent'
                }`}
                onClick={() => toggleNewPlaylist(!showNewPlaylistForm)}
              >
                <Checkbox
                  id="new-playlist"
                  checked={showNewPlaylistForm}
                  onCheckedChange={(checked) => toggleNewPlaylist(!!checked)}
                  className="mr-3 h-4 w-4 rounded text-music-purple focus:ring-music-purple"
                />
                <label htmlFor="new-playlist" className="font-medium cursor-pointer">
                  ➕ Create New Playlist
                </label>
              </div>
            </div>
            
            {showNewPlaylistForm && (
              <div className="space-y-4 mb-4 bg-secondary p-4 rounded-md">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-200">
                    Playlist Name
                  </label>
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="Enter playlist name"
                    className="w-full bg-music-dark px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-music-purple"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-200">
                    Description
                  </label>
                  <textarea
                    value={newPlaylistDescription}
                    onChange={(e) => setNewPlaylistDescription(e.target.value)}
                    placeholder="Enter description"
                    rows={3}
                    className="w-full bg-music-dark px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-music-purple"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-200">
                    Prompts
                  </label>
                  <div className="text-sm bg-music-dark p-2 rounded-md">
                    <div className="mb-1"><span className="text-gray-400">Theme:</span> {batch.themePrompt}</div>
                    <div className="mb-1"><span className="text-gray-400">Style:</span> {batch.stylePrompt}</div>
                    <div><span className="text-gray-400">Lyrics:</span> {batch.lyricsPrompt}</div>
                  </div>
                </div>
                
                <button
                  onClick={handleCreatePlaylist}
                  disabled={!newPlaylistName || creatingPlaylist}
                  className={`w-full px-4 py-2 bg-music-purple text-white rounded-md hover:bg-music-purple/90
                    ${(!newPlaylistName || creatingPlaylist) ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {creatingPlaylist ? 'Creating...' : 'Create Playlist'}
                </button>
              </div>
            )}
            
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-1">
                {selectedTracks.length} track{selectedTracks.length !== 1 ? 's' : ''} selected
              </p>
              
              <p className="text-sm text-gray-400">
                {selectedPlaylists.length} playlist{selectedPlaylists.length !== 1 ? 's' : ''} selected
              </p>
            </div>
            
            <button
              onClick={handleAssignTracks}
              disabled={selectedTracks.length === 0 || selectedPlaylists.length === 0 || assigning}
              className={`w-full px-4 py-2 bg-music-green text-white rounded-md hover:bg-music-green/90
                ${(selectedTracks.length === 0 || selectedPlaylists.length === 0 || assigning) ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {assigning ? 'Assigning...' : 'Assign Tracks'}
            </button>
            
            <button
              onClick={() => navigate('/playlists')}
              className="w-full px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/80 mt-2"
            >
              View All Playlists
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistAssignment;
