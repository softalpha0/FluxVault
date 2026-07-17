"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { ASSETS } from "@/lib/contracts";
import Link from "next/link";

const PriceBar = dynamic(
  () => import("@/components/PriceBar").then((m) => ({ default: m.PriceBar })),
  { ssr: false }
);
const StatsBar = dynamic(
  () => import("@/components/StatsBar").then((m) => ({ default: m.StatsBar })),
  { ssr: false }
);
const VaultCard = dynamic(
  () => import("@/components/VaultCard").then((m) => ({ default: m.VaultCard })),
  { ssr: false }
);

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useAccount();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen" style={{ background: "#080C14" }}>
        <header style={{ background: "#0D1220", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ maxWidth: 1152, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #00D4AA, #00A882)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 14, height: 14, borderRadius: 2, background: "#080C14", transform: "rotate(45deg)" }} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#FFFFFF" }}>FluxVault</div>
            </div>
          </div>
        </header>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
          <div style={{ fontSize: 14, color: "#64748B" }}>Loading...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: "#080C14" }}>

      {/* Header */}
      <header style={{ background: "#0D1220", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo — links to landing */}
          <Link href="/landing" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #00D4AA, #00A882)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 14, height: 14, borderRadius: 2, background: "#080C14", transform: "rotate(45deg)" }} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>FluxVault</div>
              <div style={{ fontSize: 11, color: "#64748B" }}>FAsset Yield Optimizer · Flare Coston2</div>
            </div>
          </Link>

          {/* Nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Link href="/landing" style={{ fontSize: 13, color: "#94A3B8", textDecoration: "none", fontWeight: 500 }}>Home</Link>
            <Link href="/docs" style={{ fontSize: 13, color: "#94A3B8", textDecoration: "none", fontWeight: 500 }}>Docs</Link>
            <ConnectButton />
          </div>

        </div>
      </header>

      {/* Live FTSO Price Bar */}
      <PriceBar />

      <div style={{ maxWidth: 1152, margin: "0 auto", padding: "32px 24px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em", marginBottom: 12 }}>
            Earn yield on your <span style={{ color: "#00D4AA" }}>FAssets</span>
          </h1>
          <p style={{ fontSize: 15, color: "#94A3B8", maxWidth: 480, margin: "0 auto" }}>
            Deposit FXRP, FBTC, or FDOGE and earn optimized yield automatically. Powered by Flare FTSO oracle.
          </p>
        </div>

        {/* Stats */}
        <StatsBar />

        {/* Not connected */}
        {!isConnected && (
          <div style={{ textAlign: "center", padding: "48px 24px", background: "#0D1220", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, marginBottom: 24 }}>
            <div style={{ fontSize: 16, color: "#E2EAF4", marginBottom: 8 }}>Connect your wallet to start earning</div>
            <div style={{ fontSize: 13, color: "#64748B" }}>Switch MetaMask to Flare Testnet Coston2 (Chain ID: 114)</div>
          </div>
        )}

        {/* Vault Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
          {ASSETS.map((asset) => (
            <VaultCard key={asset.symbol} asset={asset} />
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 48, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 12, color: "#64748B" }}>
          FluxVault · Built on Flare · Powered by FTSO · Flare Summer Signal 2026
          <span style={{ margin: "0 12px" }}>·</span>
          <Link href="/landing" style={{ color: "#64748B", textDecoration: "none" }}>About</Link>
          <span style={{ margin: "0 12px" }}>·</span>
          <Link href="/docs" style={{ color: "#64748B", textDecoration: "none" }}>Documentation</Link>
        </div>

      </div>
    </main>
  );
}