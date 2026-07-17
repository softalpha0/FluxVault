"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, inView };
}

function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(32px)",
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView();
  useEffect(() => {
    if (!inView) return;
    const duration = 1500;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Landing() {
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) return null;

  const features = [
    {
      title: "FTSO Price Feeds",
      desc: "Flare's Time Series Oracle updates every 1.8 seconds. FluxVault reads BTC, XRP, and DOGE prices directly from the protocol — no external API, no middleman, no trust required.",
      color: "#00D4AA",
    },
    {
      title: "FAsset Integration",
      desc: "FXRP, FBTC, and FDOGE are trustlessly bridged assets on Flare. FluxVault is the first yield layer built specifically for these assets — unlocking DeFi utility for BTC, XRP, and DOGE holders.",
      color: "#3B82F6",
    },
    {
      title: "Non-Custodial Vault",
      desc: "Your assets are held by an immutable smart contract. No admin keys. No upgrade proxies. No centralized custodian. The code is the only authority over your funds.",
      color: "#8B5CF6",
    },
  ];

  const contracts = [
    { name: "FluxVaultV2", role: "Main vault contract", addr: "0x7d4ea9219a832eaecf1c74424055c44e711aa836" },
    { name: "FTSOIntegration", role: "Oracle price reader", addr: "0x66d7b7d7c9fc2db2b4cb795b80e157895a4f9dfc" },
    { name: "Mock FXRP", role: "Test FAsset token", addr: "0xa92ebf841891e7800395fd759c5a69efef71d57f" },
    { name: "Mock FBTC", role: "Test FAsset token", addr: "0x4e66783bfeff935dc1811c5dec99edcffcb772b7" },
    { name: "Mock FDOGE", role: "Test FAsset token", addr: "0x1963c19c37af20db79f9732b4bc8aee432ebceb4" },
  ];

  return (
    <main style={{ background: "#080C14", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", overflowX: "hidden" }}>

      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", backgroundImage: `linear-gradient(rgba(0,212,170,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,170,0.03) 1px, transparent 1px)`, backgroundSize: "60px 60px", transform: `translateY(${scrollY * 0.1}px)` }} />
      <div style={{ position: "fixed", top: -200, left: "50%", transform: "translateX(-50%)", width: 800, height: 800, borderRadius: "50%", zIndex: 0, pointerEvents: "none", background: "radial-gradient(circle, rgba(0,212,170,0.06) 0%, transparent 70%)" }} />

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: scrollY > 40 ? "rgba(8,12,20,0.95)" : "transparent", backdropFilter: scrollY > 40 ? "blur(20px)" : "none", borderBottom: scrollY > 40 ? "1px solid rgba(255,255,255,0.06)" : "none", padding: "18px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.3s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg, #00D4AA, #00A882)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 14, height: 14, borderRadius: 2, background: "#080C14", transform: "rotate(45deg)" }} />
          </div>
          <span style={{ fontSize: 17, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>FluxVault</span>
        </div>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {["How it works", "Why Flare", "Contracts"].map((item) => (
            <a key={item} href={"#" + item.toLowerCase().replace(/ /g, "-")} style={{ fontSize: 13, color: "#94A3B8", textDecoration: "none", fontWeight: 500 }}>{item}</a>
          ))}
          <a href="/docs" style={{ fontSize: 13, color: "#94A3B8", textDecoration: "none", fontWeight: 500 }}>Docs</a>
          <Link href="/" style={{ padding: "9px 22px", borderRadius: 9, background: "linear-gradient(135deg, #00D4AA, #00A882)", color: "#080C14", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Launch App</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: "relative", zIndex: 1, padding: "160px 48px 100px", textAlign: "center" }}>
        <AnimatedSection>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 20, background: "rgba(0,212,170,0.08)", border: "1px solid rgba(0,212,170,0.25)", marginBottom: 32 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00D4AA" }} />
            <span style={{ fontSize: 12, color: "#00D4AA", fontWeight: 600, letterSpacing: "0.08em" }}>LIVE ON FLARE COSTON2</span>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={100}>
          <h1 style={{ fontSize: 72, fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 24, maxWidth: 800, margin: "0 auto 24px" }}>
            Your FAssets.<br />
            <span style={{ background: "linear-gradient(135deg, #00D4AA, #3B82F6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Now earning yield.</span>
          </h1>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <p style={{ fontSize: 19, color: "#94A3B8", maxWidth: 540, margin: "0 auto 48px", lineHeight: 1.7 }}>
            FluxVault is the first yield optimizer built specifically for Flare FAssets. Deposit FXRP, FBTC, or FDOGE. Earn automatically. Withdraw anytime.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={300}>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/" style={{ padding: "15px 36px", borderRadius: 10, background: "linear-gradient(135deg, #00D4AA, #00A882)", color: "#080C14", fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: "0 0 40px rgba(0,212,170,0.3)" }}>Start Earning</Link>
            <a href="#how-it-works" style={{ padding: "15px 36px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", color: "#E2EAF4", fontSize: 15, fontWeight: 600, textDecoration: "none" }}>Learn More</a>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={400}>
          <div style={{ display: "flex", gap: 0, justifyContent: "center", marginTop: 80, flexWrap: "wrap", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden", maxWidth: 640, margin: "80px auto 0", background: "rgba(13,18,32,0.8)", backdropFilter: "blur(20px)" }}>
            {[
              { label: "Supported FAssets", value: 3, suffix: "" },
              { label: "Current APY", value: 4, suffix: ".20%" },
              { label: "Chain ID", value: 114, suffix: "" },
            ].map((s, i) => (
              <div key={s.label} style={{ flex: 1, padding: "24px 20px", textAlign: "center", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}><Counter target={s.value} suffix={s.suffix} /></div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* Ticker */}
      <div style={{ position: "relative", zIndex: 1, overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "14px 0", background: "rgba(13,18,32,0.5)" }}>
        <div style={{ display: "flex", gap: 64, whiteSpace: "nowrap", animation: "marquee 20s linear infinite" }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ display: "flex", gap: 64, flexShrink: 0 }}>
              {["FXRP on Flare", "FBTC yield", "FTSO oracle", "FDOGE DeFi", "FAsset protocol", "Non-custodial", "Live on Coston2", "Flare Summer Signal 2026"].map((item) => (
                <span key={item} style={{ fontSize: 12, color: "#64748B", fontWeight: 500, letterSpacing: "0.06em" }}>{item}<span style={{ color: "#00D4AA", margin: "0 32px" }}>·</span></span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Story */}
      <section style={{ position: "relative", zIndex: 1, padding: "120px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <AnimatedSection>
            <div style={{ fontSize: 12, color: "#00D4AA", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 16 }}>THE PROBLEM</div>
            <h2 style={{ fontSize: 40, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: 20 }}>FAssets are bridged.<br />But they are idle.</h2>
            <p style={{ fontSize: 15, color: "#94A3B8", lineHeight: 1.8, marginBottom: 16 }}>Flare's FAssets protocol is a breakthrough — it brings Bitcoin, XRP, and Dogecoin onto an EVM chain trustlessly, without centralized bridges or wrapped tokens controlled by a company.</p>
            <p style={{ fontSize: 15, color: "#94A3B8", lineHeight: 1.8, marginBottom: 16 }}>But once minted, most FAssets just sit in wallets. There is no simple, single-click yield layer that FAsset holders can use today. The bridging solved the custody problem — but not the utility problem.</p>
            <p style={{ fontSize: 15, color: "#E2EAF4", lineHeight: 1.8, fontWeight: 500 }}>FluxVault is that layer.</p>
          </AnimatedSection>
          <AnimatedSection delay={150}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "BTC holders", sub: "Cannot earn yield on FBTC without complex DeFi navigation" },
                { label: "XRP holders", sub: "FXRP sits idle after minting with no automated yield source" },
                { label: "DOGE holders", sub: "First time DOGE can access real DeFi yield — but no product exists" },
              ].map((item) => (
                <div key={item.label} style={{ padding: "20px 24px", borderRadius: 14, background: "#0D1220", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF", marginBottom: 6 }}>{item.label}</div>
                  <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6 }}>{item.sub}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Why Flare */}
      <section id="why-flare" style={{ position: "relative", zIndex: 1, padding: "120px 48px", background: "rgba(13,18,32,0.5)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <AnimatedSection>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <div style={{ fontSize: 12, color: "#3B82F6", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 16 }}>WHY FLARE</div>
              <h2 style={{ fontSize: 44, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.03em", marginBottom: 16 }}>FluxVault could only exist on Flare.</h2>
              <p style={{ fontSize: 16, color: "#94A3B8", maxWidth: 560, margin: "0 auto" }}>Flare provides two enshrined protocols that make FluxVault possible — no other chain has both of these as native infrastructure.</p>
            </div>
          </AnimatedSection>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <AnimatedSection delay={100}>
              <div style={{ padding: "36px", borderRadius: 18, background: "#0D1220", border: "1px solid rgba(0,212,170,0.2)", height: "100%" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(0,212,170,0.1)", border: "1px solid rgba(0,212,170,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #00D4AA" }} />
                </div>
                <div style={{ fontSize: 11, color: "#00D4AA", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10 }}>FTSO — FLARE TIME SERIES ORACLE</div>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: "#FFFFFF", marginBottom: 14 }}>The oracle that is part of the protocol itself</h3>
                <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.8, marginBottom: 14 }}>On Ethereum, you pay Chainlink for price data. On Flare, the oracle is enshrined — it is a core part of the network, funded by inflation, operated by validators with economic skin in the game.</p>
                <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.8 }}>FluxVault reads live BTC, XRP, and DOGE prices from FTSO every 1.8 seconds — with no API key, no subscription, and no centralized dependency.</p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={200}>
              <div style={{ padding: "36px", borderRadius: 18, background: "#0D1220", border: "1px solid rgba(59,130,246,0.2)", height: "100%" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 3, border: "2px solid #3B82F6" }} />
                </div>
                <div style={{ fontSize: 11, color: "#3B82F6", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10 }}>FASSETS — TRUSTLESS BRIDGING</div>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: "#FFFFFF", marginBottom: 14 }}>BTC, XRP, DOGE on EVM — without a bridge company</h3>
                <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.8, marginBottom: 14 }}>FAssets are not wrapped tokens controlled by a multisig. They are backed by over-collateralization, governed by smart contracts, and verified by FDC — Flare's cross-chain data connector.</p>
                <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.8 }}>FluxVault is built specifically for these assets. FXRP, FBTC, and FDOGE are the only accepted deposits — this is a Flare-native product, not a port.</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ position: "relative", zIndex: 1, padding: "120px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <AnimatedSection>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontSize: 12, color: "#8B5CF6", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 16 }}>HOW IT WORKS</div>
            <h2 style={{ fontSize: 44, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.03em" }}>Three steps. That is it.</h2>
          </div>
        </AnimatedSection>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {[
            { step: "01", title: "Connect and configure", desc: "Connect MetaMask to Flare Testnet Coston2 (Chain ID 114). Mint test FAssets directly from the vault interface — no external faucet required for tokens.", color: "#00D4AA" },
            { step: "02", title: "Approve and deposit", desc: "Approve the vault contract to spend your FAssets. Deposit any amount. Your position is tracked on-chain and your FLUX shares are minted immediately.", color: "#3B82F6" },
            { step: "03", title: "Yield accumulates", desc: "Yield accrues per second at 4.20% APY. Watch it increase in real time. Withdraw your principal plus all earned yield whenever you want — no lock-up.", color: "#8B5CF6" },
          ].map((s, i) => (
            <AnimatedSection key={s.step} delay={i * 120}>
              <div style={{ padding: "32px", borderRadius: 16, background: "#0D1220", border: "1px solid rgba(255,255,255,0.06)", height: "100%", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.color }} />
                <div style={{ fontSize: 48, fontWeight: 900, color: s.color, opacity: 0.15, fontFamily: "monospace", marginBottom: 20, lineHeight: 1 }}>{s.step}</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#FFFFFF", marginBottom: 12 }}>{s.title}</div>
                <div style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.8 }}>{s.desc}</div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Feature showcase */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 48px", background: "rgba(13,18,32,0.5)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <AnimatedSection>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, color: "#00D4AA", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 24 }}>CORE INTEGRATIONS</div>
                {features.map((f, i) => (
                  <div key={f.title} onClick={() => setActiveFeature(i)} style={{ padding: "20px 24px", borderRadius: 12, cursor: "pointer", marginBottom: 8, background: activeFeature === i ? "#0D1220" : "transparent", border: `1px solid ${activeFeature === i ? f.color + "40" : "transparent"}`, transition: "all 0.3s ease" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: activeFeature === i ? "#FFFFFF" : "#64748B", marginBottom: activeFeature === i ? 8 : 0, transition: "color 0.3s" }}>{f.title}</div>
                    <div style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.7, maxHeight: activeFeature === i ? 200 : 0, overflow: "hidden", transition: "max-height 0.4s ease" }}>{f.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#0D1220", border: `1px solid ${features[activeFeature].color}30`, borderRadius: 18, padding: 32, transition: "border-color 0.4s" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: features[activeFeature].color, marginBottom: 20 }}>
                  {activeFeature === 0 ? "LIVE PRICE FEED" : activeFeature === 1 ? "FASSET VAULT" : "SMART CONTRACT"}
                </div>
                {activeFeature === 0 && (
                  <div style={{ fontFamily: "monospace", fontSize: 13 }}>
                    {[{ label: "BTC / USD", value: "$ 97,420.00", change: "+2.4%" }, { label: "XRP / USD", value: "$ 2.3841", change: "+0.8%" }, { label: "DOGE / USD", value: "$ 0.1924", change: "-0.3%" }].map((p) => (
                      <div key={p.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <span style={{ color: "#64748B" }}>{p.label}</span>
                        <span style={{ color: "#FFFFFF", fontWeight: 600 }}>{p.value}</span>
                        <span style={{ color: p.change.startsWith("+") ? "#22C55E" : "#EF4444", fontSize: 12 }}>{p.change}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 16, fontSize: 11, color: "#64748B" }}>Source: Flare FTSO · Updates every 1.8s</div>
                  </div>
                )}
                {activeFeature === 1 && (
                  <div style={{ fontFamily: "monospace", fontSize: 13 }}>
                    {[{ label: "FXRP deposited", value: "1,102.00" }, { label: "FBTC deposited", value: "1,167.00" }, { label: "FDOGE deposited", value: "1,106.00" }, { label: "Total vault TVL", value: "3,375.00" }, { label: "APY (all assets)", value: "4.20%" }].map((p) => (
                      <div key={p.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <span style={{ color: "#64748B" }}>{p.label}</span>
                        <span style={{ color: "#FFFFFF", fontWeight: 600 }}>{p.value}</span>
                      </div>
                    ))}
                  </div>
                )}
                {activeFeature === 2 && (
                  <div style={{ fontFamily: "monospace", fontSize: 12 }}>
                    {[{ label: "FluxVaultV2", addr: "0x7d4e...1a836" }, { label: "FTSOIntegration", addr: "0x66d7...f9dfc" }, { label: "Mock FXRP", addr: "0xa92e...d57f" }, { label: "Mock FBTC", addr: "0x4e66...72b7" }, { label: "Mock FDOGE", addr: "0x1963...ceb4" }].map((c) => (
                      <div key={c.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <span style={{ color: "#64748B" }}>{c.label}</span>
                        <span style={{ color: "#00D4AA" }}>{c.addr}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 16, fontSize: 11, color: "#64748B" }}>Network: Flare Testnet Coston2 · Chain ID 114</div>
                  </div>
                )}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Contracts */}
      <section id="contracts" style={{ position: "relative", zIndex: 1, padding: "120px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <AnimatedSection>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 12, color: "#00D4AA", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 16 }}>ON-CHAIN</div>
            <h2 style={{ fontSize: 44, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.03em", marginBottom: 12 }}>Fully verifiable.</h2>
            <p style={{ fontSize: 15, color: "#94A3B8" }}>Every contract is deployed on Flare Testnet Coston2 and publicly verifiable.</p>
          </div>
        </AnimatedSection>
        <AnimatedSection delay={100}>
          <div style={{ background: "#0D1220", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
            {contracts.map((c, i) => (
              <div key={c.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 28px", borderBottom: i < contracts.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#FFFFFF", marginBottom: 2 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: "#64748B" }}>{c.role}</div>
                </div>
                <a href={"https://coston2.testnet.flarescan.com/address/" + c.addr} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#00D4AA", fontFamily: "monospace", textDecoration: "none", padding: "6px 14px", borderRadius: 8, background: "rgba(0,212,170,0.08)", border: "1px solid rgba(0,212,170,0.15)" }}>{c.addr.slice(0, 10)}...{c.addr.slice(-6)}</a>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* CTA */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 48px 120px", textAlign: "center" }}>
        <AnimatedSection>
          <div style={{ background: "linear-gradient(135deg, rgba(0,212,170,0.08), rgba(59,130,246,0.08))", border: "1px solid rgba(0,212,170,0.15)", borderRadius: 24, padding: "72px 48px", maxWidth: 640, margin: "0 auto", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,170,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
            <h2 style={{ fontSize: 40, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.03em", marginBottom: 16 }}>Ready to put your FAssets to work?</h2>
            <p style={{ fontSize: 15, color: "#94A3B8", marginBottom: 36, lineHeight: 1.7 }}>No minimum deposit. No lock-up. No centralized custodian. Connect your wallet and start earning in under two minutes.</p>
            <Link href="/" style={{ display: "inline-block", padding: "16px 48px", borderRadius: 10, background: "linear-gradient(135deg, #00D4AA, #00A882)", color: "#080C14", fontSize: 16, fontWeight: 700, textDecoration: "none", boxShadow: "0 0 60px rgba(0,212,170,0.25)" }}>Launch FluxVault</Link>
          </div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.06)", padding: "36px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF", marginBottom: 4 }}>FluxVault</div>
          <div style={{ fontSize: 12, color: "#64748B" }}>Flare Summer Signal 2026 · Track 1: Interoperable Asset Products</div>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          <a href="https://coston2.testnet.flarescan.com/address/0x7d4ea9219a832eaecf1c74424055c44e711aa836" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#64748B", textDecoration: "none" }}>Contract</a>
          <Link href="/docs" style={{ fontSize: 13, color: "#64748B", textDecoration: "none" }}>Documentation</Link>
          <Link href="/" style={{ fontSize: 13, color: "#64748B", textDecoration: "none" }}>App</Link>
        </div>
      </footer>

      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-33.333%); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </main>
  );
}