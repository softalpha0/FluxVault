import { network } from "hardhat";

async function main() {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  const [deployer] = await viem.getWalletClients();

  console.log("Deploying FluxVaultV3...\n");
  console.log("Deployer:", deployer.account.address);

  const FXRP  = "0x0b6A3645c240605887a5532109323A3E12273dc7" as `0x${string}`;
  const FBTC  = "0x4e66783bfeff935dc1811c5dec99edcffcb772b7" as `0x${string}`;
  const FDOGE = "0x1963c19c37af20db79f9732b4bc8aee432ebceb4" as `0x${string}`;

  console.log("1. Deploying FluxVaultV3...");
  const vault = await viem.deployContract("FluxVaultV3");
  console.log("   FluxVaultV3:", vault.address);

  console.log("2. Adding assets (auto-detects decimals)...");
  await vault.write.addSupportedAsset([FXRP]);
  console.log("   FXRP added (6 decimals)");
  await vault.write.addSupportedAsset([FBTC]);
  console.log("   FBTC added (18 decimals)");
  await vault.write.addSupportedAsset([FDOGE]);
  console.log("   FDOGE added (18 decimals)");

  console.log("3. Setting APY to 4.20%...");
  await vault.write.setAPY([FXRP,  420n]);
  await vault.write.setAPY([FBTC,  420n]);
  await vault.write.setAPY([FDOGE, 420n]);
  console.log("   Done");

  console.log("\nDEPLOYMENT COMPLETE");
  console.log("FluxVaultV3:", vault.address);
  console.log("\nUpdate VAULT in lib/contracts.ts:");
  console.log("VAULT:", vault.address);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });