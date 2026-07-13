import { network } from "hardhat";

async function main() {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  const [deployer] = await viem.getWalletClients();

  console.log("Deploying FluxVaultV2...\n");
  console.log("Deployer:", deployer.account.address);

  const FXRP  = "0xa92ebf841891e7800395fd759c5a69efef71d57f" as `0x${string}`;
  const FBTC  = "0x4e66783bfeff935dc1811c5dec99edcffcb772b7" as `0x${string}`;
  const FDOGE = "0x1963c19c37af20db79f9732b4bc8aee432ebceb4" as `0x${string}`;

  // Deploy V2 vault
  console.log("1. Deploying FluxVaultV2...");
  const vault = await viem.deployContract("FluxVaultV2");
  console.log("   FluxVaultV2:", vault.address);

  // Add supported assets
  console.log("2. Adding assets...");
  await vault.write.addSupportedAsset([FXRP]);
  await vault.write.addSupportedAsset([FBTC]);
  await vault.write.addSupportedAsset([FDOGE]);
  console.log("   FXRP, FBTC, FDOGE added");

  // Set APY 4.20%
  console.log("3. Setting APY to 4.20%...");
  await vault.write.setAPY([FXRP,  420n]);
  await vault.write.setAPY([FBTC,  420n]);
  await vault.write.setAPY([FDOGE, 420n]);
  console.log("   Done");

  console.log("\nDEPLOYMENT COMPLETE");
  console.log("FluxVaultV2:", vault.address);
  console.log("\nAdd to .env:");
  console.log("VAULT_V2_ADDRESS=" + vault.address);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });