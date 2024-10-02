import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { getMint, MintInfo } from "@solana/spl-token";
import { Metadata, deprecated } from "@metaplex-foundation/mpl-token-metadata";

async function main() {
  // Create a connection to the Solana mainnet-beta cluster
  const connection = new Connection(clusterApiUrl("mainnet-beta"));

  // USDC token mint address
  const mintAddress = new PublicKey(
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
  );

  try {
    // Fetch mint information (e.g., decimals and supply)
    const mintInfo: MintInfo = await getMint(connection, mintAddress);
    console.log("Decimals: " + mintInfo.decimals);
    console.log("Supply: " + mintInfo.supply.toString());

    // Fetch metadata for the mint address
    const metadataPda = await deprecated.Metadata.getPDA(mintAddress);
    const metadataContent = await Metadata.fromAccountAddress(
      connection,
      metadataPda
    );

    // Pretty-print the metadata
    console.log("Metadata:", metadataContent.pretty());
  } catch (err) {
    console.error("Error: ", err);
  }
}

// Call the main function
main().catch((err) => {
  console.error(err);
});
