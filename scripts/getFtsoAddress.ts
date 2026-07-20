import { createPublicClient, http } from "viem";

async function main() {
  const client = createPublicClient({
    transport: http("https://coston2-api.flare.network/ext/C/rpc"),
  });

  const REGISTRY = "0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019" as `0x${string}`;

  const abi = [{
    name: "getContractAddressByName",
    type: "function" as const,
    stateMutability: "view" as const,
    inputs: [{ name: "_name", type: "string" }],
    outputs: [{ name: "", type: "address" }],
  }];

  const names = ["FtsoV2", "FastUpdater", "FdcHub", "FdcVerification"];

  for (const name of names) {
    try {
      const addr = await client.readContract({
        address: REGISTRY,
        abi,
        functionName: "getContractAddressByName",
        args: [name],
      });
      console.log(`${name}: ${addr}`);
    } catch (e) {
      console.log(`${name}: not found`);
    }
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1; });