import { createPublicClient, http } from "viem";

async function main() {
  const client = createPublicClient({
    transport: http("https://coston2-api.flare.network/ext/C/rpc"),
  });

  const WALLET = "0x0df45edc0eef5bdf137ddacf96fbe800f1ce7733" as `0x${string}`;

  const blockNumber = await client.getBlockNumber();
  console.log("Current block:", blockNumber.toString());
  console.log("Searching last 500 blocks...\n");

  for (let i = 0; i < 500; i++) {
    const block = await client.getBlock({
      blockNumber: blockNumber - BigInt(i),
      includeTransactions: true,
    });

    for (const tx of block.transactions) {
      if (typeof tx === "object" && tx.from?.toLowerCase() === WALLET.toLowerCase()) {
        console.log("Found tx:");
        console.log("Hash:   ", tx.hash);
        console.log("Block:  ", tx.blockNumber?.toString());
        console.log("To:     ", tx.to);
        console.log("Blocks ago:", i);
        return;
      }
    }

    if (i % 50 === 0) console.log(`Checked ${i} blocks...`);
  }

  console.log("No tx found in last 500 blocks.");
}

main().catch(console.error);