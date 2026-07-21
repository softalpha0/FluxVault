# FluxVault

**The first yield optimizer built specifically for Flare FAssets.**

Live app: https://fluxvault.vercel.app  
Documentation: https://fluxvault.vercel.app/docs  
Hackathon: Flare Summer Signal 2026 — Track 1: Interoperable Asset Products

---

## Introduction

FluxVault is a non-custodial yield optimizer built specifically for Flare FAssets. It allows holders of FXRP, FBTC, and FDOGE to deposit their assets into a vault and earn yield automatically — without manually navigating DeFi protocols or managing positions.

The protocol is built around three principles: simplicity for the end user, deep integration with Flare-native infrastructure, and full non-custodial ownership of deposited assets at all times.

FluxVault is currently deployed on Flare Testnet Coston2 (Chain ID: 114). All functionality is live and testable.

---

## The Problem

Flare's FAssets protocol is a genuine breakthrough in blockchain interoperability. It allows holders of Bitcoin, XRP, and Dogecoin to bridge their assets to an EVM-compatible chain trustlessly — without a centralized bridge operator or wrapped token controlled by a company.

However, once minted, FAssets face a fundamental problem: there is no simple yield layer for them. DeFi on Flare is early. Most FAsset holders end up with FXRP or FBTC sitting idle in their wallets, earning nothing, while the underlying assets on their native chains could be staked or lent. The bridging solved the custody problem — but not the utility problem.

FluxVault provides a single-click yield entry point for FAsset holders. Deposit any supported FAsset. Receive vault shares. Earn yield per second. Withdraw at any time with principal plus yield.

---

## Why Flare

FluxVault is not a protocol that happens to be deployed on Flare. It is a protocol that could only exist on Flare, because it depends on infrastructure that is unique to the Flare network.

### FTSO — Flare Time Series Oracle

On most blockchains, price feeds are provided by third-party oracle networks that charge fees and introduce external dependencies. On Flare, the oracle is enshrined — it is a core part of the network, funded by inflation, operated by approximately 100 independent data providers.

FluxVault reads live BTC/USD, XRP/USD, and DOGE/USD prices from FTSO with no API key, no subscription, and no centralized dependency. Prices update every 1.8 seconds on-chain and every 3 seconds in the UI.

FtsoV2 on Coston2: 0xC4e9c78EA53db782E28f28Fdf80BaF59336B304d

Feed IDs:
BTC/USD: 0x014254432f55534400000000000000000000000000
XRP/USD: 0x015852502f55534400000000000000000000000000
DOGE/USD: 0x01444f47452f555344000000000000000000000000

### FAssets — Trustless Bridging

FAssets are ERC-20 tokens on Flare that represent underlying assets from non-smart-contract chains. FXRP represents XRP. FBTC represents Bitcoin. FDOGE represents Dogecoin. Each is backed by over-collateralized agents verified by FDC — not by a company or multisig.

FluxVault accepts only FAssets as deposits. This is deliberate. The protocol exists to unlock yield for the FAsset ecosystem specifically. One important technical detail: real FXRP uses 6 decimal places, not 18. FluxVaultV3 detects token decimals automatically using `IERC20Metadata.decimals()` and normalizes all amounts to 18 decimals internally, so share math stays consistent across all asset types.

### FDC — Flare Data Connector

FDC allows smart contracts on Flare to trustlessly verify events that happened on other blockchains. FluxVault implements the full EVMTransaction attestation flow end-to-end:

1. Prepare an attestation request via Flare's verifier API
2. Submit to FdcHub on Coston2 with a 1 C2FLR fee
3. Wait for the voting round to finalize (~90-180 seconds)
4. Fetch the Merkle proof from Flare's DA Layer
5. Submit the proof to `FDCTransferVerifier` — the contract verifies it against the on-chain Merkle root

This was demonstrated in production. Round 1402516 finalized with 99.99% FDC consensus. Two transfers were verified on-chain.

Verification TX: 0x3d7fa007a2f67814e53a37be54b0512d1a9aa7f9c19d4e4a6b6d82679614fcba
Round explorer: https://coston2-systems-explorer.flare.rocks/voting-round/1402516?tab=fdc

---

## How FluxVault Works

### Vault shares

When a user deposits FAssets, FluxVault mints FLUX shares proportional to their deposit relative to the total vault balance. Shares represent a claim on the vault's assets — as yield accrues, each share becomes redeemable for more of the underlying asset.

```solidity
function _calculateShares(address asset, uint256 amount18) internal view returns (uint256) {
    uint256 supply  = totalSupply();
    uint256 total18 = _to18(totalDeposited[asset], assetDecimals[asset]);
    if (supply == 0 || total18 == 0) return amount18;
    return (amount18 * supply) / total18;
}
```

### Yield accrual

Yield accrues continuously per second based on a configured APY in basis points. The current rate is 4.20% (420 basis points) for all supported FAssets.

```solidity
function getYieldEarned18(address user, address asset) public view returns (uint256) {
    uint256 deposited18 = _to18(userDeposits[user][asset], assetDecimals[asset]);
    uint256 timeElapsed = block.timestamp - depositTimestamp[user][asset];
    return (deposited18 * assetAPY[asset] * timeElapsed) / (365 days * 10000);
}
```

### Withdrawal

When a user withdraws, they burn their FLUX shares and receive their proportional share of the vault's principal plus all yield earned since their deposit. There are no lock-up periods, withdrawal fees, or minimum holding times.

---

## Smart Contracts

All contracts are deployed on Flare Testnet Coston2 (Chain ID: 114).

| Contract | Address |
|----------|---------|
| FluxVaultV3 | `0xb7e6b422d08b3b39311e520083b106e0d9324a2d` |
| FTSOIntegration | `0x66d7b7d7c9fc2db2b4cb795b80e157895a4f9dfc` |
| FDCTransferVerifier | `0x7c9546d6d3b20db46a78ed4c15443d93ef5c47ae` |
| FXRP (Coston2 real) | `0x0b6A3645c240605887a5532109323A3E12273dc7` |
| Mock FBTC | `0x4e66783bfeff935dc1811c5dec99edcffcb772b7` |
| Mock FDOGE | `0x1963c19c37af20db79f9732b4bc8aee432ebceb4` |

Flare protocol contracts resolved via `ContractRegistry` at `0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019`:

| Contract | Address |
|----------|---------|
| FtsoV2 | `0xC4e9c78EA53db782E28f28Fdf80BaF59336B304d` |
| FdcHub | `0x48aC463d7975828989331F4De43341627b9c5f1D` |
| FdcVerification | `0x906507E0B64bcD494Db73bd0459d1C667e14B933` |
| Relay | `0xa10B672D1c62e5457b17af63d4302add6A99d7dE` |

## Roadmap

**Phase 1 — Testnet (current)**  
FluxVaultV3 deployed on Coston2. Real FXRP supported with correct 6-decimal handling. FTSO live prices working. FDC EVMTransaction attestation demonstrated end-to-end. Full web interface live on Vercel.

**Phase 2 — Mainnet**  
Deploy to Flare Mainnet with real FAssets. Integrate with live Flare DeFi lending protocols for productive yield strategies. FTSO-driven rebalancing — when price movements exceed a threshold, the vault shifts allocations automatically.

**Phase 3 — FDC Expansion**  
FDC Payment attestation to verify XRPL transactions before large FXRP deposits. Trust-minimized cross-chain deposit verification without requiring any centralized party.

**Phase 4 — Ecosystem**  
Open strategy marketplace. FLR governance for vault parameters. Mobile interface.
