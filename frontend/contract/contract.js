

export const DICE_GAME_ADDRESS = "0x416370871B242A21c38Ad934aD72a312B61E6b63";
export const DICE_GAME_ABI = [
    {
        "type": "constructor",
        "inputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "receive",
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "emergencyWithdraw",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "fundContract",
        "inputs": [],
        "outputs": [],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "gameCounter",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "games",
        "inputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "player",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "betAmount",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "prediction",
                "type": "uint8",
                "internalType": "uint8"
            },
            {
                "name": "result",
                "type": "uint8",
                "internalType": "uint8"
            },
            {
                "name": "isComplete",
                "type": "bool",
                "internalType": "bool"
            },
            {
                "name": "timestamp",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "won",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getContractStats",
        "inputs": [],
        "outputs": [
            {
                "name": "totalGames",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "contractBalance",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "currentHouseEdge",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "currentMinBet",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "currentMaxBet",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getGame",
        "inputs": [
            {
                "name": "_gameId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "tuple",
                "internalType": "struct DiceGame.Game",
                "components": [
                    {
                        "name": "player",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "betAmount",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "prediction",
                        "type": "uint8",
                        "internalType": "uint8"
                    },
                    {
                        "name": "result",
                        "type": "uint8",
                        "internalType": "uint8"
                    },
                    {
                        "name": "isComplete",
                        "type": "bool",
                        "internalType": "bool"
                    },
                    {
                        "name": "timestamp",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "won",
                        "type": "bool",
                        "internalType": "bool"
                    }
                ]
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getPlayerGameHistory",
        "inputs": [
            {
                "name": "_player",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "_limit",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "tuple[]",
                "internalType": "struct DiceGame.Game[]",
                "components": [
                    {
                        "name": "player",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "betAmount",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "prediction",
                        "type": "uint8",
                        "internalType": "uint8"
                    },
                    {
                        "name": "result",
                        "type": "uint8",
                        "internalType": "uint8"
                    },
                    {
                        "name": "isComplete",
                        "type": "bool",
                        "internalType": "bool"
                    },
                    {
                        "name": "timestamp",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "won",
                        "type": "bool",
                        "internalType": "bool"
                    }
                ]
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getPlayerGames",
        "inputs": [
            {
                "name": "_player",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256[]",
                "internalType": "uint256[]"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "houseEdge",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "maxBet",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "minBet",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "owner",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "playGame",
        "inputs": [
            {
                "name": "_prediction",
                "type": "uint8",
                "internalType": "uint8"
            }
        ],
        "outputs": [],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "playerGames",
        "inputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "renounceOwnership",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "setBetLimits",
        "inputs": [
            {
                "name": "_minBet",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "_maxBet",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "setHouseEdge",
        "inputs": [
            {
                "name": "_houseEdge",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "transferOwnership",
        "inputs": [
            {
                "name": "newOwner",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "withdrawFunds",
        "inputs": [
            {
                "name": "_amount",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "event",
        "name": "BetLimitsUpdated",
        "inputs": [
            {
                "name": "newMinBet",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "newMaxBet",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "GameCompleted",
        "inputs": [
            {
                "name": "gameId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "player",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "result",
                "type": "uint8",
                "indexed": false,
                "internalType": "uint8"
            },
            {
                "name": "won",
                "type": "bool",
                "indexed": false,
                "internalType": "bool"
            },
            {
                "name": "payout",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "GameCreated",
        "inputs": [
            {
                "name": "gameId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "player",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "betAmount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "prediction",
                "type": "uint8",
                "indexed": false,
                "internalType": "uint8"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "HouseEdgeUpdated",
        "inputs": [
            {
                "name": "newHouseEdge",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "OwnershipTransferred",
        "inputs": [
            {
                "name": "previousOwner",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "newOwner",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "contractBalanceUpdated",
        "inputs": [
            {
                "name": "newBalance",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "error",
        "name": "OwnableInvalidOwner",
        "inputs": [
            {
                "name": "owner",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "OwnableUnauthorizedAccount",
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "ReentrancyGuardReentrantCall",
        "inputs": []
    }
]
