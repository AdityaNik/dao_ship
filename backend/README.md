# DAO Creator Backend

This is the backend service for the DAO Creator MVP, built with Node.js, Express, MongoDB, and Algorand.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Algorand Testnet account
- AlgoKit CLI

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dao-creator
ALGOD_SERVER=https://testnet-api.algonode.cloud
ALGOD_PORT=443
ALGOD_TOKEN=
JWT_SECRET=your-secret-key-here
```

3. Start the development server:

```bash
npm run dev
```

## API Endpoints

### DAO Endpoints

- `POST /api/dao` - Create a new DAO
- `GET /api/dao` - Get all DAOs
- `GET /api/dao/:id` - Get a specific DAO
- `POST /api/dao/:id/join` - Join a DAO

### Proposal Endpoints

- `POST /api/proposal` - Create a new proposal
- `GET /api/proposal/dao/:daoId` - Get all proposals for a DAO
- `GET /api/proposal/:id` - Get a specific proposal
- `POST /api/proposal/:id/vote` - Vote on a proposal

### User Endpoints

- `POST /api/user` - Create a new user
- `GET /api/user/wallet/:walletAddress` - Get user by wallet address
- `PUT /api/user/:id` - Update user profile
- `GET /api/user/:id/daos` - Get user's DAOs

## Smart Contract Integration

The backend integrates with Algorand smart contracts using AlgoKit. The following functionality is implemented:

1. DAO Contract Deployment
2. Proposal Creation
3. Voting
4. Status Checking

## Development

To implement the actual smart contract functionality:

1. Create your DAO smart contract using AlgoKit
2. Update the `algorand.service.js` file with the actual contract deployment and interaction logic
3. Test the integration using the Algorand Testnet

## License

MIT
