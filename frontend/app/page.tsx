"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { ASSETS } from "@/lib/contracts";

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
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "linear-gradient(135deg, #00D4AA, #00A882)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
              }}>⚡</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#FFFFFF" }}>FluxVault</div>
                <div style={{ fontSize: 11, color: "#64748B" }}>FAsset Yield Optimizer · Flare Coston2</div>
              </div>
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
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #00D4AA, #00A882)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
            }}>⚡</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
                FluxVault
              </div>
              <div style={{ fontSize: 11, color: "#64748B" }}>
                FAsset Yield Optimizer · Flare Coston2
              </div>
            </div>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Live FTSO Price Bar */}
      <PriceBar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 style={{
            fontSize: 36, fontWeight: 800, color: "#FFFFFF",
            letterSpacing: "-0.02em", marginBottom: 12,
          }}>
            Earn yield on your{" "}
            <span style={{ color: "#00D4AA" }}>FAssets</span>
          </h1>
          <p style={{ fontSize: 15, color: "#94A3B8", maxWidth: 480, margin: "0 auto" }}>
            Deposit FXRP, FBTC, or FDOGE and earn optimized yield automatically.
            Powered by Flare FTSO oracle.
          </p>
        </div>

        {/* Stats */}
        <StatsBar />

        {/* Not connected */}
        {!isConnected && (
          <div style={{
            textAlign: "center", padding: "48px 24px",
            background: "#0D1220",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16, marginBottom: 24,
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔗</div>
            <div style={{ fontSize: 16, color: "#E2EAF4", marginBottom: 8 }}>
              Connect your wallet to start earning
            </div>
            <div style={{ fontSize: 13, color: "#64748B" }}>
              Switch MetaMask to Flare Testnet Coston2 (Chain ID: 114)
            </div>
          </div>
        )}

        {/* Vault Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 16,
        }}>
          {ASSETS.map((asset) => (
            <VaultCard key={asset.symbol} asset={asset} />
          ))}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: "center", marginTop: 48, paddingTop: 24,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          fontSize: 12, color: "#64748B",
        }}>
          FluxVault · Built on Flare · Powered by FTSO · Flare Summer Signal 2026
        </div>
      </div>
    </main>
  );
}