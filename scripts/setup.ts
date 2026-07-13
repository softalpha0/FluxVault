import { network } from "hardhat";
import { toHex, padHex } from "viem";

async function main() {
  const { viem } = await network.connect();

  console.log("Setting up FTSO feeds and APY...\n");

  const ftso = await viem.getContractAt(
    "FTSOIntegration",
    "0x66d7b7d7c9fc2db2b4cb795b80e157895a4f9dfc"
  );

  const strategy = await viem.getContractAt(
    "YieldStrategy",
    "0x49f7591dd2e2d8742e6a3929d4f849e53232aff5"
  );

  const FXRP  = "0xa92ebf841891e7800395fd759c5a69efef71d57f" as `0x${string}`;
  const FBTC  = "0x4e66783bfeff935dc1811c5dec99edcffcb772b7" as `0x${string}`;
  const FDOGE = "0x1963c19c37af20db79f9732b4bc8aee432ebceb4" as `0x${string}`;

  // Convert feed strings to bytes21
  // "FtsoV2/XRP/USD" = 14 chars, padded right to 21 bytes
  function toBytes21(str: string): `0x${string}` {
    const hex = Buffer.from(str, "utf8").toString("hex");
    const padded = hex.padEnd(42, "0"); // 21 bytes = 42 hex chars
    return `0x${padded}` as `0x${string}`;
  }

  const XRP_FEED  = toBytes21("FtsoV2/XRP/USD");
  const BTC_FEED  = toBytes21("FtsoV2/BTC/USD");
  const DOGE_FEED = toBytes21("FtsoV2/DOGE/USD");

  console.log("Feed IDs:");
  console.log("  XRP: ", XRP_FEED);
  console.log("  BTC: ", BTC_FEED);
  console.log("  DOGE:", DOGE_FEED);

  // 1. Set asset feeds
  console.log("\n1. Configuring FTSO feeds...");
  await ftso.write.setAssetFeed([FXRP, XRP_FEED]);
  console.log("   FXRP feed set");
  await ftso.write.setAssetFeed([FBTC, BTC_FEED]);
  console.log("   FBTC feed set");
  await ftso.write.setAssetFeed([FDOGE, DOGE_FEED]);
  console.log("   FDOGE feed set");

  // 2. Set APY (420 = 4.20%)
  console.log("2. Setting APY to 4.20%...");
  await strategy.write.setAPY([FXRP, 420n]);
  await strategy.write.setAPY([FBTC, 420n]);
  await strategy.write.setAPY([FDOGE, 420n]);
  console.log("   Done.");

  console.log("\nSetup complete. Deposits should now work.");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});