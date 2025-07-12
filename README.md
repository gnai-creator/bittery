<p align="center">
  <img src="public/logo.png" alt="Bittery Logo" width="250"/>
</p>

# 🎲 Bittery

**Bittery** is a decentralized, fair, and transparent lottery system built on the Polygon network for mainnet and Ethereum Sepolia for testing. It uses **Chainlink VRF** (Verifiable Random Function) to ensure that all draws are provably random and tamper-proof.

---

## 🚀 Features

- 🔐 Verifiable randomness powered by Chainlink VRF
- 📈 Fully on-chain and decentralized
- 💵 Smart contract handles ticket purchases and payouts
- 🧾 Transparent draw history stored on-chain
- 🛠️ Deployable on Polygon with Hardhat
- ❌ Non-commercial license to protect the original creator
- 🤝 Built-in referral system rewarding players who invite others
- ⏱ Real-time dashboard with player count, countdown, and recent winners

---

## 🤝 Referral System

Share your referral link (?ref=YOUR_ADDRESS) and earn a portion of the fee whenever someone you invite buys a ticket. The default referral reward is 50% of the collected fee, which equals 2.5% of the ticket price if the fee is 5%.

---

## 📦 Tech Stack

- Solidity (Smart Contracts)
- Hardhat (Development Framework)
- Chainlink VRF v2
- Polygon (Mainnet) and Ethereum Sepolia testnet

---

## 🤖 Local Development

Start the Next.js development server with:

```bash
npm run dev
```

Avoid using the `--turbopack` flag since the i18n setup is not compatible with it.

---

## ⚙️ Environment Variables

Before running the frontend you must define the contract addresses for each network.
Create a `.env.local` file and set the following variables:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS_MAIN=0xYourMainnetAddress
NEXT_PUBLIC_CHAIN_ID_MAIN=137
NEXT_PUBLIC_CONTRACT_ADDRESS_TEST=0xYourTestnetAddress
NEXT_PUBLIC_CHAIN_ID_TEST=11155111
# WalletConnect project identifier for RainbowKit
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
```

The WalletConnect project ID identifies your app on WalletConnect Cloud. Sign up
at <https://cloud.walletconnect.com>, create a project, and copy the generated
identifier. If not provided, the app falls back to the default `bittery`
identifier used in development.

If these variables are missing the app will attempt to create a contract with an empty address and throw an `UNCONFIGURED_NAME` error.

---

## 📤 Deployment Instructions

Ensure you have a `.env` file with the following variables:
```env
PRIVATE_KEY=your_wallet_private_key

# RPC endpoints
POLYGON_RPC_URL=https://polygon-rpc.com # Polygon mainnet
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY # Sepolia testnet

# Chainlink VRF for Polygon mainnet
VRF_COORDINATOR_MAIN=coordinator_address_mainnet
SUBSCRIPTION_ID_MAIN=your_mainnet_vrf_subscription_id
KEY_HASH_MAIN=keyhash_mainnet

# Chainlink VRF for Sepolia testnet
VRF_COORDINATOR_TEST=coordinator_address_testnet
SUBSCRIPTION_ID_TEST=your_testnet_vrf_subscription_id
KEY_HASH_TEST=keyhash_testnet

# Address to receive collected fees
FEE_RECIPIENT=0xYourFeeRecipient

CRON_SECRET=your_secret_for_cron
```

Variables ending in `_MAIN` apply to Polygon mainnet, while `_TEST` ones are
for Ethereum Sepolia.

If `POLYGON_RPC_URL` or `SEPOLIA_RPC_URL` are missing Hardhat will fail with
```
ProviderError: the method eth_blockNumber does not exist/is not available
```
Ensure both RPC endpoints and `PRIVATE_KEY` are correctly configured.

Then deploy with:
```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

To automatically maintain one room of each type on-chain, use the scheduler route.
On Vercel you can create a [Cron Job](https://vercel.com/docs/cron-jobs) that
invokes `/api/schedule-rooms` at the desired interval (for example, every
minute).
Ensure the `CRON_SECRET` environment variable is configured so Vercel includes
`Authorization: Bearer <CRON_SECRET>` on each invocation; the route rejects
requests without this token.

For local development you can still run:

```bash
npm run schedule:rooms
```
The route executes the same logic and creates new rooms when the previous ones finish.

## 🔍 Contract Verification

Set `ETHERSCAN_API_KEY` in your `.env` so Hardhat can publish the contract source on Etherscan.
The `verify:test` and `verify:main` scripts expect the deployed address followed by the constructor
parameters: `coordinator`, `subscription ID`, `key hash` and `fee recipient`.

Example for Sepolia:
```bash
npm run verify:test -- 0xYourContractAddress 0xCoordinator 1 0xKeyHash 0xFeeRecipient
```

For Polygon mainnet:
```bash
npm run verify:main -- 0xYourContractAddress 0xCoordinator 1 0xKeyHash 0xFeeRecipient
```

---

## ❓ Why Bittery?

Most blockchain lotteries either rely on backend systems or have hidden rules. Bittery is:

- ✅ Fully decentralized and self-contained
- 🔍 Provably fair using Chainlink VRF
- ⚠️ Non-commercial to prevent abuse or profiteering
- 🌍 Built for education, experimentation, and transparency

---

## 🛡 License

This project is licensed under the **Business Source License 1.1**.

- 🧠 **Free for non-commercial use**: education, personal projects, research
- 🚫 **Commercial use prohibited** unless licensed
- 🔓 **License converts to MIT** on **July 10, 2075**

For commercial licensing, contact: [contact@bittery.org](mailto:contact@bittery.org)

View full license in [`LICENSE`](./LICENSE).

---

## ✉️ Contact

- 🧑 Author: Felipe Maya Muniz ([gnai-creator](https://github.com/gnai-creator))
- 📬 Email: [contact@bittery.org](mailto:contact@bittery.org)
- 🌐 Project site: [https://www.bittery.org](https://www.bittery.org)

---

## ⚠ Disclaimer

Bittery is a decentralized lottery protocol currently released under a non-commercial license (BUSL 1.1).  
Commercial deployment — including real-money use, hosted platforms, and integrations — is **strictly prohibited without an official license** from the author.

If you wish to operate Bittery commercially or as a public service, please request a commercial license at: [contact@bittery.org](mailto:contact@bittery.org)

