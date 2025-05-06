
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import CreateBatch from "./pages/CreateBatch";
import BatchOverview from "./pages/BatchOverview"; 
import ValidationPage from "./pages/ValidationPage";
import AudioValidation from "./pages/AudioValidation";
import PlaylistAssignment from "./pages/PlaylistAssignment";
import FinalPlayer from "./pages/FinalPlayer";
import PlaylistsPage from "./pages/PlaylistsPage";
import TrackDetail from "./pages/TrackDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-background">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/create" element={<CreateBatch />} />
              <Route path="/batch/:batchId" element={<BatchOverview />} />
              <Route path="/batch/:batchId/validate/:field" element={<ValidationPage />} />
              <Route path="/batch/:batchId/validate/audio" element={<AudioValidation />} />
              <Route path="/batch/:batchId/playlists" element={<PlaylistAssignment />} />
              <Route path="/batch/:batchId/player" element={<FinalPlayer />} />
              <Route path="/batch/:batchId/track/:trackId" element={<TrackDetail />} />
              <Route path="/playlists" element={<PlaylistsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
