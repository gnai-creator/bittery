# 🎲 Bittery

**Bittery** is a decentralized, fair, and transparent lottery system built on the Polygon network. It uses **Chainlink VRF** (Verifiable Random Function) to ensure that all draws are provably random and tamper-proof.

---

## 🚀 Features

- 🔐 Verifiable randomness powered by Chainlink VRF
- 📈 Fully on-chain and decentralized
- 💵 Smart contract handles ticket purchases and payouts
- 🧾 Transparent draw history stored on-chain
- 🛠️ Deployable on Polygon with Hardhat
- ❌ Non-commercial license to protect the original creator

---

## 📦 Tech Stack

- Solidity (Smart Contracts)
- Hardhat (Development Framework)
- Chainlink VRF v2
- Polygon (Mumbai testnet or Mainnet)

---

## 📤 Deployment Instructions

Ensure you have a `.env` file with the following variables:
```env
PRIVATE_KEY=your_wallet_private_key
POLYGON_RPC_URL=https://polygon-rpc.com or from Alchemy/Infura
CHAINLINK_SUBSCRIPTION_ID=your_vrf_subscription_id
CHAINLINK_COORDINATOR=coordinator_address
CHAINLINK_KEY_HASH=keyhash_value
```

Then deploy with:
```bash
npx hardhat run scripts/deploy.js --network mumbai
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

Bittery is an experimental educational project. It is not intended to be used for real-money gambling or commercial deployment without proper licensing and jurisdictional compliance.
