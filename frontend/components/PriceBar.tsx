"use client";

import { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";

const client = createPublicClient({
  transport: http("https://coston2-api.flare.network/ext/C/rpc"),
});

const FTSO_V2 = "0xC4e9c78EA53db782E28f28Fdf80BaF59336B304d" as `0x${string}`;

const FTSO_ABI = [{
  name: "getFeedById",
  type: "function" as const,
  stateMutability: "view" as const,
  inputs: [{ name: "_feedId", type: "bytes21" }],
  outputs: [
    { name: "_value", type: "uint256" },
    { name: "_decimals", type: "int8" },
    { name: "_timestamp", type: "uint64" },
  ],
}];

const FEEDS = {
  BTC:  "0x014254432f55534400000000000000000000000000" as `0x${string}`,
  XRP:  "0x015852502f55534400000000000000000000000000" as `0x${string}`,
  DOGE: "0x01444f47452f555344000000000000000000000000" as `0x${string}`,
};

function formatPrice(value: bigint, decimals: number): string {
  const divisor = Math.pow(10, Math.abs(decimals));
  const price = Number(value) / divisor;
  if (price > 1000) return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price > 1) return price.toFixed(4);
  return price.toFixed(6);
}

interface PriceData {
  value: bigint;
  decimals: number;
  loading: boolean;
  error: boolean;
}

const defaultPrice: PriceData = { value: BigInt(0), decimals: 2, loading: true, error: false };

export function PriceBar() {
  const [prices, setPrices] = useState({
    BTC:  { ...defaultPrice },
    XRP:  { ...defaultPrice },
    DOGE: { ...defaultPrice },
  });

  const fetchPrices = async () => {
    try {
      const [btcRes, xrpRes, dogeRes] = await Promise.all([
        client.readContract({
          address: FTSO_V2,
          abi: FTSO_ABI,
          functionName: "getFeedById",
          args: [FEEDS.BTC],
        }),
        client.readContract({
          address: FTSO_V2,
          abi: FTSO_ABI,
          functionName: "getFeedById",
          args: [FEEDS.XRP],
        }),
        client.readContract({
          address: FTSO_V2,
          abi: FTSO_ABI,
          functionName: "getFeedById",
          args: [FEEDS.DOGE],
        }),
      ]);

      setPrices({
        BTC:  { value: btcRes[0] as bigint, decimals: Number(btcRes[1]),  loading: false, error: false },
        XRP:  { value: xrpRes[0] as bigint, decimals: Number(xrpRes[1]),  loading: false, error: false },
        DOGE: { value: dogeRes[0] as bigint, decimals: Number(dogeRes[1]), loading: false, error: false },
      });
    } catch (e) {
      console.error("FTSO fetch error:", e);
      setPrices((prev) => ({
        BTC:  { ...prev.BTC,  loading: false, error: true },
        XRP:  { ...prev.XRP,  loading: false, error: true },
        DOGE: { ...prev.DOGE, loading: false, error: true },
      }));
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 3000);
    return () => clearInterval(interval);
  }, []);

  const items = [
    { label: "BTC",  data: prices.BTC,  color: "#F7931A" },
    { label: "XRP",  data: prices.XRP,  color: "#00AAE4" },
    { label: "DOGE", data: prices.DOGE, color: "#C2A633" },
  ];

  return (
    <div style={{ background: "#0D1220", borderBottom: "1px solid rgba(0,212,170,0.12)", padding: "8px 24px" }}>
      <div style={{ maxWidth: 1152, margin: "0 auto", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00D4AA" }} />
          <span style={{ fontSize: 11, color: "#64748B", fontWeight: 600, letterSpacing: "0.06em" }}>LIVE FTSO</span>
        </div>
        {items.map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: item.color, fontWeight: 700 }}>{item.label}</span>
            <span style={{ fontSize: 13, color: "#E2EAF4", fontFamily: "monospace" }}>
              {item.data.loading
                ? "$---"
                : item.data.error
                ? "$err"
                : "$" + formatPrice(item.data.value, item.data.decimals)}
            </span>
          </div>
        ))}
        <span style={{ fontSize: 11, color: "#64748B", marginLeft: "auto" }}>
          Updates every ~1.8s · Flare Coston2
        </span>
      </div>
    </div>
  );
}