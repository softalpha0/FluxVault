export const CONTRACTS = {
  VAULT: "0xb7e6b422d08b3b39311e520083b106e0d9324a2d",
  FTSO: "0xC4e9c78EA53db782E28f28Fdf80BaF59336B304d",
  FDC_VERIFIER: "0x31bf6ce86304df8d1a52848b258a2f2d6fb6de3a",
  FXRP: "0x0b6A3645c240605887a5532109323A3E12273dc7",
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
    name: "getFeedById",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "_feedId", type: "bytes21" }],
    outputs: [
      { name: "_value", type: "uint256" },
      { name: "_decimals", type: "int8" },
      { name: "_timestamp", type: "uint64" },
    ],
  },
] as const;

export const FDC_ABI = [
  {
    name: "isVerified",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "txId", type: "bytes32" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "getVerifiedAmount",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
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

export const ASSETS = [
  {
    symbol: "FXRP",
    name: "Flare XRP",
    address: "0x0b6A3645c240605887a5532109323A3E12273dc7",
    color: "#00D4AA",
    priceKey: "XRP",
    isMock: false,
    decimals: 6,
    howToGet: "Get free test FXRP from the Flare faucet — no minting required.",
    faucetUrl: "https://faucet.flare.network",
  },
  {
    symbol: "FBTC",
    name: "Mock FBTC",
    address: "0x4e66783bfeff935dc1811c5dec99edcffcb772b7",
    color: "#F7931A",
    priceKey: "BTC",
    isMock: true,
    decimals: 18,
    howToGet: "Mint test FBTC directly — click the button below.",
    faucetUrl: null,
  },
  {
    symbol: "FDOGE",
    name: "Mock FDOGE",
    address: "0x1963c19c37af20db79f9732b4bc8aee432ebceb4",
    color: "#C2A633",
    priceKey: "DOGE",
    isMock: true,
    decimals: 18,
    howToGet: "Mint test FDOGE directly — click the button below.",
    faucetUrl: null,
  },
] as const;

// FTSO Feed IDs for Coston2
export const FTSO_FEEDS = {
  BTC:  "0x014254432f55534400000000000000000000000000" as `0x${string}`,
  XRP:  "0x015852502f55534400000000000000000000000000" as `0x${string}`,
  DOGE: "0x01444f47452f555344000000000000000000000000" as `0x${string}`,
} as const;