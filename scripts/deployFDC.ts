import { network } from "hardhat";

async function main() {
  const { viem } = await network.connect();

  // FDC Verification address on Coston2 — from ContractRegistry
  const FDC_VERIFICATION = "0x906507E0B64bcD494Db73bd0459d1C667e14B933" as `0x${string}`;

  console.log("Deploying FDCVerifier...");
  const fdcVerifier = await viem.deployContract("FDCVerifier", [FDC_VERIFICATION]);
  console.log("FDCVerifier:", fdcVerifier.address);

  console.log("\nDone. Add to .env:");
  console.log("FDC_VERIFIER_ADDRESS=" + fdcVerifier.address);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });