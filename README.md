# Bittery - Decentralizer Lottey DApp

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
POLYGON_TESTNET_RPC_URL=
PRIVATE_KEY=
VRF_COORDINATOR=
SUBSCRIPTION_ID=
KEY_HASH=
```

**Important**: Replace the placeholders with your real configuration. `SUBSCRIPTION_ID` must be a numeric value with digits only (e.g. `123`). Using strings like `<SUBSCRIPTION_ID>` will cause deployment to fail.

Deploy with:

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

Set `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env` for the frontend to interact with the deployed contract.


## 📄 License

This project is licensed under the [Business Source License 1.1](./LICENSE) — free for **non-commercial** use only.  
Any **commercial** usage, including resale, hosted services, or integration into products, is **strictly prohibited** without prior written consent from the author.  
This license will automatically convert to the MIT License on **July 10, 2075**.

For commercial licensing inquiries, please contact: [contact@bittery.org](mailto:contact@bittery.org)


