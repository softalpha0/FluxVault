import { network } from "hardhat";

async function main() {
  const { viem } = await network.connect();

  // Real FXRP on Coston2 testnet
  const REAL_FXRP = "0x0b6A3645c240605887a5532109323A3E12273dc7" as `0x${string}`;
  const VAULT = "0x7d4ea9219a832eaecf1c74424055c44e711aa836" as `0x${string}`;

  const vault = await viem.getContractAt("FluxVaultV2", VAULT);

  console.log("Adding real FXRP to vault...");
  await vault.write.addSupportedAsset([REAL_FXRP]);
  console.log("Real FXRP added:", REAL_FXRP);

  console.log("Setting APY for real FXRP...");
  await vault.write.setAPY([REAL_FXRP, 420n]);
  console.log("APY set to 4.20%");

  console.log("\nDone. Update CONTRACTS in lib/contracts.ts:");
  console.log("Add: REAL_FXRP:", REAL_FXRP);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });