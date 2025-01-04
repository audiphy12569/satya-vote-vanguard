import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "./config/web3";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "./components/Navbar";
import { Landing } from "./pages/Landing";
import { AdminDashboard } from "./pages/AdminDashboard";
import { VoterDashboard } from "./pages/VoterDashboard";
import { ElectionHistory } from "./pages/ElectionHistory";

const queryClient = new QueryClient();

const App = () => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <Navbar />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/voter" element={<VoterDashboard />} />
              <Route path="/history" element={<ElectionHistory />} />
            </Routes>
            <Toaster />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;