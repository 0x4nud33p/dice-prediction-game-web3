"use client";

import { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { 
  Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, 
  History, BarChart, Settings, Wallet 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from '@/hooks/use-toast';
import { DICE_GAME_ADDRESS, DICE_GAME_ABI } from '@/contract/contract';

const BET_AMOUNT = "0.001"; // ETH
const SEPOLIA_CHAIN_ID = 11155111; // sepolia testnet chain id

// Type definitions
type Game = {
  player: string;
  betAmount: bigint;
  prediction: number;
  result: number;
  isComplete: boolean;
  timestamp: bigint;
  won: boolean;
};

type ContractStats = {
  totalGames: bigint;
  contractBalance: bigint;
  houseEdge: bigint;
  minBet: bigint;
  maxBet: bigint;
};

const Index = () => {
  const { login, logout, ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const { toast } = useToast();
  
  // Game states
  const [selectedNumber, setSelectedNumber] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [walletBalance, setWalletBalance] = useState<string>('0');
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isSepolia, setIsSepolia] = useState(false);
  
  // New state management
  const [playerHistory, setPlayerHistory] = useState<Game[]>([]);
  const [contractStats, setContractStats] = useState<ContractStats | null>(null);
  const [houseEdge, setHouseEdge] = useState<number>(150);
  const [minBet, setMinBet] = useState<string>('0.001');
  const [maxBet, setMaxBet] = useState<string>('1');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('play');
  const [isOwner, setIsOwner] = useState<boolean>(false);

  // Initialize contract when wallet is connected
  useEffect(() => {
    if (authenticated && wallets.length > 0) {
      initializeContract();
      fetchWalletBalance();
      checkNetwork();
    }
  }, [authenticated, wallets]);

  const initializeContract = async () => {
    try {
      const wallet = wallets[0];
      const provider = await wallet.getEthereumProvider();
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const diceContract = new ethers.Contract(DICE_GAME_ADDRESS, DICE_GAME_ABI, signer);
      setContract(diceContract);
      
      // Check if connected wallet is owner
      const ownerAddress = await diceContract.owner();
      setIsOwner(ownerAddress.toLowerCase() === wallet.address.toLowerCase());
    } catch (error) {
      console.error('Failed to initialize contract:', error);
      toast({
        title: "Contract Error",
        description: "Failed to initialize smart contract",
        variant: "destructive"
      });
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const wallet = wallets[0];
      const provider = await wallet.getEthereumProvider();
      const ethersProvider = new ethers.BrowserProvider(provider);
      const address = wallet.address;
      const balance = await ethersProvider.getBalance(address);
      setWalletBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const fetchPlayerHistory = async () => {
    if (!contract || !wallets[0]?.address) return;
    
    try {
      const history = await contract.getPlayerGameHistory(wallets[0].address, 5);
      setPlayerHistory(history);
    } catch (error) {
      console.error('Failed to fetch player history:', error);
    }
  };

  const fetchContractStats = async () => {
    if (!contract) return;
    
    try {
      const stats = await contract.getContractStats();
      setContractStats({
        totalGames: stats[0],
        contractBalance: stats[1],
        houseEdge: stats[2],
        minBet: stats[3],
        maxBet: stats[4]
      });
    } catch (error) {
      console.error('Failed to fetch contract stats:', error);
    }
  };

  const checkNetwork = async () => {
    try {
      const wallet = wallets[0];
      const provider = await wallet.getEthereumProvider();
      const ethersProvider = new ethers.BrowserProvider(provider);
      const network = await ethersProvider.getNetwork();
      setIsSepolia(network.chainId === BigInt(SEPOLIA_CHAIN_ID));
    } catch (error) {
      console.error('Network check failed:', error);
      setIsSepolia(false);
    }
  };

  const updateSettings = async () => {
    if (!contract || !isOwner) return;
    
    try {
      // Update house edge
      await contract.setHouseEdge(houseEdge);
      
      // Update bet limits
      await contract.setBetLimits(
        ethers.parseEther(minBet),
        ethers.parseEther(maxBet)
      );
      
      toast({
        title: "Settings Updated",
        description: "Contract settings have been successfully updated",
      });
    } catch (error: any) {
      console.error('Update settings failed:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update settings",
        variant: "destructive"
      });
    }
  };

  const fundContract = async () => {
    if (!contract || !isOwner) return;
    
    try {
      const tx = await contract.fundContract({
        value: ethers.parseEther(minBet)
      });
      
      await tx.wait();
      fetchContractStats();
      
      toast({
        title: "Contract Funded",
        description: "Contract balance has been increased",
      });
    } catch (error: any) {
      console.error('Funding failed:', error);
      toast({
        title: "Funding Failed",
        description: error.message || "Failed to fund contract",
        variant: "destructive"
      });
    }
  };

  const withdrawFunds = async () => {
    if (!contract || !isOwner || !withdrawAmount) return;
    
    try {
      const amountWei = ethers.parseEther(withdrawAmount);
      const tx = await contract.withdrawFunds(amountWei);
      
      await tx.wait();
      fetchContractStats();
      setWithdrawAmount('');
      
      toast({
        title: "Withdrawal Successful",
        description: `You've withdrawn ${withdrawAmount} ETH`,
      });
    } catch (error: any) {
      console.error('Withdrawal failed:', error);
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to withdraw funds",
        variant: "destructive"
      });
    }
  };

  const emergencyWithdraw = async () => {
    if (!contract || !isOwner) return;
    
    try {
      const tx = await contract.emergencyWithdraw();
      await tx.wait();
      fetchContractStats();
      
      toast({
        title: "Emergency Withdrawal",
        description: "All funds have been withdrawn from the contract",
      });
    } catch (error: any) {
      console.error('Emergency withdrawal failed:', error);
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to execute emergency withdrawal",
        variant: "destructive"
      });
    }
  };

  const playGame = async () => {
    if (!contract || !wallets[0]) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    if (!isSepolia) {
      toast({
        title: "Wrong Network",
        description: "Please switch to Sepolia testnet",
        variant: "destructive"
      });
      return;
    }

    setIsPlaying(true);

    try {
      const tx = await contract.playGame(selectedNumber, {
        value: ethers.parseEther(BET_AMOUNT)
      });

      toast({
        title: "Transaction Submitted",
        description: "Your dice prediction is being processed...",
      });

      await tx.wait();

      toast({
        title: "Transaction Confirmed",
        description: "Fetching your game results...",
      });

      // Refresh data
      setTimeout(async () => {
        await fetchWalletBalance();
        await fetchPlayerHistory();
        await fetchContractStats();
        setIsPlaying(false);
      }, 3000);

    } catch (error: any) {
      console.error('Game transaction failed:', error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to submit prediction",
        variant: "destructive"
      });
      setIsPlaying(false);
    }
  };

  const renderDiceIcon = (number: number) => {
    const diceIcons = {
      1: <Dice1 className="w-8 h-8" />,
      2: <Dice2 className="w-8 h-8" />,
      3: <Dice3 className="w-8 h-8" />,
      4: <Dice4 className="w-8 h-8" />,
      5: <Dice5 className="w-8 h-8" />,
      6: <Dice6 className="w-8 h-8" />
    };
    
    return diceIcons[number as keyof typeof diceIcons] || <Dice1 className="w-8 h-8" />;
  };

  const formatEther = (value: bigint) => {
    return parseFloat(ethers.formatEther(value)).toFixed(6);
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  // Load data when contract is ready
  useEffect(() => {
    if (contract && wallets[0]?.address) {
      fetchPlayerHistory();
      fetchContractStats();
    }
  }, [contract, wallets]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="w-96 bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-white mb-4">
              🎲 Web3 Dice Game
            </CardTitle>
            <p className="text-gray-300">
              Connect your wallet to start playing
            </p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={login} 
              className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-semibold py-3 text-lg"
            >
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Dice1 className="w-6 h-6" /> Dice Game
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-white text-sm">
              <div className="flex items-center gap-1">
                <Wallet className="w-4 h-4" />
                {wallets[0]?.address?.slice(0, 6)}...{wallets[0]?.address?.slice(-4)}
              </div>
              <div>Balance: {parseFloat(walletBalance).toFixed(4)} ETH</div>
            </div>
            <Button 
              onClick={logout}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Disconnect
            </Button>
            <div className={`mt-1 px-2 py-1 rounded text-xs font-medium ${
                isSepolia ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {isSepolia ? 'Sepolia Network' : 'Wrong Network - Switch to Sepolia'}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-4 bg-white/5 backdrop-blur-lg border border-white/10">
            <TabsTrigger value="play" className="flex items-center gap-2">
              <Dice1 className="w-4 h-4" /> Play
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" /> History
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart className="w-4 h-4" /> Stats
            </TabsTrigger>
            {isOwner && (
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" /> Settings
              </TabsTrigger>
            )}
          </TabsList>

          {/* Play Tab */}
          <TabsContent value="play">
            <div className="space-y-8 mt-6">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-white text-center">
                    Predict the Dice Roll
                  </CardTitle>
                  <p className="text-gray-300 text-center">
                    Choose a number (1-6) and bet {BET_AMOUNT} ETH
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-6 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((number) => (
                      <Button
                        key={number}
                        onClick={() => setSelectedNumber(number)}
                        className={`aspect-square text-2xl font-bold transition-all ${
                          selectedNumber === number
                            ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white scale-110'
                            : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                        disabled={isPlaying}
                      >
                        {number}
                      </Button>
                    ))}
                  </div>

                  <Button
                    onClick={playGame}
                    disabled={isPlaying}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-4 text-lg"
                  >
                    {isPlaying ? 'Rolling Dice...' : `Play for ${BET_AMOUNT} ETH`}
                  </Button>
                </CardContent>
              </Card>

              {playerHistory.length > 0 && (
                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardHeader>
                    <CardTitle className="text-xl text-white text-center">
                      Your Last Game
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div className="space-y-2">
                      <p className="text-gray-300">Dice rolled:</p>
                      <div className="flex justify-center items-center gap-2">
                        {renderDiceIcon(playerHistory[0].result)}
                        <span className="text-4xl font-bold text-white">{playerHistory[0].result}</span>
                      </div>
                    </div>
                    
                    <div className={`text-2xl font-bold ${
                      playerHistory[0].won ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {playerHistory[0].won ? '🎉 You Won!' : '😢 You Lost!'}
                    </div>
                    
                    <div className="text-gray-300">
                      Your prediction: {playerHistory[0].prediction}
                    </div>
                    <div className="text-gray-300 text-sm">
                      Bet: {formatEther(playerHistory[0].betAmount)} ETH
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-white/5 backdrop-blur-lg border-white/10">
                <CardContent className="pt-6">
                  <div className="text-gray-300 text-sm space-y-2">
                    <p>• Choose a number from 1 to 6</p>
                    <p>• Place your bet of {BET_AMOUNT} ETH</p>
                    <p>• Win if your prediction matches the dice roll</p>
                    <p>• Contract Address: {DICE_GAME_ADDRESS.slice(0, 6)}...{DICE_GAME_ADDRESS.slice(-4)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 mt-6">
              <CardHeader>
                <CardTitle className="text-xl text-white text-center">
                  Your Game History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-white">Time</TableHead>
                      <TableHead className="text-white">Prediction</TableHead>
                      <TableHead className="text-white">Result</TableHead>
                      <TableHead className="text-white">Bet</TableHead>
                      <TableHead className="text-right text-white">Outcome</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {playerHistory.length > 0 ? (
                      playerHistory.map((game, index) => (
                        <TableRow key={index} className="hover:bg-white/5">
                          <TableCell className="text-gray-300">{formatDate(game.timestamp)}</TableCell>
                          <TableCell className="text-white font-medium">
                            <div className="flex items-center gap-2">
                              {renderDiceIcon(game.prediction)}
                              {game.prediction}
                            </div>
                          </TableCell>
                          <TableCell className="text-white font-medium">
                            <div className="flex items-center gap-2">
                              {renderDiceIcon(game.result)}
                              {game.result}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-300">{formatEther(game.betAmount)} ETH</TableCell>
                          <TableCell className="text-right">
                            <span className={`px-2 py-1 rounded ${game.won ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {game.won ? 'Won' : 'Lost'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                          No game history yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 mt-6">
              <CardHeader>
                <CardTitle className="text-xl text-white text-center">
                  Contract Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contractStats ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 p-4 rounded-lg">
                      <h3 className="text-gray-300 text-sm">Total Games Played</h3>
                      <p className="text-3xl font-bold text-white mt-2">
                        {contractStats.totalGames.toString()}
                      </p>
                    </div>
                    
                    <div className="bg-white/5 p-4 rounded-lg">
                      <h3 className="text-gray-300 text-sm">Contract Balance</h3>
                      <p className="text-3xl font-bold text-white mt-2">
                        {formatEther(contractStats.contractBalance)} ETH
                      </p>
                    </div>
                    
                    <div className="bg-white/5 p-4 rounded-lg">
                      <h3 className="text-gray-300 text-sm">House Edge</h3>
                      <p className="text-3xl font-bold text-white mt-2">
                        {(Number(contractStats.houseEdge) / 100).toFixed(2)}%
                      </p>
                    </div>
                    
                    <div className="bg-white/5 p-4 rounded-lg">
                      <h3 className="text-gray-300 text-sm">Betting Limits</h3>
                      <p className="text-xl font-bold text-white mt-2">
                        {formatEther(contractStats.minBet)} - {formatEther(contractStats.maxBet)} ETH
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    Loading contract statistics...
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab (Owner Only) */}
          {isOwner && (
            <TabsContent value="settings">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 mt-6">
                <CardHeader>
                  <CardTitle className="text-xl text-white text-center">
                    Contract Settings (Owner Only)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-white font-medium">House Edge</h3>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        value={houseEdge}
                        onChange={(e) => setHouseEdge(Number(e.target.value))}
                        className="w-full"
                      />
                      <span className="text-white w-24">
                        {(houseEdge / 100).toFixed(2)}%
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      House edge percentage (in basis points). Max 10%
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-white font-medium mb-2">Minimum Bet (ETH)</h3>
                      <input
                        type="number"
                        step="0.001"
                        min="0.001"
                        value={minBet}
                        onChange={(e) => setMinBet(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                      />
                    </div>
                    
                    <div>
                      <h3 className="text-white font-medium mb-2">Maximum Bet (ETH)</h3>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={maxBet}
                        onChange={(e) => setMaxBet(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                  
                  <Button
                    onClick={updateSettings}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white py-4"
                  >
                    Update Settings
                  </Button>
                  
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-white font-medium mb-4">Contract Funds</h3>
                    
                    <div className="flex gap-4 mb-6">
                      <Button
                        onClick={fundContract}
                        className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white flex-1"
                      >
                        Fund Contract
                      </Button>
                      
                      <Button
                        onClick={emergencyWithdraw}
                        className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white flex-1"
                      >
                        Emergency Withdraw
                      </Button>
                    </div>
                    
                    <div className="flex gap-4">
                      <input
                        type="number"
                        step="0.01"
                        min="0.001"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="Amount to withdraw"
                        className="flex-1 bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                      />
                      <Button
                        onClick={withdrawFunds}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                      >
                        Withdraw Funds
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Index;