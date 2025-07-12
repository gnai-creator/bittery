import { Network } from './contracts';

export interface RoomConfig {
  maxPlayers: number;
  price: string; // in native token
}

const BASE_ROOMS: RoomConfig[] = [
  { maxPlayers: 10, price: '0.01' },
  { maxPlayers: 10, price: '0.001' },
  { maxPlayers: 10, price: '0.0005' },
  { maxPlayers: 20, price: '0.01' },
  { maxPlayers: 20, price: '0.001' },
  { maxPlayers: 20, price: '0.0005' },
  { maxPlayers: 50, price: '0.01' },
  { maxPlayers: 50, price: '0.001' },
  { maxPlayers: 50, price: '0.0005' },
  { maxPlayers: 100, price: '0.01' },
  { maxPlayers: 100, price: '0.001' },
  { maxPlayers: 100, price: '0.0005' },
  { maxPlayers: 1000, price: '0.01' },
  { maxPlayers: 1000, price: '0.001' },
  { maxPlayers: 1000, price: '0.0005' },
];

const PRICE_API =
  'https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH,MATIC&tsyms=USD';

async function fetchPrices() {
  const res = await fetch(PRICE_API);
  if (!res.ok) {
    throw new Error('failed to fetch prices');
  }
  const data = await res.json();
  const eth = data?.ETH?.USD;
  const matic = data?.MATIC?.USD;
  if (!eth || !matic) {
    throw new Error('invalid price data');
  }
  return { eth, matic };
}

export async function getRooms(network: Network): Promise<RoomConfig[]> {
  if (network === 'test') return BASE_ROOMS;
  const { eth, matic } = await fetchPrices();
  const factor = eth / matic;
  return BASE_ROOMS.map((room) => ({
    maxPlayers: room.maxPlayers,
    price: (parseFloat(room.price) * factor).toFixed(6),
  }));
}
