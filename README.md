# 🎲 Dice Prediction Game Web3 [Demo-video](https://youtu.be/ERyMr_NOa2U?si=yzu7I0ECaHbHGOuO)

A decentralized dice prediction game built on Ethereum blockchain, combining the excitement of probability-based gaming with Web3 technology. Players can predict dice outcomes and win rewards based on their predictions.

## 🌟 Features

- **Decentralized Gaming**: Built on Ethereum blockchain for transparency and fairness
- **Prediction Mechanics**: Users can predict dice roll outcomes and win rewards
- **Modern Web3 Integration**: Seamless wallet connection and blockchain interaction
- **Responsive Design**: Beautiful UI/UX with Tailwind CSS and shadcn/ui components
- **Real-time Updates**: Live game state updates and transaction feedback

## 🚀 Live Demo

**[Play the Game](https://dicegameeth-six.vercel.app/)** - Deployed on Vercel

## 🏗️ Tech Stack

### Smart Contracts
- **Solidity** - Smart contract development
- **Foundry** - Development framework and testing

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern UI components
- **Ethers.js** - Ethereum blockchain interaction

## 📁 Project Structure

```
0x4nud33p-dice-prediction-game-web3/
├── contracts/                 # Smart contract development
│   ├── src/                  # Contract source code
│   │   └── DiceGame.sol     # Main game contract
│   ├── script/              # Deployment scripts
│   ├── test/                # Contract tests
│   └── foundry.toml         # Foundry configuration
└── frontend/                # Next.js frontend application
    ├── app/                 # Next.js 14 app directory
    ├── components/          # React components
    │   ├── ui/             # shadcn/ui components
    │   └── providers/      # Context providers
    ├── contract/           # Contract interaction logic
    ├── hooks/              # Custom React hooks
    └── lib/                # Utility functions
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- Git
- Foundry (for smart contract development)

### Clone the Repository
```bash
git clone https://github.com/0x4nud33p/dice-prediction-game-web3.git
cd dice-prediction-game-web3
```

### Smart Contract Setup
```bash
cd contracts
forge install
forge build
forge test
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:3000`

## 🎮 How to Play

1. **Connect Wallet**: Connect your Ethereum wallet (MetaMask, WalletConnect, etc.)
2. **Make Prediction**: Choose your predicted dice outcome
3. **Place Bet**: Set your wager amount in ETH
4. **Roll Dice**: Execute the transaction and wait for the result
5. **Collect Rewards**: Winners receive their rewards automatically

## 🔧 Smart Contract Details

The DiceGame contract implements:
- Provably fair randomness for dice rolls
- Secure bet placement and reward distribution  
- Gas-optimized operations
- Event emissions for frontend integration

## 🚀 Deployment

### Smart Contract Deployment
```bash
cd contracts
forge script script/DiceGame.s.sol --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast 
```

### Frontend Deployment
The frontend is deployed on Vercel and automatically updates with main branch changes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## ⚠️ Disclaimer

**IMPORTANT NOTICE**: The smart contracts in this project have NOT been audited for production use. This is a demonstration/educational project and should not be used with real funds on mainnet without proper security audits. Use at your own risk.

- Contracts are deployed on testnets for demonstration purposes
- No guarantee of fund security or contract behavior
- Thoroughly test on testnets before any mainnet deployment
- Consider professional smart contract auditing before production use

## 🔗 Links

- **Live Demo**: [dicegameeth-six.vercel.com](https://dicegameeth-six.vercel.app/)
- **GitHub Repository**: [https://github.com/0x4nud33p/dice-prediction-game-web3](https://github.com/0x4nud33p/dice-prediction-game-web3)
- **Developer**: [@0x4nud33p](https://github.com/0x4nud33p/)

## 📞 Contact

For questions, suggestions, or collaboration opportunities, feel free to reach out:

- GitHub: [@0x4nud33p](https://github.com/0x4nud33p/)
- Project Issues: [GitHub Issues](https://github.com/0x4nud33p/dice-prediction-game-web3/issues)

---

⭐ If you found this project helpful or interesting, please consider giving it a star!

**Happy Gaming! 🎲**