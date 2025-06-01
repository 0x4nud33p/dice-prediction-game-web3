"use client";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivyProvider } from '@privy-io/react-auth';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const Home = () => (
  <PrivyProvider
    appId="clpispdty00ycl80fpueukbhl" // Valid Privy App ID format
    config={{
      appearance: {
        theme: 'dark',
        accentColor: '#676FFF',
      },
      embeddedWallets: {
        createOnLogin: 'users-without-wallets',
      },
      defaultChain: {
        id: 11155111, // Sepolia testnet
        name: 'Sepolia',
        network: 'sepolia',
        nativeCurrency: {
          decimals: 18,
          name: 'Ethereum',
          symbol: 'ETH',
        },
        rpcUrls: {
          default: {
            http: ['https://sepolia.infura.io/v3/YOUR_INFURA_KEY'], // Replace with your RPC URL
          },
        },
        blockExplorers: {
          default: { name: 'Etherscan', url: '<https://sepolia.etherscan.io>' },
        },
      },
    }}
  >
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </PrivyProvider>
);

export default Home;
