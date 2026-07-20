import { createPublicClient, http } from "viem";

async function main() {
  const client = createPublicClient({
    transport: http("https://coston2-api.flare.network/ext/C/rpc"),
  });

  const FXRP = "0x0b6A3645c240605887a5532109323A3E12273dc7" as `0x${string}`;
  const YOUR_WALLET = "0x0df45edc0eef5bdf137ddacf96fbe800f1ce7733" as `0x${string}`;

  const decimalsAbi = [{
    name: "decimals",
    type: "function" as const,
    stateMutability: "view" as const,
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  }];

  const balanceAbi = [{
    name: "balanceOf",
    type: "function" as const,
    stateMutability: "view" as const,
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  }];

  const symbolAbi = [{
    name: "symbol",
    type: "function" as const,
    stateMutability: "view" as const,
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  }];

  const decimals = await client.readContract({
    address: FXRP,
    abi: decimalsAbi,
    functionName: "decimals",
    args: [],
  });

  const symbol = await client.readContract({
    address: FXRP,
    abi: symbolAbi,
    functionName: "symbol",
    args: [],
  });

  const balance = await client.readContract({
    address: FXRP,
    abi: balanceAbi,
    functionName: "balanceOf",
    args: [YOUR_WALLET],
  });

  console.log("Symbol:", symbol);
  console.log("Decimals:", decimals);
  console.log("Raw balance:", balance.toString());
  console.log("Formatted balance:", Number(balance) / Math.pow(10, Number(decimals)));
}

main().catch((e) => { console.error(e); process.exitCode = 1; });