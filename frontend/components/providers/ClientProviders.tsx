"use client";

import { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";

const queryClient = new QueryClient();

const ClientProviders = ({ children }: { children: ReactNode }) => {
  return (
    <PrivyProvider
      appId={`${process.env.NEXT_PUBLIC_PRIVY_APP_ID}`}
      config={{
        appearance: { theme: "dark", accentColor: "#676FFF" },
        embeddedWallets: { createOnLogin: "users-without-wallets" },
        defaultChain: {
          id: 11155111,
          name: "Sepolia",
          network: "sepolia",
          nativeCurrency: { decimals: 18, name: "Ethereum", symbol: "ETH" },
          rpcUrls: {
            default: {
              http: [
                `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`,
              ],
            },
          },
          blockExplorers: {
            default: { name: "Etherscan", url: "https://sepolia.etherscan.io" },
          },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {children}
        </TooltipProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
};

export default ClientProviders;
