import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Explore from "./pages/Explore";
import CreateDAO from "./pages/CreateDAO";
import DAODashboard from "./pages/DAODashboard";
import CreateProposal from "./pages/CreateProposal";
import ProposalView from "./pages/ProposalView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/create-dao" element={<CreateDAO />} />
          <Route path="/dao/:id" element={<DAODashboard />} />
          <Route path="/dao/:id/create-proposal" element={<CreateProposal />} />
          <Route
            path="/dao/:daoId/proposal/:proposalId"
            element={<ProposalView />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
