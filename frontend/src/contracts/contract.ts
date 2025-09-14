export const factoryContract = {
    address: '0x22b3045F9A54dCac1255D8C0f0FBc6a9bAFA5a6B',
    abi: [
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "daoId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "dao",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "creator",
                    "type": "address"
                }
            ],
            "name": "DAODeployed",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "projectName",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "githubRepo",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "tokenName",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "tokenSymbol",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "initialSupply",
                    "type": "uint256"
                }
            ],
            "name": "createDAO",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "daoCount",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "daos",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "dao",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "creator",
                    "type": "address"
                },
                {
                    "internalType": "string",
                    "name": "projectName",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "createdAt",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "daoId",
                    "type": "uint256"
                }
            ],
            "name": "getDAO",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "address",
                            "name": "dao",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "creator",
                            "type": "address"
                        },
                        {
                            "internalType": "string",
                            "name": "projectName",
                            "type": "string"
                        },
                        {
                            "internalType": "uint256",
                            "name": "createdAt",
                            "type": "uint256"
                        }
                    ],
                    "internalType": "struct DAOFactory.DAOInfo",
                    "name": "",
                    "type": "tuple"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "name": "repoExists",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]
}

export const daoShipContract = {
    abi: [
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_projectName",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_githubRepo",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_tokenName",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_tokenSymbol",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "_initialSupply",
                    "type": "uint256"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                }
            ],
            "name": "OwnableInvalidOwner",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "account",
                    "type": "address"
                }
            ],
            "name": "OwnableUnauthorizedAccount",
            "type": "error"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "projectName",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "token",
                    "type": "address"
                }
            ],
            "name": "DAOCreated",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "member",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "githubUsername",
                    "type": "string"
                }
            ],
            "name": "MemberAdded",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "previousOwner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "newOwner",
                    "type": "address"
                }
            ],
            "name": "OwnershipTransferred",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "proposalId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "title",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "proposer",
                    "type": "address"
                }
            ],
            "name": "ProposalCreated",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "proposalId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "bool",
                    "name": "approved",
                    "type": "bool"
                }
            ],
            "name": "ProposalExecuted",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "member",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "TokensDistributed",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "proposalId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "staker",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "TokensStaked",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "proposalId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "voter",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "bool",
                    "name": "support",
                    "type": "bool"
                }
            ],
            "name": "VoteCasted",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "address[]",
                    "name": "addresses",
                    "type": "address[]"
                },
                {
                    "internalType": "string[]",
                    "name": "githubUsernames",
                    "type": "string[]"
                }
            ],
            "name": "addMembers",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "title",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "fundingAmount",
                    "type": "uint256"
                }
            ],
            "name": "createProposal",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address[]",
                    "name": "recipients",
                    "type": "address[]"
                },
                {
                    "internalType": "uint256[]",
                    "name": "amounts",
                    "type": "uint256[]"
                }
            ],
            "name": "distributeTokens",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "emergencyWithdraw",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "proposalId",
                    "type": "uint256"
                }
            ],
            "name": "executeProposal",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "addr",
                    "type": "address"
                }
            ],
            "name": "getMember",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                },
                {
                    "internalType": "uint96",
                    "name": "",
                    "type": "uint96"
                },
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "proposalId",
                    "type": "uint256"
                }
            ],
            "name": "getProposal",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "proposer",
                    "type": "address"
                },
                {
                    "internalType": "string",
                    "name": "title",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "fundingAmount",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "totalStaked",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "forVotes",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "againstVotes",
                    "type": "uint256"
                },
                {
                    "internalType": "uint8",
                    "name": "status",
                    "type": "uint8"
                },
                {
                    "internalType": "bool",
                    "name": "executed",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getStats",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "githubRepo",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "hasVoted",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "memberList",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "members",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "githubUsername",
                    "type": "string"
                },
                {
                    "internalType": "uint96",
                    "name": "reputation",
                    "type": "uint96"
                },
                {
                    "internalType": "bool",
                    "name": "isActive",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "owner",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "projectName",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "proposalCount",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "proposalStakers",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "proposalTitles",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "proposals",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "proposer",
                    "type": "address"
                },
                {
                    "internalType": "uint64",
                    "name": "stakingDeadline",
                    "type": "uint64"
                },
                {
                    "internalType": "uint64",
                    "name": "votingDeadline",
                    "type": "uint64"
                },
                {
                    "internalType": "uint128",
                    "name": "fundingAmount",
                    "type": "uint128"
                },
                {
                    "internalType": "uint128",
                    "name": "totalStaked",
                    "type": "uint128"
                },
                {
                    "internalType": "uint128",
                    "name": "forVotes",
                    "type": "uint128"
                },
                {
                    "internalType": "uint128",
                    "name": "againstVotes",
                    "type": "uint128"
                },
                {
                    "internalType": "uint8",
                    "name": "status",
                    "type": "uint8"
                },
                {
                    "internalType": "bool",
                    "name": "executed",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "renounceOwnership",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "proposalId",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "stakeAmount",
                    "type": "uint256"
                },
                {
                    "internalType": "bool",
                    "name": "voteSupport",
                    "type": "bool"
                }
            ],
            "name": "stakeAndVote",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "stakes",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "token",
            "outputs": [
                {
                    "internalType": "contract GovernanceToken",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "totalMembers",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "newOwner",
                    "type": "address"
                }
            ],
            "name": "transferOwnership",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "treasuryBalance",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]
}

export const CHAIN_CONFIG = {
    chainId: 43113, // Avalanche Fuji testnet
    name: "Avalanche Fuji",
    rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc"
};