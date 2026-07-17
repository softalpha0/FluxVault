export const CONTRACTS = {
  VAULT: "0x7d4ea9219a832eaecf1c74424055c44e711aa836",
  FTSO: "0x66d7b7d7c9fc2db2b4cb795b80e157895a4f9dfc",
  STRATEGY: "0x49f7591dd2e2d8742e6a3929d4f849e53232aff5",
  FXRP: "0xa92ebf841891e7800395fd759c5a69efef71d57f",
  REAL_FXRP: "0x0b6A3645c240605887a5532109323A3E12273dc7",
  FBTC: "0x4e66783bfeff935dc1811c5dec99edcffcb772b7",
  FDOGE: "0x1963c19c37af20db79f9732b4bc8aee432ebceb4",
} as const;

export const COSTON2 = {
  id: 114,
  name: "Flare Testnet Coston2",
  nativeCurrency: { name: "Coston2 FLR", symbol: "C2FLR", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://coston2-api.flare.network/ext/C/rpc"] },
  },
  blockExplorers: {
    default: {
      name: "Flarescan",
      url: "https://coston2.testnet.flarescan.com",
    },
  },
  testnet: true,
} as const;

export const VAULT_ABI = [
  {
    name: "deposit",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "withdraw",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "asset", type: "address" },
      { name: "sharesToBurn", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "getUserPosition",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "user", type: "address" },
      { name: "asset", type: "address" },
    ],
    outputs: [
      { name: "deposited", type: "uint256" },
      { name: "usdValue", type: "uint256" },
      { name: "yieldEarned", type: "uint256" },
      { name: "currentAPY", type: "uint256" },
      { name: "shares", type: "uint256" },
    ],
  },
  {
    name: "getTotalDeposited",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "asset", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "totalDeposited",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "supportedAssets",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export const FTSO_ABI = [
  {
    name: "getBTCPrice",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "price", type: "uint256" },
      { name: "decimals", type: "int8" },
      { name: "timestamp", type: "uint64" },
    ],
  },
  {
    name: "getXRPPrice",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "price", type: "uint256" },
      { name: "decimals", type: "int8" },
      { name: "timestamp", type: "uint64" },
    ],
  },
  {
    name: "getDOGEPrice",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "price", type: "uint256" },
      { name: "decimals", type: "int8" },
      { name: "timestamp", type: "uint64" },
    ],
  },
] as const;

export const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "mint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

// Real FAsset on Coston2 — get from faucet.flare.network
// Mock tokens — mintable directly in the app for testing
export const ASSETS = [
  {
    symbol: "FXRP",
    name: "Flare XRP — Real FAsset",
    address: "0x0b6A3645c240605887a5532109323A3E12273dc7",
    color: "#00D4AA",
    priceKey: "XRP",
    isMock: false,
    faucetUrl: "https://faucet.flare.network",
  },
  {
    symbol: "FXRP (Test)",
    name: "Mock FXRP — Mintable",
    address: "0xa92ebf841891e7800395fd759c5a69efef71d57f",
    color: "#00AAE4",
    priceKey: "XRP",
    isMock: true,
    faucetUrl: null,
  },
  {
    symbol: "FBTC",
    name: "Mock FBTC — Mintable",
    address: "0x4e66783bfeff935dc1811c5dec99edcffcb772b7",
    color: "#F7931A",
    priceKey: "BTC",
    isMock: true,
    faucetUrl: null,
  },
  {
    symbol: "FDOGE",
    name: "Mock FDOGE — Mintable",
    address: "0x1963c19c37af20db79f9732b4bc8aee432ebceb4",
    color: "#C2A633",
    priceKey: "DOGE",
    isMock: true,
    faucetUrl: null,
  },
] as const;