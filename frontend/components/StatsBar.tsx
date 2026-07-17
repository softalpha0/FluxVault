"use client";

import { useReadContract } from "wagmi";
import { CONTRACTS, VAULT_ABI, ASSETS } from "@/lib/contracts";

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div
      style={{
        background: "#0D1220",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 14,
        padding: "16px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: color || "#00D4AA",
        }}
      />
      <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600,
        letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: "#FFFFFF",
        letterSpacing: "-0.02em" }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>{sub}</div>
      )}
    </div>
  );
}

export function StatsBar() {
  const { data: fxrpTVL } = useReadContract({
    address: CONTRACTS.VAULT as `0x${string}`,
    abi: VAULT_ABI,
    functionName: "totalDeposited",
    args: [CONTRACTS.FXRP as `0x${string}`],
    query: { refetchInterval: 5000 },
  });

  const { data: fbtcTVL } = useReadContract({
    address: CONTRACTS.VAULT as `0x${string}`,
    abi: VAULT_ABI,
    functionName: "totalDeposited",
    args: [CONTRACTS.FBTC as `0x${string}`],
    query: { refetchInterval: 5000 },
  });

  const { data: fdogeTVL } = useReadContract({
    address: CONTRACTS.VAULT as `0x${string}`,
    abi: VAULT_ABI,
    functionName: "totalDeposited",
    args: [CONTRACTS.FDOGE as `0x${string}`],
    query: { refetchInterval: 5000 },
  });

  const totalDeposits =
    (fxrpTVL ? Number(fxrpTVL) / 1e18 : 0) +
    (fbtcTVL ? Number(fbtcTVL) / 1e18 : 0) +
    (fdogeTVL ? Number(fdogeTVL) / 1e18 : 0);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 12,
        marginBottom: 24,
      }}
    >
      <StatCard
        label="Total Deposited"
        value={totalDeposits > 0 ? totalDeposits.toFixed(4) : "0.00"}
        sub="Across all FAssets"
        color="#00D4AA"
      />
      <StatCard
        label="Supported Assets"
        value={ASSETS.length.toString()}
        sub="FXRP · FBTC · FDOGE"
        color="#3B82F6"
      />
      <StatCard
        label="Network"
        value="Coston2"
        sub="Flare Testnet · Chain 114"
        color="#8B5CF6"
      />
      <StatCard
        label="Oracle"
        value="FTSO"
        sub="Live prices every ~1.8s"
        color="#F59E0B"
      />
    </div>
  );
}