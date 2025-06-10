"use client";

import { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { 
  Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, 
  History, BarChart, Settings, Wallet, LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from '@/hooks/use-toast';
import { DICE_GAME_ADDRESS, DICE_GAME_ABI } from '@/contract/contract';
import DiceAnimation from '@/components/DiceAnimation';
import LoadingAnimation from '@/components/LoadingAnimation';

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
  const [customBetAmount, setCustomBetAmount] = useState<number>(0.001);

  // New state management
  const [playerHistory, setPlayerHistory] = useState<Game[]>([]);
  const [contractStats, setContractStats] = useState<ContractStats | null>(null);
  const [houseEdge, setHouseEdge] = useState<number>(150);
  const [minBet, setMinBet] = useState<string>('0.001');
  const [maxBet, setMaxBet] = useState<string>('1');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('play');

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
      if(customBetAmount <= 0 || customBetAmount < parseFloat(minBet) || customBetAmount > parseFloat(maxBet)) {
        toast({
          title: "Invalid Bet Amount",
          description: `Please enter a bet amount between ${minBet} and ${maxBet}`,
          variant: "destructive"
        });
        return;
      }

      const betAmount = ethers.parseEther(customBetAmount.toString());
      const tx = await contract.playGame(selectedNumber, {
        value: betAmount,
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
    return <LoadingAnimation />;
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-pink-500 to-violet-500 p-4 rounded-full">
                <Dice1 className="w-12 h-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-white mb-2">
              Web3 Dice Game
            </CardTitle>
            <p className="text-gray-300">
              Predict the dice roll and win ETH!
            </p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={login} 
              className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-semibold py-3 text-lg transition-all hover:scale-[1.02]"
            >
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 opacity-30">
        <DiceAnimation />
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-pink-500 to-violet-500 p-2 rounded-lg">
              <Dice1 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Web3 Dice Game</h1>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-lg px-4 py-2 rounded-lg border border-white/20">
              <div className="flex flex-col">
                <div className="text-xs text-gray-300 flex items-center gap-1">
                  <Wallet className="w-3 h-3" /> Wallet
                </div>
                <div className="text-sm font-medium text-white">
                  {wallets[0]?.address?.slice(0, 6)}...
                  {wallets[0]?.address?.slice(-4)}
                </div>
              </div>
              <div className="h-8 w-px bg-white/20 mx-2"></div>
              <div className="flex flex-col">
                <div className="text-xs text-gray-300">Balance</div>
                <div className="text-sm font-medium text-white">
                  {parseFloat(walletBalance).toFixed(4)} ETH
                </div>
              </div>
            </div>

            <Button
              onClick={logout}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Disconnect
            </Button>

            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                isSepolia
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {isSepolia ? "Sepolia Network" : "Wrong Network"}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="max-w-4xl mx-auto"
        >
          <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-lg border border-white/10 rounded-xl p-1">
            <TabsTrigger
              value="play"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-violet-500 data-[state=active]:text-white rounded-lg"
            >
              <Dice1 className="w-4 h-4" /> Play
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-violet-500 data-[state=active]:text-white rounded-lg"
            >
              <History className="w-4 h-4" /> History
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-violet-500 data-[state=active]:text-white rounded-lg"
            >
              <BarChart className="w-4 h-4" /> Stats
            </TabsTrigger>
          </TabsList>

          {/* Play Tab */}
          <TabsContent value="play" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 rounded-2xl shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-white text-center">
                    Predict the Dice Roll
                  </CardTitle>
                  <p className="text-gray-300 text-center">
                    Choose a number (1-6) and bet {BET_AMOUNT} ETH
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((number) => (
                      <Button
                        key={number}
                        onClick={() => setSelectedNumber(number)}
                        className={`aspect-square text-2xl font-bold transition-all ${
                          selectedNumber === number
                            ? "bg-gradient-to-r from-pink-500 to-violet-500 text-white scale-105"
                            : "bg-white/20 text-white hover:bg-white/30"
                        } rounded-xl`}
                        disabled={isPlaying}
                      >
                        {number}
                      </Button>
                    ))}
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="text-gray-300 mb-2">Your prediction:</div>
                    <div className="text-6xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 text-transparent bg-clip-text">
                      {selectedNumber}
                    </div>
                  </div>

                  <Button
                    onClick={playGame}
                    disabled={isPlaying}
                    className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-semibold py-6 text-lg rounded-xl transition-all hover:scale-[1.02]"
                  >
                    {isPlaying ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Rolling Dice...
                      </span>
                    ) : (
                      `Play for ${BET_AMOUNT} ETH`
                    )}
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-6">
                {playerHistory.length > 0 && (
                  <Card className="bg-white/10 backdrop-blur-lg border-white/20 rounded-2xl shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-xl text-white">
                        Your Last Game
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex flex-col items-center">
                          <div className="text-gray-300 mb-1">Prediction</div>
                          <div className="text-4xl font-bold text-white">
                            {playerHistory[0].prediction}
                          </div>
                        </div>

                        <div className="h-16 w-px bg-white/20 hidden md:block"></div>

                        <div className="flex flex-col items-center">
                          <div className="text-gray-300 mb-1">Result</div>
                          <div className="text-4xl font-bold text-white">
                            {playerHistory[0].result}
                          </div>
                        </div>

                        <div className="h-16 w-px bg-white/20 hidden md:block"></div>

                        <div className="flex flex-col items-center">
                          <div className="text-gray-300 mb-1">Outcome</div>
                          <div
                            className={`text-2xl font-bold ${
                              playerHistory[0].won
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {playerHistory[0].won ? "WON" : "LOST"}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-white/10 backdrop-blur-lg border-white/20 rounded-2xl shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">
                      How to Play
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-pink-500/20 text-pink-400 rounded-full p-1 mt-0.5">
                          <Dice1 className="w-4 h-4" />
                        </div>
                        <p className="text-gray-300">
                          Choose a number between 1 and 6
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-pink-500/20 text-pink-400 rounded-full p-1 mt-0.5">
                          <Wallet className="w-4 h-4" />
                        </div>
                        <p className="text-gray-300">
                          Place your bet of {BET_AMOUNT} ETH
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-pink-500/20 text-pink-400 rounded-full p-1 mt-0.5">
                          <div className="w-4 h-4 flex items-center justify-center">
                            ✓
                          </div>
                        </div>
                        <p className="text-gray-300">
                          Win if your prediction matches the dice roll
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-pink-500/20 text-pink-400 rounded-full p-1 mt-0.5">
                          <div className="w-4 h-4 flex items-center justify-center">
                            $
                          </div>
                        </div>
                        <p className="text-gray-300">
                          Contract Address: {DICE_GAME_ADDRESS.slice(0, 6)}...
                          {DICE_GAME_ADDRESS.slice(-4)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-6">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 rounded-2xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  Your Game History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-white/10 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-white/5">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-white">Time</TableHead>
                        <TableHead className="text-white">Prediction</TableHead>
                        <TableHead className="text-white">Result</TableHead>
                        <TableHead className="text-white">Bet</TableHead>
                        <TableHead className="text-right text-white">
                          Outcome
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {playerHistory.length > 0 ? (
                        playerHistory.map((game, index) => (
                          <TableRow
                            key={index}
                            className="hover:bg-white/5 border-t border-white/10"
                          >
                            <TableCell className="text-gray-300">
                              {formatDate(game.timestamp)}
                            </TableCell>
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
                            <TableCell className="text-gray-300">
                              {formatEther(game.betAmount)} ETH
                            </TableCell>
                            <TableCell className="text-right">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  game.won
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-red-500/20 text-red-400"
                                }`}
                              >
                                {game.won ? "Won" : "Lost"}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center text-gray-400 py-8"
                          >
                            No game history yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="mt-6">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 rounded-2xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  Contract Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contractStats ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Total Games Played */}
                    <div className="bg-white/5 p-6 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-pink-500/20 p-2 rounded-lg">
                          <BarChart className="w-5 h-5 text-pink-400" />
                        </div>
                        <h3 className="text-gray-300">Total Games Played</h3>
                      </div>
                      <p className="text-3xl font-bold text-white">
                        {contractStats.totalGames.toString()}
                      </p>
                    </div>

                    {/* Contract Balance */}
                    <div className="bg-white/5 p-6 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-violet-500/20 p-2 rounded-lg">
                          <Wallet className="w-5 h-5 text-violet-400" />
                        </div>
                        <h3 className="text-gray-300">Contract Balance</h3>
                      </div>
                      <p className="text-3xl font-bold text-white">
                        {formatEther(contractStats.contractBalance)} ETH
                      </p>
                    </div>

                    {/* House Edge */}
                    <div className="bg-white/5 p-6 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-pink-500/20 p-2 rounded-lg">
                          <Settings className="w-5 h-5 text-pink-400" />
                        </div>
                        <h3 className="text-gray-300">House Edge</h3>
                      </div>
                      <p className="text-3xl font-bold text-white">
                        {(Number(contractStats.houseEdge) / 100).toFixed(2)}%
                      </p>
                    </div>

                    {/* Betting Limits */}
                    <div className="bg-white/5 p-6 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-violet-500/20 p-2 rounded-lg">
                          <Dice1 className="w-5 h-5 text-violet-400" />
                        </div>
                        <h3 className="text-gray-300">Betting Limits</h3>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {formatEther(contractStats.minBet)} -{" "}
                        {formatEther(contractStats.maxBet)} ETH
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
        </Tabs>
      </div>
    </div>
  );
};

export default Index;