# Bittery - Decentralized Lottery DApp

This project contains a simple lottery built with **Next.js 15**, **Hardhat**, **Solidity**, and **ethers.js**. Players buy tickets with 0.01 ETH and a random winner is picked using **Chainlink VRF v2**.

## Setup

Install dependencies:

```bash
npm install
```

Compile the contract:

```bash
npx hardhat compile
```

Run tests:

```bash
npx hardhat test
```

Start the frontend:

```bash
npm run dev
```

## Deployment

Create an `.env` file with:

```
SEPOLIA_RPC_URL=
MUMBAI_RPC_URL=
PRIVATE_KEY=
VRF_COORDINATOR=
SUBSCRIPTION_ID=
KEY_HASH=
```

Deploy with:

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

Set `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env` for the frontend to interact with the deployed contract.
