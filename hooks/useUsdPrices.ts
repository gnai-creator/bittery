'use client';
import { useEffect, useState } from 'react';

export interface Prices {
  ETH?: number;
  MATIC?: number;
}

const API_URL =
  'https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH,MATIC&tsyms=USD';

export function useUsdPrices() {
  const [prices, setPrices] = useState<Prices>({});

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('fetch error');
        const data = await res.json();
        const next = { ETH: data.ETH.USD, MATIC: data.MATIC.USD } as Prices;
        setPrices(next);
        if (typeof window !== 'undefined') {
          localStorage.setItem('usd_prices', JSON.stringify({ time: Date.now(), data: next }));
        }
      } catch {
        if (typeof window !== 'undefined') {
          const cached = localStorage.getItem('usd_prices');
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              setPrices(parsed.data);
            } catch {}
          }
        }
      }
    };
    fetchPrices();
    const id = setInterval(fetchPrices, 60000);
    return () => clearInterval(id);
  }, []);

  return prices;
}

