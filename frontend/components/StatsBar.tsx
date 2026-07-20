"use client";

import { useReadContract, useAccount } from "wagmi";
import { createPublicClient, http, formatUnits } from "viem";
import { useEffect, useState } from "react";
import { CONTRACTS, VAULT_ABI, FDC_ABI, FTSO_FEEDS, ASSETS } from "@/lib/contracts";

const client = createPublicClient({
  transport: http("https://coston2-api.flare.network/ext/C/rpc"),
});

const FTSO_V2 = "0xC4e9c78EA53db782E28f28Fdf80BaF59336B304d" as `0x${string}`;

const FTSO_ABI_READ = [{
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

function StatCard({ label, value, sub, color = "#00D4AA" }: {
  label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div style={{ background: "#0D1220", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "16px 20px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: color }} />
      <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.02em" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export function StatsBar() {
  const { address } = useAccount();
  const [tvl, setTvl] = useState("0.00");
  const [xrpPrice, setXrpPrice] = useState("---");

  const { data: fxrpTotal } = useReadContract({
    address: CONTRACTS.VAULT as `0x${string}`,
    abi: VAULT_ABI,
    functionName: "getTotalDeposited",
    args: [CONTRACTS.FXRP as `0x${string}`],
    query: { refetchInterval: 5000 },
  });

  const { data: fbtcTotal } = useReadContract({
    address: CONTRACTS.VAULT as `0x${string}`,
    abi: VAULT_ABI,
    functionName: "getTotalDeposited",
    args: [CONTRACTS.FBTC as `0x${string}`],
    query: { refetchInterval: 5000 },
  });

  const { data: fdogeTotal } = useReadContract({
    address: CONTRACTS.VAULT as `0x${string}`,
    abi: VAULT_ABI,
    functionName: "getTotalDeposited",
    args: [CONTRACTS.FDOGE as `0x${string}`],
    query: { refetchInterval: 5000 },
  });

  const { data: fdcVerified } = useReadContract({
    address: CONTRACTS.FDC_VERIFIER as `0x${string}`,
    abi: FDC_ABI,
    functionName: "getVerifiedAmount",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 10000 },
  });

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await client.readContract({
          address: FTSO_V2,
          abi: FTSO_ABI_READ,
          functionName: "getFeedById",
          args: [FTSO_FEEDS.XRP],
        });
        const price = Number(res[0] as bigint) / Math.pow(10, Math.abs(Number(res[1])));
        setXrpPrice("$" + price.toFixed(4));
        const fxrpAmt   = fxrpTotal  ? Number(formatUnits(fxrpTotal  as bigint, 18)) : 0;
        const fbtcAmt   = fbtcTotal  ? Number(formatUnits(fbtcTotal  as bigint, 18)) : 0;
        const fdogeAmt  = fdogeTotal ? Number(formatUnits(fdogeTotal as bigint, 18)) : 0;
        setTvl((fxrpAmt + fbtcAmt + fdogeAmt).toFixed(4));
      } catch (e) {
        console.error("FTSO price error:", e);
      }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 5000);
    return () => clearInterval(interval);
  }, [fxrpTotal, fbtcTotal, fdogeTotal]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
      <StatCard
        label="Total Deposited"
        value={tvl}
        sub="Across all FAssets"
        color="#00D4AA"
      />
      <StatCard
        label="XRP Price (FTSO)"
        value={xrpPrice}
        sub="Live from Flare oracle"
        color="#00AAE4"
      />
      <StatCard
        label="FDC Verified"
        value={fdcVerified ? Number(formatUnits(fdcVerified as bigint, 6)).toFixed(2) : "0.00"}
        sub="Cross-chain proofs"
        color="#8B5CF6"
      />
      <StatCard
        label="Network"
        value="Coston2"
        sub="Flare Testnet · Chain 114"
        color="#3B82F6"
      />
    </div>
  );
}