"use client";

import { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { Dice1 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

// Smart contract ABI for DiceGame
const DICE_GAME_ABI = [
  "function predict(uint256 guess) public payable",
  "function getLastRoll(address user) public view returns (uint256)",
  "function getGameResult(address user) public view returns (bool)"
];

const DICE_GAME_ADDRESS = "0x1234567890123456789012345678901234567890"; 
const BET_AMOUNT = "0.001"; // ETH

const Index = () => {
  const { login, logout, ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const { toast } = useToast();
  
  const [selectedNumber, setSelectedNumber] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [gameResult, setGameResult] = useState<boolean | null>(null);
  const [walletBalance, setWalletBalance] = useState<string>('0');
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  // Initialize contract when wallet is connected
  useEffect(() => {
    if (authenticated && wallets.length > 0) {
      initializeContract();
      fetchWalletBalance();
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

  const fetchGameData = async (userAddress: string) => {
    if (!contract) return;
    
    try {
      const roll = await contract.getLastRoll(userAddress);
      const result = await contract.getGameResult(userAddress);
      setLastRoll(Number(roll));
      setGameResult(result);
    } catch (error) {
      console.error('Failed to fetch game data:', error);
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

    setIsPlaying(true);
    setLastRoll(null);
    setGameResult(null);

    try {
      const tx = await contract.predict(selectedNumber, {
        value: ethers.parseEther(BET_AMOUNT)
      });

      toast({
        title: "Transaction Submitted",
        description: "Your dice prediction is being processed...",
      });

      await tx.wait();

      toast({
        title: "Transaction Confirmed",
        description: "Fetching your dice roll result...",
      });

      // Wait a bit for the contract state to update
      setTimeout(async () => {
        await fetchGameData(wallets[0].address);
        await fetchWalletBalance();
        setIsPlaying(false);
      }, 2000);

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
    return <Dice1 className="w-8 h-8" />;
  };

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
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">🎲 Dice Game</h1>
          <div className="flex items-center gap-4">
            <div className="text-white text-sm">
              <div>Address: {wallets[0]?.address?.slice(0, 6)}...{wallets[0]?.address?.slice(-4)}</div>
              <div>Balance: {parseFloat(walletBalance).toFixed(4)} ETH</div>
            </div>
            <Button 
              onClick={logout}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Disconnect
            </Button>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Game Card */}
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
              {/* Number Selection */}
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

              {/* Play Button */}
              <Button
                onClick={playGame}
                disabled={isPlaying}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-4 text-lg"
              >
                {isPlaying ? 'Rolling Dice...' : `Play for ${BET_AMOUNT} ETH`}
              </Button>
            </CardContent>
          </Card>

          {/* Results Card */}
          {(lastRoll !== null || gameResult !== null) && (
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-xl text-white text-center">
                  Game Result
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                {lastRoll !== null && (
                  <div className="space-y-2">
                    <p className="text-gray-300">Dice rolled:</p>
                    <div className="flex justify-center items-center gap-2">
                      {renderDiceIcon(lastRoll)}
                      <span className="text-4xl font-bold text-white">{lastRoll}</span>
                    </div>
                  </div>
                )}
                
                {gameResult !== null && (
                  <div className={`text-2xl font-bold ${
                    gameResult ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {gameResult ? '🎉 You Won!' : '😢 You Lost!'}
                  </div>
                )}
                
                <div className="text-gray-300">
                  Your prediction: {selectedNumber}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Game Info */}
          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardContent className="pt-6">
              <div className="text-gray-300 text-sm space-y-2">
                <p>• Choose a number from 1 to 6</p>
                <p>• Place your bet of {BET_AMOUNT} ETH</p>
                <p>• Win if your prediction matches the dice roll</p>
                <p>• Contract Address: {DICE_GAME_ADDRESS.slice(0, 10)}...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
