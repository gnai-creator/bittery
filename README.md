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

Share your referral link (?ref=YOUR_ADDRESS) and earn a portion of the fee whenever someone you invite buys a ticket. The default referral reward is 50% of the collected fee.

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
```

If these variables are missing the app will attempt to create a contract with an empty address and throw an `UNCONFIGURED_NAME` error.

---

## 📤 Deployment Instructions

Ensure you have a `.env` file with the following variables:
```env
PRIVATE_KEY=your_wallet_private_key
POLYGON_RPC_URL=https://polygon-rpc.com # or from Alchemy/Infura
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY
CHAINLINK_SUBSCRIPTION_ID=your_vrf_subscription_id
CHAINLINK_COORDINATOR=coordinator_address
CHAINLINK_KEY_HASH=keyhash_value
```

Then deploy with:
```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

To automatically maintain one room of each type on-chain, run the scheduler:

```bash
npm run schedule:rooms
```
This task checks the contract every minute and creates new rooms when the previous ones finish.

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

