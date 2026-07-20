import { createPublicClient, http, formatUnits } from "viem";

async function main() {
  const client = createPublicClient({
    transport: http("https://coston2-api.flare.network/ext/C/rpc"),
  });

  const VAULT  = "0xb7e6b422d08b3b39311e520083b106e0d9324a2d" as `0x${string}`;
  const WALLET = "0x0df45edc0eef5bdf137ddacf96fbe800f1ce7733" as `0x${string}`;
  const FXRP   = "0x0b6A3645c240605887a5532109323A3E12273dc7" as `0x${string}`;
  const FBTC   = "0x4e66783bfeff935dc1811c5dec99edcffcb772b7" as `0x${string}`;
  const FDOGE  = "0x1963c19c37af20db79f9732b4bc8aee432ebceb4" as `0x${string}`;

  const posAbi = [{
    name: "getUserPosition",
    type: "function" as const,
    stateMutability: "view" as const,
    inputs: [{ name: "user", type: "address" }, { name: "asset", type: "address" }],
    outputs: [
      { name: "deposited", type: "uint256" },
      { name: "usdValue", type: "uint256" },
      { name: "yieldEarned", type: "uint256" },
      { name: "currentAPY", type: "uint256" },
      { name: "shares", type: "uint256" },
    ],
  }];

  const rawAbi = [{
    name: "userDeposits",
    type: "function" as const,
    stateMutability: "view" as const,
    inputs: [{ name: "", type: "address" }, { name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  }];

  const totalAbi = [{
    name: "totalDeposited",
    type: "function" as const,
    stateMutability: "view" as const,
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  }];

  const assets = [
    { name: "FXRP",  addr: FXRP,  dec: 6  },
    { name: "FBTC",  addr: FBTC,  dec: 18 },
    { name: "FDOGE", addr: FDOGE, dec: 18 },
  ];

  console.log("Vault:", VAULT);
  console.log("Wallet:", WALLET);

  for (const a of assets) {
    const pos = await client.readContract({
      address: VAULT,
      abi: posAbi,
      functionName: "getUserPosition",
      args: [WALLET, a.addr],
    });

    const raw = await client.readContract({
      address: VAULT,
      abi: rawAbi,
      functionName: "userDeposits",
      args: [WALLET, a.addr],
    });

    const total = await client.readContract({
      address: VAULT,
      abi: totalAbi,
      functionName: "totalDeposited",
      args: [a.addr],
    });

    console.log(`\n${a.name}:`);
    console.log("  Raw user deposit:  ", (raw as bigint).toString());
    console.log("  Formatted deposit: ", formatUnits(raw as bigint, a.dec));
    console.log("  Total in vault:    ", formatUnits(total as bigint, a.dec));
    console.log("  Position (18dec):  ", formatUnits(pos[0] as bigint, 18));
    console.log("  Shares:            ", formatUnits(pos[4] as bigint, 18));
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1; });