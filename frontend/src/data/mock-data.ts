
export interface DAO {
  id: string;
  name: string;
  description: string;
  tokenName: string;
  tokenSymbol: string;
  tokenSupply: number;
  membersCount: number;
  votingPeriod: number;
  quorum: number;
  minTokens: number;
  createdAt: string;
  logoUrl?: string;
}

export interface Proposal {
  id: string;
  daoId: string;
  title: string;
  description: string;
  author: string;
  createdAt: string;
  endTime: string;
  status: "active" | "pending" | "completed";
  yesVotes: number;
  noVotes: number;
  totalVotes: number;
}

export const mockDAOs: DAO[] = [
  {
    id: "dao-1",
    name: "AlgoVentures",
    description: "A DAO focused on investing in promising Algorand projects and supporting the ecosystem.",
    tokenName: "AlgoVentures",
    tokenSymbol: "ALVEN",
    tokenSupply: 1000000,
    membersCount: 128,
    votingPeriod: 7,
    quorum: 51,
    minTokens: 100,
    createdAt: "2024-04-15T10:30:00Z",
  },
  {
    id: "dao-2",
    name: "DeFiGuild",
    description: "Focused on DeFi governance and protocol improvements on Algorand.",
    tokenName: "DeFi Guild",
    tokenSymbol: "DFG",
    tokenSupply: 500000,
    membersCount: 76,
    votingPeriod: 5,
    quorum: 60,
    minTokens: 50,
    createdAt: "2024-04-12T14:45:00Z",
  },
  {
    id: "dao-3",
    name: "GreenChain",
    description: "A sustainability-focused DAO investing in carbon-neutral blockchain projects and environmental initiatives.",
    tokenName: "GreenChain",
    tokenSymbol: "GREEN",
    tokenSupply: 2000000,
    membersCount: 245,
    votingPeriod: 10,
    quorum: 45,
    minTokens: 200,
    createdAt: "2024-03-28T09:15:00Z",
  },
  {
    id: "dao-4",
    name: "DevCollective",
    description: "Supporting open-source development and developer education in the Algorand ecosystem.",
    tokenName: "Dev Collective",
    tokenSymbol: "DEVC",
    tokenSupply: 750000,
    membersCount: 92,
    votingPeriod: 7,
    quorum: 55,
    minTokens: 75,
    createdAt: "2024-04-08T16:20:00Z",
  },
  {
    id: "dao-5",
    name: "ArtisanHub",
    description: "Empowering digital artists and creators through NFT marketplace governance and funding.",
    tokenName: "Artisan Hub",
    tokenSymbol: "ART",
    tokenSupply: 1500000,
    membersCount: 164,
    votingPeriod: 14,
    quorum: 40,
    minTokens: 150,
    createdAt: "2024-04-02T11:30:00Z",
  },
  {
    id: "dao-6",
    name: "GamersDAO",
    description: "Decentralized gaming guild focused on GameFi projects and esports tournaments on Algorand.",
    tokenName: "Gamers DAO",
    tokenSymbol: "GAME",
    tokenSupply: 3000000,
    membersCount: 312,
    votingPeriod: 5,
    quorum: 35,
    minTokens: 25,
    createdAt: "2024-03-22T13:45:00Z",
  },
  {
    id: "dao-7",
    name: "HealthTech Collective",
    description: "Advancing healthcare technology through blockchain solutions and medical research funding.",
    tokenName: "HealthTech",
    tokenSymbol: "HEALTH",
    tokenSupply: 800000,
    membersCount: 87,
    votingPeriod: 12,
    quorum: 65,
    minTokens: 300,
    createdAt: "2024-04-01T08:00:00Z",
  },
];

export const mockProposals: Proposal[] = [
  {
    id: "prop-1",
    daoId: "dao-1",
    title: "Fund AlgoSwap Integration",
    description: "Proposal to allocate 10,000 ALVEN tokens to integrate with AlgoSwap DEX for better liquidity options.",
    author: "0x1234...5678",
    createdAt: "2024-04-20T09:00:00Z",
    endTime: "2024-04-27T09:00:00Z",
    status: "active",
    yesVotes: 32000,
    noVotes: 12000,
    totalVotes: 44000,
  },
  {
    id: "prop-2",
    daoId: "dao-1",
    title: "Community Grants Program",
    description: "Launch a grants program for Algorand developers with 50,000 ALVEN tokens allocated over 6 months.",
    author: "0xabcd...ef01",
    createdAt: "2024-04-18T15:30:00Z",
    endTime: "2024-04-25T15:30:00Z",
    status: "active",
    yesVotes: 45000,
    noVotes: 5000,
    totalVotes: 50000,
  },
  {
    id: "prop-3",
    daoId: "dao-2",
    title: "Increase Staking Rewards",
    description: "Proposal to increase DFG staking rewards from 5% to 8% APY to attract more participants.",
    author: "0x5678...9abc",
    createdAt: "2024-04-19T11:15:00Z",
    endTime: "2024-04-24T11:15:00Z",
    status: "active",
    yesVotes: 28000,
    noVotes: 22000,
    totalVotes: 50000,
  },
];
