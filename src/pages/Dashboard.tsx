
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBatches, getAllPlaylists, exportBatchesToCSV, exportPlaylistsToCSV } from '../services/mockApi';
import { Batch, getBatchProgress } from '../mock/fakeBatches';
import { Playlist } from '../mock/fakePlaylists';
import { downloadCSV } from '../utils/statusHelpers';
import { toast } from 'sonner';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportingBatches, setExportingBatches] = useState(false);
  const [exportingPlaylists, setExportingPlaylists] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedBatches, fetchedPlaylists] = await Promise.all([
          getAllBatches(),
          getAllPlaylists()
        ]);
        
        setBatches(fetchedBatches);
        setPlaylists(fetchedPlaylists);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleExportBatches = async () => {
    setExportingBatches(true);
    
    try {
      const csvContent = await exportBatchesToCSV();
      downloadCSV(csvContent, "batches-export.csv");
      toast.success("Batches exported successfully");
    } catch (error) {
      console.error("Error exporting batches:", error);
      toast.error("Failed to export batches");
    } finally {
      setExportingBatches(false);
    }
  };
  
  const handleExportPlaylists = async () => {
    setExportingPlaylists(true);
    
    try {
      const csvContent = await exportPlaylistsToCSV();
      downloadCSV(csvContent, "playlists-export.csv");
      toast.success("Playlists exported successfully");
    } catch (error) {
      console.error("Error exporting playlists:", error);
      toast.error("Failed to export playlists");
    } finally {
      setExportingPlaylists(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center">
        <div className="animate-pulse text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Music Generation Dashboard</h1>
          <p className="text-gray-400">
            Manage your AI-generated music tracks and playlists
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/create')}
            className="px-4 py-2 bg-music-purple text-white rounded-md hover:bg-music-purple/90"
          >
            Create New Batch
          </button>
          
          <button
            onClick={handleExportBatches}
            disabled={exportingBatches || batches.length === 0}
            className={`px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/80
              ${(exportingBatches || batches.length === 0) ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {exportingBatches ? 'Exporting...' : 'Export Batches'}
          </button>
          
          <button
            onClick={handleExportPlaylists}
            disabled={exportingPlaylists || playlists.length === 0}
            className={`px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/80
              ${(exportingPlaylists || playlists.length === 0) ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {exportingPlaylists ? 'Exporting...' : 'Export Playlists'}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold mb-3">Total Batches</h3>
          <div className="flex items-end">
            <span className="text-4xl font-bold">{batches.length}</span>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold mb-3">Total Tracks</h3>
          <div className="flex items-end">
            <span className="text-4xl font-bold">
              {batches.reduce((sum, batch) => sum + batch.tracks.length, 0)}
            </span>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold mb-3">Total Playlists</h3>
          <div className="flex items-end">
            <span className="text-4xl font-bold">{playlists.length}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Recent Batches</h2>
          
          {batches.length === 0 ? (
            <div className="bg-card rounded-lg border border-border p-6 text-center">
              <p className="mb-4">No batches created yet</p>
              <button
                onClick={() => navigate('/create')}
                className="px-4 py-2 bg-music-purple text-white rounded-md"
              >
                Create Your First Batch
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {batches.slice(0, 5).map((batch) => {
                const progress = getBatchProgress(batch);
                
                return (
                  <div
                    key={batch.id}
                    className="bg-card rounded-lg border border-border p-6 hover:border-music-purple transition-colors cursor-pointer"
                    onClick={() => navigate(`/batch/${batch.id}`)}
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3">
                      <h3 className="text-xl font-medium">{batch.name}</h3>
                      <span className="text-sm text-gray-400">
                        {batch.tracks.length} track{batch.tracks.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                        Theme: {batch.themePrompt}
                      </span>
                      <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                        Style: {batch.stylePrompt}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Theme</span>
                          <span>{progress.themeValidated}/{batch.tracks.length}</span>
                        </div>
                        <div className="w-full bg-music-gray rounded-full h-1.5">
                          <div 
                            className="bg-music-purple h-1.5 rounded-full" 
                            style={{ width: `${progress.themeProgress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Style</span>
                          <span>{progress.styleValidated}/{batch.tracks.length}</span>
                        </div>
                        <div className="w-full bg-music-gray rounded-full h-1.5">
                          <div 
                            className="bg-music-purple h-1.5 rounded-full" 
                            style={{ width: `${progress.styleProgress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Lyrics</span>
                          <span>{progress.lyricsValidated}/{batch.tracks.length}</span>
                        </div>
                        <div className="w-full bg-music-gray rounded-full h-1.5">
                          <div 
                            className="bg-music-purple h-1.5 rounded-full" 
                            style={{ width: `${progress.lyricsProgress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Audio</span>
                          <span>{progress.audioValidated}/{batch.tracks.length}</span>
                        </div>
                        <div className="w-full bg-music-gray rounded-full h-1.5">
                          <div 
                            className="bg-music-purple h-1.5 rounded-full" 
                            style={{ width: `${progress.audioProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-sm text-right">
                      <span className="text-gray-400">Created:</span> {batch.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
              
              {batches.length > 5 && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => navigate('/batches')}
                    className="text-music-purple hover:underline"
                  >
                    View All Batches
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold mb-4">Playlists</h2>
          
          <div className="bg-card rounded-lg border border-border p-6">
            {playlists.length === 0 ? (
              <div className="text-center py-8">
                <p className="mb-4">No playlists created yet</p>
                <button
                  onClick={() => navigate('/playlists')}
                  className="px-4 py-2 bg-music-purple text-white rounded-md"
                >
                  Create Your First Playlist
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="p-4 rounded-lg bg-secondary hover:bg-secondary/80 cursor-pointer"
                    onClick={() => navigate(`/playlist/${playlist.id}`)}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{playlist.name}</h3>
                      <span className="text-xs bg-music-dark px-2 py-1 rounded-full">
                        {playlist.trackIds.length} track{playlist.trackIds.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    {playlist.description && (
                      <p className="text-sm text-gray-400 mt-1 truncate">
                        {playlist.description}
                      </p>
                    )}
                  </div>
                ))}
                
                <button
                  onClick={() => navigate('/playlists')}
                  className="w-full px-4 py-2 bg-music-purple text-white rounded-md mt-2"
                >
                  View All Playlists
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
