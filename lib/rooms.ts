import { Network } from "./contracts";

export interface RoomConfig {
  maxPlayers: number;
  price: string; // in native token
}

const BASE_ROOMS: RoomConfig[] = [
  { maxPlayers: 10, price: "0.01" },
  { maxPlayers: 10, price: "0.005" },
  { maxPlayers: 20, price: "0.01" },
  { maxPlayers: 20, price: "0.005" },
  { maxPlayers: 50, price: "0.01" },
  { maxPlayers: 50, price: "0.005" },
  { maxPlayers: 100, price: "0.01" },
  { maxPlayers: 100, price: "0.005" },
  { maxPlayers: 1000, price: "0.01" },
  { maxPlayers: 1000, price: "0.005" },
];

const PRICE_API =
  "https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH,POL&tsyms=USD";

async function fetchPrices() {
  const res = await fetch(PRICE_API);
  if (!res.ok) {
    throw new Error("failed to fetch prices");
  }
  const data = await res.json();
  const eth = data?.ETH?.USD;
  const pol = data?.POL?.USD;
  if (!eth || !pol) {
    throw new Error("invalid price data");
  }
  return { eth, pol };
}

export async function getRooms(network: Network): Promise<RoomConfig[]> {
  if (network === "test") return BASE_ROOMS;
  const { eth, pol } = await fetchPrices();
  const factor = eth / pol;
  return BASE_ROOMS.map((room) => ({
    maxPlayers: room.maxPlayers,
    price: (parseFloat(room.price) * factor).toFixed(6),
  }));
}
