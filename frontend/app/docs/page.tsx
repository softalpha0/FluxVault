"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const sections = [
  { id: "introduction", title: "Introduction" },
  { id: "the-problem", title: "The Problem" },
  { id: "why-flare", title: "Why Flare" },
  { id: "how-fluxvault-works", title: "How FluxVault Works" },
  { id: "ftso-integration", title: "FTSO Integration" },
  { id: "fasset-protocol", title: "FAsset Protocol" },
  { id: "getting-started", title: "Getting Started" },
  { id: "smart-contracts", title: "Smart Contracts" },
  { id: "security", title: "Security" },
  { id: "roadmap", title: "Roadmap" },
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} style={{ marginBottom: 64, paddingBottom: 64, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <h2 style={{ fontSize: 28, fontWeight: 700, color: "#FFFFFF", marginBottom: 20, letterSpacing: "-0.02em" }}>{title}</h2>
      {children}
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 15, color: "#94A3B8", lineHeight: 1.9, marginBottom: 16 }}>{children}</p>;
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontSize: 18, fontWeight: 600, color: "#E2EAF4", marginBottom: 12, marginTop: 28 }}>{children}</h3>;
}

function CodeBlock({ children }: { children: string }) {
  return (
    <div style={{ background: "#060A12", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "20px 24px", marginBottom: 20, marginTop: 8, overflowX: "auto" }}>
      <pre style={{ fontSize: 13, color: "#E2EAF4", lineHeight: 1.8, margin: 0, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{children}</pre>
    </div>
  );
}

function InfoBox({ children, color = "#00D4AA" }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{ padding: "16px 20px", borderRadius: 10, marginBottom: 20, background: color + "08", border: "1px solid " + color + "25", fontSize: 14, color: "#E2EAF4", lineHeight: 1.7 }}>
      {children}
    </div>
  );
}

function ContractRow({ name, role, addr }: { name: string; role: string; addr: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", flexWrap: "wrap", gap: 10 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#FFFFFF", marginBottom: 2 }}>{name}</div>
        <div style={{ fontSize: 12, color: "#64748B" }}>{role}</div>
      </div>
      <a href={"https://coston2.testnet.flarescan.com/address/" + addr} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#00D4AA", fontFamily: "monospace", textDecoration: "none", padding: "5px 12px", borderRadius: 6, background: "rgba(0,212,170,0.08)", border: "1px solid rgba(0,212,170,0.15)" }}>{addr.slice(0, 12)}...{addr.slice(-6)}</a>
    </div>
  );
}

export default function Docs() {
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("introduction");

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) setActiveSection(s.id);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted) return null;

  return (
    <main style={{ background: "#080C14", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif" }}>

      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(8,12,20,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "16px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, #00D4AA, #00A882)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: "#080C14", transform: "rotate(45deg)" }} />
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#FFFFFF" }}>FluxVault</span>
          </div>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 16 }}>/</span>
          <span style={{ fontSize: 14, color: "#64748B", fontWeight: 500 }}>Documentation</span>
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <Link href="/landing" style={{ fontSize: 13, color: "#94A3B8", textDecoration: "none" }}>Home</Link>
          <Link href="/" style={{ padding: "8px 20px", borderRadius: 8, background: "linear-gradient(135deg, #00D4AA, #00A882)", color: "#080C14", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Launch App</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 48px", display: "grid", gridTemplateColumns: "220px 1fr", gap: 60 }}>

        {/* Sidebar */}
        <div style={{ position: "sticky", top: 84, alignSelf: "start", maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
          <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>On this page</div>
          {sections.map((s) => (
            <a key={s.id} href={"#" + s.id} style={{ display: "block", padding: "7px 12px", borderRadius: 7, fontSize: 13, textDecoration: "none", marginBottom: 2, color: activeSection === s.id ? "#00D4AA" : "#64748B", background: activeSection === s.id ? "rgba(0,212,170,0.08)" : "transparent", borderLeft: `2px solid ${activeSection === s.id ? "#00D4AA" : "transparent"}`, transition: "all 0.2s", fontWeight: activeSection === s.id ? 600 : 400 }}>{s.title}</a>
          ))}
        </div>

        {/* Content */}
        <div style={{ minWidth: 0 }}>

          <div style={{ marginBottom: 56 }}>
            <div style={{ fontSize: 11, color: "#00D4AA", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 12 }}>FLUXVAULT DOCUMENTATION</div>
            <h1 style={{ fontSize: 40, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.03em", marginBottom: 12 }}>Everything you need to know</h1>
            <p style={{ fontSize: 16, color: "#94A3B8", lineHeight: 1.7 }}>FluxVault is a non-custodial yield optimizer built specifically for Flare FAssets. This document covers the protocol design, Flare integrations, and step-by-step usage guide.</p>
          </div>

          <Section id="introduction" title="Introduction">
            <P>FluxVault is the first yield optimizer built specifically for Flare FAssets. It allows holders of FXRP, FBTC, and FDOGE to deposit their assets into a non-custodial vault and earn yield automatically — without manually navigating DeFi protocols or managing positions.</P>
            <P>The protocol is designed around three principles: simplicity for the end user, deep integration with Flare-native infrastructure, and full non-custodial ownership of deposited assets at all times.</P>
            <InfoBox color="#00D4AA">FluxVault is currently deployed on Flare Testnet Coston2 (Chain ID: 114). All functionality is live and testable. Mainnet deployment is planned for Phase 2 of the roadmap.</InfoBox>
          </Section>

          <Section id="the-problem" title="The Problem">
            <P>Flare's FAssets protocol is a genuine breakthrough in blockchain interoperability. It allows holders of Bitcoin, XRP, and Dogecoin to bridge their assets to an EVM-compatible chain trustlessly — without a centralized bridge operator or wrapped token controlled by a company.</P>
            <P>The mechanism is backed by over-collateralization enforced by smart contracts, verified by Flare's Data Connector (FDC), and governed by decentralized agents rather than a single entity. This is meaningfully different from bridges like wBTC, which rely on centralized custodians.</P>
            <P>However, once minted, FAssets face a fundamental problem: there is no simple yield layer for them. DeFi on Flare is early. Most FAsset holders end up with FXRP or FBTC sitting idle in their wallets, earning nothing, while the underlying assets on their native chains could be staked or lent. The bridging solved the custody problem — but not the utility problem.</P>
            <H3>What FluxVault solves</H3>
            <P>FluxVault provides a single-click yield entry point for FAsset holders. Deposit any supported FAsset. Receive vault shares. Earn yield per second. Withdraw at any time with principal plus yield. The complexity of yield strategy management is handled by the vault — the user only needs to deposit and withdraw.</P>
          </Section>

          <Section id="why-flare" title="Why Flare">
            <P>FluxVault is not a protocol that happens to be deployed on Flare. It is a protocol that could only exist on Flare, because it depends on two pieces of infrastructure that are unique to the Flare network.</P>
            <H3>The Flare Time Series Oracle (FTSO)</H3>
            <P>On most blockchains, price feeds are provided by third-party oracle networks that charge fees, require trust in their operators, and introduce external dependencies into protocol design. On Flare, the oracle is different: it is enshrined in the protocol itself.</P>
            <P>The FTSO is operated by approximately 100 independent data providers who are economically incentivized through Flare's inflation mechanism. Price data is aggregated using a stake-weighted median and finalized every block — approximately every 1.8 seconds. This is not an external service that FluxVault integrates with. It is a native part of the Flare protocol that any smart contract can read for free.</P>
            <P>FluxVault reads BTC/USD, XRP/USD, and DOGE/USD prices from FTSO to display live USD values for each vault position. In future versions, FTSO price movements will also trigger automated rebalancing between yield sources.</P>
            <CodeBlock>{`// Reading FTSO price data on-chain
interface IFtsoV2 {
    function getFeedById(bytes21 _feedId) 
        external view 
        returns (uint256 price, int8 decimals, uint64 timestamp);
}

// Feed IDs are human-readable strings encoded as bytes21
bytes21 constant XRP_USD  = bytes21(bytes("FtsoV2/XRP/USD"));
bytes21 constant BTC_USD  = bytes21(bytes("FtsoV2/BTC/USD"));
bytes21 constant DOGE_USD = bytes21(bytes("FtsoV2/DOGE/USD"));`}</CodeBlock>
            <H3>The FAssets Protocol</H3>
            <P>FAssets are ERC-20 tokens on Flare that represent underlying assets from non-smart-contract chains. FXRP represents XRP. FBTC represents Bitcoin. FDOGE represents Dogecoin. Each FAsset is backed by the underlying asset held by agents who are over-collateralized — meaning if an agent fails, holders are compensated from collateral rather than losing their assets.</P>
            <P>The minting process is verified by the Flare Data Connector (FDC), which proves that the underlying asset was actually sent on its native chain before FXRP or FBTC is minted on Flare. This makes FAssets fundamentally different from centralized wrapped tokens: there is no company that can freeze your FBTC or deny your redemption.</P>
            <P>FluxVault accepts only FAssets as deposits. This is intentional. The protocol is designed around the Flare ecosystem and the specific assets that FAssets brings into DeFi.</P>
          </Section>

          <Section id="how-fluxvault-works" title="How FluxVault Works">
            <H3>Vault shares</H3>
            <P>When a user deposits FAssets, FluxVault mints FLUX shares proportional to their deposit relative to the total vault balance. This is the standard vault share pattern used by protocols like Yearn Finance. Shares represent a claim on the vault's assets — as yield accrues, each share becomes redeemable for more of the underlying asset.</P>
            <CodeBlock>{`// Share calculation on deposit
function _calculateShares(address asset, uint256 amount) 
    internal view returns (uint256) {
    uint256 supply = totalSupply();
    uint256 total  = totalDeposited[asset];
    if (supply == 0 || total == 0) return amount;
    return (amount * supply) / total;
}`}</CodeBlock>
            <H3>Yield accrual</H3>
            <P>Yield accrues continuously per second based on a configured APY expressed in basis points. The current APY is 4.20% (420 basis points) for all supported FAssets. Yield is calculated from the timestamp of the user's first deposit and accumulates until withdrawal.</P>
            <CodeBlock>{`// Yield calculation
function getYieldEarned(address user, address asset) 
    public view returns (uint256) {
    uint256 deposited = userDeposits[user][asset];
    if (deposited == 0) return 0;
    uint256 timeElapsed = block.timestamp - depositTimestamp[user][asset];
    uint256 apy = assetAPY[asset]; // 420 = 4.20%
    return (deposited * apy * timeElapsed) / (365 days * 10000);
}`}</CodeBlock>
            <H3>Withdrawal</H3>
            <P>When a user withdraws, they burn their FLUX shares and receive their proportional share of the vault's principal plus all yield earned since their deposit. The withdrawal amount is capped at the vault's available balance as a safety measure to prevent underflow in edge cases.</P>
            <InfoBox color="#3B82F6">There are no lock-up periods, withdrawal fees, or minimum holding times. Users can deposit and withdraw in the same block if they choose — though yield accrual only begins from the deposit block onward.</InfoBox>
          </Section>

          <Section id="ftso-integration" title="FTSO Integration">
            <P>FluxVault deploys a dedicated FTSOIntegration contract that serves as the interface between the vault logic and Flare's oracle infrastructure. This contract resolves the FtsoV2 address from Flare's ContractRegistry at deployment time, ensuring it always points to the correct oracle contract regardless of upgrades to the Flare protocol.</P>
            <H3>Price feeds used</H3>
            <div style={{ background: "#060A12", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
              {[
                { feed: "FtsoV2/BTC/USD", asset: "FBTC", update: "~1.8 seconds" },
                { feed: "FtsoV2/XRP/USD", asset: "FXRP", update: "~1.8 seconds" },
                { feed: "FtsoV2/DOGE/USD", asset: "FDOGE", update: "~1.8 seconds" },
              ].map((f, i) => (
                <div key={f.feed} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "14px 20px", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.04)" : "none", fontSize: 13, fontFamily: "monospace" }}>
                  <span style={{ color: "#00D4AA" }}>{f.feed}</span>
                  <span style={{ color: "#64748B" }}>{f.asset}</span>
                  <span style={{ color: "#64748B" }}>{f.update}</span>
                </div>
              ))}
            </div>
            <H3>Frontend integration</H3>
            <P>The frontend reads FTSO prices directly from the FTSOIntegration contract every 3 seconds using wagmi's useReadContract hook with polling enabled. This means users see live price updates without page refreshes, and the displayed USD value of their position updates continuously as markets move.</P>
          </Section>

          <Section id="fasset-protocol" title="FAsset Protocol">
            <P>Understanding how FAssets work is important context for understanding why FluxVault is designed the way it is.</P>
            <H3>Minting FAssets</H3>
            <P>A user who wants FXRP selects an agent on the Flare network. The agent quotes a minting fee and reserves collateral. The user sends XRP to the agent's address on the XRP Ledger. The Flare Data Connector (FDC) verifies that the XRP payment occurred on-chain. Once verified, the equivalent FXRP is minted as an ERC-20 token on Flare.</P>
            <P>The key insight is that no single party controls this process. The agent holds the XRP but is over-collateralized — if they attempt to abscond with the underlying assets, challengers can submit proof and the agent's collateral is liquidated to compensate holders. This creates a trust-minimized bridging mechanism that does not depend on multisigs, committees, or centralized operators.</P>
            <H3>Why FluxVault only accepts FAssets</H3>
            <P>FluxVault does not accept arbitrary ERC-20 tokens. It accepts only the FAssets that Flare supports: FXRP, FBTC, and FDOGE. This is a deliberate product decision. FluxVault exists to unlock yield for the FAsset ecosystem specifically — it is not a general-purpose vault. By focusing on FAssets, the protocol can be optimized for Flare's infrastructure and provide genuine utility to the community of BTC, XRP, and DOGE holders who bridge to Flare.</P>
          </Section>

          <Section id="getting-started" title="Getting Started">
            <H3>1. Set up your wallet</H3>
            <P>Install MetaMask and add Flare Testnet Coston2 as a custom network with the following parameters:</P>
            <CodeBlock>{`Network Name:  Flare Testnet Coston2
RPC URL:       https://coston2-api.flare.network/ext/C/rpc
Chain ID:      114
Currency:      C2FLR
Explorer:      https://coston2.testnet.flarescan.com`}</CodeBlock>
            <H3>2. Get testnet gas</H3>
            <P>Visit the Flare faucet at faucet.flare.network. Select Coston2, paste your wallet address, and request test C2FLR. You will receive 100 C2FLR — more than enough for all vault operations.</P>
            <H3>3. Mint test FAssets</H3>
            <P>On the FluxVault app, each vault card has a Mint button. Click it to mint 1000 test tokens of that FAsset directly to your wallet. This simulates having bridged real BTC, XRP, or DOGE to Flare. Confirm the transaction in MetaMask.</P>
            <H3>4. Approve and deposit</H3>
            <P>Enter a deposit amount and click Deposit. If this is your first deposit of a given FAsset, you will first be prompted to Approve — this allows the vault contract to transfer your FAssets. After approval, click Deposit again and confirm in MetaMask.</P>
            <H3>5. Watch yield accumulate</H3>
            <P>Your deposited balance and yield earned will update on the vault card. Yield accrues per second from the moment of deposit. The Yield Earned figure increases continuously — you can withdraw at any time to receive your principal plus all earned yield.</P>
            <InfoBox color="#00D4AA">The full deposit flow requires two transactions: Approve (one-time per asset) and Deposit. Subsequent deposits of the same asset only require the Deposit transaction.</InfoBox>
          </Section>

          <Section id="smart-contracts" title="Smart Contracts">
            <P>All FluxVault contracts are deployed on Flare Testnet Coston2 (Chain ID: 114) and are publicly verifiable on Flarescan. The source code is open source and available on GitHub.</P>
            <div style={{ background: "#0D1220", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
              <ContractRow name="FluxVaultV2" role="Main vault — deposits, withdrawals, yield" addr="0x7d4ea9219a832eaecf1c74424055c44e711aa836" />
              <ContractRow name="FTSOIntegration" role="Reads live prices from Flare FTSO" addr="0x66d7b7d7c9fc2db2b4cb795b80e157895a4f9dfc" />
              <ContractRow name="Mock FXRP" role="Test token simulating bridged XRP" addr="0xa92ebf841891e7800395fd759c5a69efef71d57f" />
              <ContractRow name="Mock FBTC" role="Test token simulating bridged Bitcoin" addr="0x4e66783bfeff935dc1811c5dec99edcffcb772b7" />
              <ContractRow name="Mock FDOGE" role="Test token simulating bridged Dogecoin" addr="0x1963c19c37af20db79f9732b4bc8aee432ebceb4" />
            </div>
            <H3>Contract architecture</H3>
            <P>FluxVaultV2 is the core contract. It handles deposits, share minting, yield calculation, and withdrawals. It does not depend on the FTSOIntegration contract for core vault logic — FTSO is used for display purposes in the frontend, keeping the vault logic independent of oracle availability.</P>
            <P>FTSOIntegration is a separate read-only contract that wraps FTSO price feed access. It resolves the FtsoV2 address from Flare's ContractRegistry, reads price feeds by their bytes21 feed IDs, and exposes clean view functions for the frontend to consume.</P>
          </Section>

          <Section id="security" title="Security">
            <H3>Non-custodial design</H3>
            <P>FluxVault is fully non-custodial. Deposited FAssets are held by the smart contract itself — not by a company, a multisig, or any individual. No party other than the depositing user can withdraw their funds. The contract has no function that allows the owner to drain user assets.</P>
            <H3>Reentrancy protection</H3>
            <P>All state-modifying functions in FluxVaultV2 use OpenZeppelin's ReentrancyGuard. The checks-effects-interactions pattern is followed: state is updated before external calls are made, preventing reentrancy attacks.</P>
            <H3>No upgrade keys</H3>
            <P>FluxVaultV2 is not an upgradeable proxy. Once deployed, the contract logic cannot be changed. This means there is no admin key that could be used to upgrade the contract to a malicious version. Users can verify this by inspecting the contract on Flarescan.</P>
            <H3>Safe withdrawal</H3>
            <P>The withdrawal function caps the transferred amount at the vault's available balance. This prevents integer underflow in edge cases where yield accrual might slightly exceed the vault's liquid balance.</P>
            <InfoBox color="#EF4444">FluxVault is deployed on testnet only. Do not deposit real mainnet assets. The contracts have not been formally audited. Use only with testnet tokens for evaluation purposes.</InfoBox>
          </Section>

          <Section id="roadmap" title="Roadmap">
            <H3>Phase 1 — Testnet (Current)</H3>
            <P>Core vault deployed on Flare Testnet Coston2. FXRP, FBTC, and FDOGE supported. FTSO live price integration. Yield accrual system. Web interface with wallet connection and full deposit, withdraw, and yield tracking functionality.</P>
            <H3>Phase 2 — Mainnet</H3>
            <P>Deploy FluxVaultV2 to Flare Mainnet with real FAssets. Integrate with live Flare DeFi lending protocols to route deposits into productive yield strategies rather than holding in the vault. Implement FTSO-driven rebalancing — when FTSO reports a significant price movement, the vault rebalances allocations between yield sources automatically.</P>
            <H3>Phase 3 — FDC Integration</H3>
            <P>Use Flare's Data Connector to verify underlying asset movements before allowing large deposits. This creates an additional trust-minimization layer where the vault can confirm that deposited FAssets correspond to verified on-chain movements of the underlying assets on BTC, XRP Ledger, or Dogecoin networks.</P>
            <H3>Phase 4 — Ecosystem</H3>
            <P>Open the vault to third-party yield strategies through a strategy marketplace. Any developer can submit a yield strategy for governance review. FLR token holders vote on which strategies are eligible for vault allocation. This transforms FluxVault from a single-strategy vault into a composable yield infrastructure layer for the Flare ecosystem.</P>
          </Section>

        </div>
      </div>
    </main>
  );
}