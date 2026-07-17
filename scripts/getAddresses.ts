import { network } from "hardhat";
import { createPublicClient, http } from "viem";

async function main() {
  const client = createPublicClient({
    transport: http("https://coston2-api.flare.network/ext/C/rpc"),
  });

  // Registry ABI
  const registryAbi = [{
    name: "getContractAddressByName",
    type: "function" as const,
    stateMutability: "view" as const,
    inputs: [{ name: "_name", type: "string" }],
    outputs: [{ name: "", type: "address" }],
  }];

  // AssetManager ABI
  const assetManagerAbi = [{
    name: "fAsset",
    type: "function" as const,
    stateMutability: "view" as const,
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  }];

  const REGISTRY = "0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019" as `0x${string}`;

  // Get AssetManager address
  const assetManagerAddr = await client.readContract({
    address: REGISTRY,
    abi: registryAbi,
    functionName: "getContractAddressByName",
    args: ["AssetManager"],
  });
  console.log("AssetManager:", assetManagerAddr);

  // Get FXRP token address
  const fxrpAddr = await client.readContract({
    address: assetManagerAddr as `0x${string}`,
    abi: assetManagerAbi,
    functionName: "fAsset",
    args: [],
  });
  console.log("Real FXRP address:", fxrpAddr);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });