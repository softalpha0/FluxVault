"use client";

import { useReadContract } from "wagmi";
import { CONTRACTS, FTSO_ABI } from "@/lib/contracts";

function formatPrice(price: bigint | undefined, decimals: number | undefined): string {
  if (!price || decimals === undefined) return "---";
  const divisor = Math.pow(10, Math.abs(decimals));
  const value = Number(price) / divisor;
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

function PriceItem({
  label,
  price,
  decimals,
  color,
}: {
  label: string;
  price: bigint | undefined;
  decimals: number | undefined;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ color, fontSize: 12, fontWeight: 700 }}>{label}</span>
      <span style={{ color: "#E2EAF4", fontSize: 13, fontFamily: "monospace" }}>
        ${formatPrice(price, decimals)}
      </span>
    </div>
  );
}

export function PriceBar() {
  const { data: btcData } = useReadContract({
    address: CONTRACTS.FTSO as `0x${string}`,
    abi: FTSO_ABI,
    functionName: "getBTCPrice",
    query: { refetchInterval: 3000 },
  });

  const { data: xrpData } = useReadContract({
    address: CONTRACTS.FTSO as `0x${string}`,
    abi: FTSO_ABI,
    functionName: "getXRPPrice",
    query: { refetchInterval: 3000 },
  });

  const { data: dogeData } = useReadContract({
    address: CONTRACTS.FTSO as `0x${string}`,
    abi: FTSO_ABI,
    functionName: "getDOGEPrice",
    query: { refetchInterval: 3000 },
  });

  return (
    <div
      style={{
        background: "#0D1220",
        borderBottom: "1px solid rgba(0,212,170,0.15)",
        padding: "8px 24px",
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#00D4AA",
              animation: "pulse 2s infinite",
            }}
          />
          <span style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>
            LIVE FTSO
          </span>
        </div>

        <PriceItem
          label="BTC"
          price={btcData?.[0]}
          decimals={btcData?.[1]}
          color="#F7931A"
        />
        <PriceItem
          label="XRP"
          price={xrpData?.[0]}
          decimals={xrpData?.[1]}
          color="#00AAE4"
        />
        <PriceItem
          label="DOGE"
          price={dogeData?.[0]}
          decimals={dogeData?.[1]}
          color="#C2A633"
        />

        <span style={{ fontSize: 11, color: "#64748B", marginLeft: "auto" }}>
          Updates every ~1.8s · Flare Coston2
        </span>
      </div>
    </div>
  );
}
