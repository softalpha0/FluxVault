import { network } from "hardhat";

async function main() {
  console.log("Deploying FluxVault to Coston2...\n");

  const { viem } = await network.connect();

  const publicClient = await viem.getPublicClient();
  const [deployer] = await viem.getWalletClients();

  const address = deployer.account.address;
  const balance = await publicClient.getBalance({ address });
  console.log("Deployer:", address);
  console.log("Balance:", (Number(balance) / 1e18).toFixed(4), "C2FLR\n");

  console.log("1. Deploying FTSOIntegration...");
  const ftso = await viem.deployContract("FTSOIntegration");
  console.log("   FTSOIntegration:", ftso.address);

  console.log("2. Deploying YieldStrategy...");
  const strategy = await viem.deployContract("YieldStrategy");
  console.log("   YieldStrategy:", strategy.address);

  console.log("3. Deploying FluxVault...");
  const vault = await viem.deployContract("FluxVault", [
    ftso.address,
    strategy.address,
  ]);
  console.log("   FluxVault:", vault.address);

  console.log("4. Wiring strategy...");
  await strategy.write.setVault([vault.address]);
  console.log("   Done.");

  console.log("5. Deploying Mock FAssets...");
  const fxrp = await viem.deployContract("MockFAsset", ["Mock FXRP", "FXRP"]);
  const fbtc = await viem.deployContract("MockFAsset", ["Mock FBTC", "FBTC"]);
  const fdoge = await viem.deployContract("MockFAsset", ["Mock FDOGE", "FDOGE"]);
  console.log("   FXRP:", fxrp.address);
  console.log("   FBTC:", fbtc.address);
  console.log("   FDOGE:", fdoge.address);

  console.log("6. Adding assets to vault...");
  await vault.write.addSupportedAsset([fxrp.address]);
  await vault.write.addSupportedAsset([fbtc.address]);
  await vault.write.addSupportedAsset([fdoge.address]);
  console.log("   Done.\n");

  console.log("DEPLOYMENT COMPLETE");
  console.log("FTSOIntegration:", ftso.address);
  console.log("YieldStrategy:  ", strategy.address);
  console.log("FluxVault:      ", vault.address);
  console.log("FXRP:           ", fxrp.address);
  console.log("FBTC:           ", fbtc.address);
  console.log("FDOGE:          ", fdoge.address);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});