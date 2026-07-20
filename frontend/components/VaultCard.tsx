"use client";

import { useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { CONTRACTS, VAULT_ABI, ERC20_ABI } from "@/lib/contracts";

interface Asset {
  symbol: string;
  name: string;
  address: string;
  color: string;
  priceKey: string;
  isMock: boolean;
  decimals: number;
  howToGet: string;
  faucetUrl: string | null;
}

export function VaultCard({ asset }: { asset: Asset }) {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const [showHowToGet, setShowHowToGet] = useState(false);

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const { data: position } = useReadContract({
    address: CONTRACTS.VAULT as `0x${string}`,
    abi: VAULT_ABI,
    functionName: "getUserPosition",
    args: address ? [address, asset.address as `0x${string}`] : undefined,
    query: { enabled: !!address, refetchInterval: 4000 },
  });

  const { data: walletBalance } = useReadContract({
    address: asset.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 4000 },
  });

  const { data: allowance } = useReadContract({
    address: asset.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, CONTRACTS.VAULT as `0x${string}`] : undefined,
    query: { enabled: !!address, refetchInterval: 4000 },
  });

  // Use asset-specific decimals for formatting
  const decimals = asset.decimals;
  const deposited   = position ? Number(formatUnits(position[0], 18)) : 0;
  const usdValue    = position ? Number(position[1]) / 1e6 : 0;
  const yieldEarned = position ? Number(formatUnits(position[2], 18)) : 0;
  const apy         = position ? Number(position[3]) / 100 : 0;
  const shares      = position ? Number(formatUnits(position[4], 18)) : 0;
  const balance     = walletBalance ? Number(formatUnits(walletBalance, decimals)) : 0;
  const currentAllowance = allowance ? Number(formatUnits(allowance, decimals)) : 0;
  const amountNum   = parseFloat(amount) || 0;
  const needsApproval = mode === "deposit" && amountNum > 0 && currentAllowance < amountNum;
  const isLoading   = isPending || isConfirming;

  const handleMint = () => {
    if (!address || !asset.isMock) return;
    writeContract({
      address: asset.address as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "mint",
      args: [address, parseUnits("1000", decimals)],
    });
  };

  const handleApprove = () => {
    writeContract({
      address: asset.address as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CONTRACTS.VAULT as `0x${string}`, parseUnits("999999", decimals)],
    });
  };

  const handleDeposit = () => {
    if (!amountNum || !amount) return;
    writeContract({
      address: CONTRACTS.VAULT as `0x${string}`,
      abi: VAULT_ABI,
      functionName: "deposit",
      args: [asset.address as `0x${string}`, parseUnits(amount, decimals)],
    });
  };

  const handleWithdraw = () => {
    if (!amountNum || !amount) return;
    writeContract({
      address: CONTRACTS.VAULT as `0x${string}`,
      abi: VAULT_ABI,
      functionName: "withdraw",
      args: [asset.address as `0x${string}`, parseUnits(amount, 18)],
    });
  };

  return (
    <div style={{ background: "#0D1220", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ height: 3, background: asset.color }} />
      <div style={{ padding: 20 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: asset.color + "20", border: "1px solid " + asset.color + "40", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 700, color: asset.color, flexShrink: 0 }}>
            {asset.symbol[1]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#FFFFFF" }}>{asset.symbol}</span>
              {!asset.isMock && (
                <span style={{ fontSize: 9, fontWeight: 700, color: "#00D4AA", background: "rgba(0,212,170,0.12)", border: "1px solid rgba(0,212,170,0.25)", padding: "2px 6px", borderRadius: 4, letterSpacing: "0.06em" }}>REAL FASSET</span>
              )}
            </div>
            <div style={{ fontSize: 11, color: "#64748B" }}>{asset.name}</div>
          </div>
          <div style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", fontSize: 12, fontWeight: 700, color: "#22C55E", flexShrink: 0 }}>
            {apy > 0 ? apy.toFixed(2) + "% APY" : "4.20% APY"}
          </div>
        </div>

        {/* Position stats */}
        {isConnected && (
          <div style={{ background: "#080C14", borderRadius: 10, padding: "12px 14px", marginBottom: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: "#64748B", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>Deposited</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#E2EAF4", fontFamily: "monospace" }}>{deposited.toFixed(4)} {asset.symbol}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#64748B", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>Wallet Balance</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: balance > 0 ? "#FFFFFF" : "#E2EAF4", fontFamily: "monospace" }}>{balance.toFixed(asset.decimals === 6 ? 2 : 4)} {asset.symbol}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#64748B", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>Yield Earned</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#22C55E", fontFamily: "monospace" }}>+{yieldEarned.toFixed(6)} {asset.symbol}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#64748B", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>USD Value</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#E2EAF4", fontFamily: "monospace" }}>${usdValue.toFixed(2)}</div>
            </div>
          </div>
        )}

        {/* How to get tokens */}
        <div style={{ marginBottom: 12 }}>
          <button onClick={() => setShowHowToGet(!showHowToGet)} style={{ width: "100%", padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", background: "transparent", color: "#64748B", fontSize: 12, fontWeight: 500, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>How to get {asset.symbol}</span>
            <span style={{ fontSize: 10 }}>{showHowToGet ? "▲" : "▼"}</span>
          </button>
          {showHowToGet && (
            <div style={{ marginTop: 6, padding: "12px 14px", borderRadius: 8, background: "#080C14", border: "1px solid rgba(255,255,255,0.04)" }}>
              <p style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.7, margin: "0 0 8px" }}>{asset.howToGet}</p>
              {asset.faucetUrl ? (
                <a href={asset.faucetUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "7px 16px", borderRadius: 7, background: "rgba(0,212,170,0.1)", border: "1px solid rgba(0,212,170,0.25)", color: "#00D4AA", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>Open Flare Faucet</a>
              ) : isConnected ? (
                <button onClick={handleMint} disabled={isLoading} style={{ padding: "7px 16px", borderRadius: 7, background: asset.color + "15", border: "1px solid " + asset.color + "40", color: asset.color, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  {isLoading ? "Minting..." : "Mint 1000 " + asset.symbol}
                </button>
              ) : (
                <span style={{ fontSize: 12, color: "#64748B" }}>Connect wallet to mint</span>
              )}
            </div>
          )}
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", background: "#080C14", borderRadius: 8, padding: 3, marginBottom: 12 }}>
          {(["deposit", "withdraw"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: "7px 0", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: mode === m ? asset.color : "transparent", color: mode === m ? "#080C14" : "#64748B", transition: "all 0.15s" }}>
              {m === "deposit" ? "Deposit" : "Withdraw"}
            </button>
          ))}
        </div>

        {/* Amount input */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: "#64748B" }}>Amount</span>
            {isConnected && (
              <button onClick={() => setAmount(mode === "deposit" ? balance.toFixed(asset.decimals === 6 ? 2 : 4) : shares.toFixed(4))} style={{ fontSize: 11, color: asset.color, background: "none", border: "none", cursor: "pointer" }}>MAX</button>
            )}
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "#080C14", color: "#FFFFFF", fontSize: 16, outline: "none", fontFamily: "monospace", boxSizing: "border-box" }}
          />
        </div>

        {/* Action button */}
        {!isConnected ? (
          <div style={{ textAlign: "center", padding: "12px 0", fontSize: 13, color: "#64748B" }}>Connect wallet to interact</div>
        ) : needsApproval ? (
          <button onClick={handleApprove} disabled={isLoading} style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "none", background: "#3B82F6", color: "#FFFFFF", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            {isLoading ? "Approving..." : "Approve " + asset.symbol}
          </button>
        ) : (
          <button onClick={mode === "deposit" ? handleDeposit : handleWithdraw} disabled={isLoading || !amountNum} style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "none", background: !amountNum ? "#1E293B" : asset.color, color: !amountNum ? "#64748B" : "#080C14", fontSize: 14, fontWeight: 700, cursor: amountNum ? "pointer" : "not-allowed" }}>
            {isLoading ? "Processing..." : mode === "deposit" ? "Deposit " + asset.symbol : "Withdraw " + asset.symbol}
          </button>
        )}

        {/* Success */}
        {isSuccess && (
          <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 8, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", fontSize: 12, color: "#22C55E", textAlign: "center" }}>
            Transaction confirmed
          </div>
        )}

        {/* Explorer */}
        <div style={{ marginTop: 12, textAlign: "center" }}>
          <a href={"https://coston2.testnet.flarescan.com/address/" + asset.address} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#64748B", textDecoration: "none" }}>View on Flarescan</a>
        </div>

      </div>
    </div>
  );
}