"use client";

import { useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { CONTRACTS, VAULT_ABI, ERC20_ABI } from "@/lib/contracts";

interface Asset {
  symbol: string;
  name: string;
  address: string;
  color: string;
  priceKey: string;
}

export function VaultCard({ asset }: { asset: Asset }) {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const { data: position } = useReadContract({
    address: CONTRACTS.VAULT as `0x${string}`,
    abi: VAULT_ABI,
    functionName: "getUserPosition",
    args: address ? [address, asset.address as `0x${string}`] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const { data: walletBalance } = useReadContract({
    address: asset.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const { data: allowance } = useReadContract({
    address: asset.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, CONTRACTS.VAULT as `0x${string}`] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const deposited = position ? Number(formatEther(position[0])) : 0;
  const usdValue = position ? Number(position[1]) / 1e6 : 0;
  const yieldEarned = position ? Number(formatEther(position[2])) : 0;
  const apy = position ? Number(position[3]) / 100 : 0;
  const shares = position ? Number(formatEther(position[4])) : 0;
  const balance = walletBalance ? Number(formatEther(walletBalance)) : 0;
  const currentAllowance = allowance ? Number(formatEther(allowance)) : 0;
  const amountNum = parseFloat(amount) || 0;
  const needsApproval = mode === "deposit" && amountNum > 0 && currentAllowance < amountNum;
  const isLoading = isPending || isConfirming;

  const handleMint = () => {
    if (!address) return;
    writeContract({
      address: asset.address as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "mint",
      args: [address, parseEther("1000")],
    });
  };

  const handleApprove = () => {
    writeContract({
      address: asset.address as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CONTRACTS.VAULT as `0x${string}`, parseEther("999999")],
    });
  };

  const handleDeposit = () => {
    if (!amountNum) return;
    writeContract({
      address: CONTRACTS.VAULT as `0x${string}`,
      abi: VAULT_ABI,
      functionName: "deposit",
      args: [asset.address as `0x${string}`, parseEther(amount)],
    });
  };

  const handleWithdraw = () => {
    if (!amountNum) return;
    writeContract({
      address: CONTRACTS.VAULT as `0x${string}`,
      abi: VAULT_ABI,
      functionName: "withdraw",
      args: [asset.address as `0x${string}`, parseEther(amount)],
    });
  };

  const cardStyle: React.CSSProperties = {
    background: "#0D1220",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16,
    overflow: "hidden",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    color: "#64748B",
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  };

  const valueStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    color: "#E2EAF4",
    fontFamily: "monospace",
  };

  return (
    <div style={cardStyle}>
      <div style={{ height: 3, background: asset.color }} />
      <div style={{ padding: 20 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: asset.color + "20",
              border: "1px solid " + asset.color + "40",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 700, color: asset.color,
            }}>
              {asset.symbol[1]}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF" }}>{asset.symbol}</div>
              <div style={{ fontSize: 11, color: "#64748B" }}>{asset.name}</div>
            </div>
          </div>
          <div style={{
            padding: "4px 10px", borderRadius: 8,
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.2)",
            fontSize: 12, fontWeight: 700, color: "#22C55E",
          }}>
            {apy > 0 ? apy.toFixed(2) + "% APY" : "-- APY"}
          </div>
        </div>

        {/* Position grid */}
        {isConnected && (
          <div style={{
            background: "#080C14", borderRadius: 10,
            padding: "12px 14px", marginBottom: 16,
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
          }}>
            <div>
              <div style={labelStyle}>Deposited</div>
              <div style={valueStyle}>{deposited.toFixed(4)} {asset.symbol}</div>
            </div>
            <div>
              <div style={labelStyle}>USD Value</div>
              <div style={valueStyle}>${usdValue.toFixed(2)}</div>
            </div>
            <div>
              <div style={labelStyle}>Yield Earned</div>
              <div style={{ ...valueStyle, color: "#22C55E" }}>+{yieldEarned.toFixed(6)} {asset.symbol}</div>
            </div>
            <div>
              <div style={labelStyle}>Wallet Balance</div>
              <div style={valueStyle}>{balance.toFixed(2)} {asset.symbol}</div>
            </div>
          </div>
        )}

        {/* Mode toggle */}
        <div style={{
          display: "flex", background: "#080C14",
          borderRadius: 8, padding: 3, marginBottom: 12,
        }}>
          {(["deposit", "withdraw"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: "7px 0", borderRadius: 6, border: "none",
              cursor: "pointer", fontSize: 13, fontWeight: 600,
              background: mode === m ? asset.color : "transparent",
              color: mode === m ? "#080C14" : "#64748B",
            }}>
              {m === "deposit" ? "Deposit" : "Withdraw"}
            </button>
          ))}
        </div>

        {/* Amount input */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: "#64748B" }}>Amount</span>
            {isConnected && (
              <button
                onClick={() => setAmount(mode === "deposit" ? balance.toString() : shares.toString())}
                style={{ fontSize: 11, color: asset.color, background: "none", border: "none", cursor: "pointer" }}
              >
                MAX
              </button>
            )}
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            style={{
              width: "100%", padding: "10px 14px", borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "#080C14", color: "#FFFFFF",
              fontSize: 16, outline: "none", fontFamily: "monospace",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Buttons */}
        {!isConnected ? (
          <div style={{ textAlign: "center", padding: "12px 0", fontSize: 13, color: "#64748B" }}>
            Connect wallet to interact
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={handleMint} disabled={isLoading} style={{
              padding: "9px 0", borderRadius: 10,
              border: "1px solid " + asset.color + "40",
              background: asset.color + "10",
              color: asset.color, fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>
              Mint 1000 Test {asset.symbol}
            </button>

            {needsApproval ? (
              <button onClick={handleApprove} disabled={isLoading} style={{
                padding: "11px 0", borderRadius: 10, border: "none",
                background: "#3B82F6", color: "#FFFFFF",
                fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}>
                {isLoading ? "Approving..." : "Approve " + asset.symbol}
              </button>
            ) : (
              <button
                onClick={mode === "deposit" ? handleDeposit : handleWithdraw}
                disabled={isLoading || !amountNum}
                style={{
                  padding: "11px 0", borderRadius: 10, border: "none",
                  background: !amountNum ? "#1E293B" : asset.color,
                  color: !amountNum ? "#64748B" : "#080C14",
                  fontSize: 14, fontWeight: 700,
                  cursor: amountNum ? "pointer" : "not-allowed",
                }}
              >
                {isLoading ? "Processing..." : mode === "deposit" ? "Deposit " + asset.symbol : "Withdraw " + asset.symbol}
              </button>
            )}
          </div>
        )}

        {/* Success message */}
        {isSuccess && (
          <div style={{
            marginTop: 10, padding: "8px 12px", borderRadius: 8,
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.2)",
            fontSize: 12, color: "#22C55E", textAlign: "center",
          }}>
            Transaction confirmed
          </div>
        )}

        {/* Explorer link */}
        <div style={{ marginTop: 12, textAlign: "center" }}>
          <a href={"https://coston2.testnet.flarescan.com/address/" + asset.address} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#64748B", textDecoration: "none" }}>View on Flarescan</a>
        </div>

      </div>
    </div>
  );
}