import {
  Connection,
  PublicKey,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import dotenv from "dotenv";

// Example usage

const address = Buffer.from(process.env.solAccount1 as string, "utf8"); // Account 1 iphone
// Replace with the Solana address you want to query
const solanaAddress = Buffer.from(process.env.solAccount1 as string, "utf8");

// Helper function to introduce a delay
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getSolanaBalance(address: string): Promise<number> {
  const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed"); // Or use "devnet" for testing

  try {
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error("Error fetching balance:", error);
    throw error;
  }
}

getSolanaBalance(address)
  .then((balance) => console.log(`Balance: ${balance} SOL`))
  .catch((error) => console.error(error));

// Function to query all token balances for a given Solana address
export async function getSolanaTokenBalances(address: string) {
  const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
  const publicKey = new PublicKey(address);

  try {
    // Fetch token accounts by owner
    const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
      programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), // This is the correct program ID for SPL tokens
    });

    for (const tokenAccount of tokenAccounts.value) {
      const accountInfo = await connection.getParsedAccountInfo(
        tokenAccount.pubkey
      );

      // Type-check to ensure `data` has "parsed" property
      if (
        accountInfo.value?.data instanceof Object &&
        "parsed" in accountInfo.value.data
      ) {
        const parsedInfo = accountInfo.value.data["parsed"]["info"];
        const tokenAmount = parsedInfo?.tokenAmount?.uiAmountString;
        const mintAddress = parsedInfo?.mint;

        console.log(`Token: ${mintAddress}, Balance: ${tokenAmount}`);
      }
      // Add a delay to avoid rate-limiting (e.g., 500ms delay between requests)
      await delay(500);
    }
  } catch (error) {
    // Handle error, cast to Error type to access message
    if (error instanceof Error) {
      console.error("Error querying Solana token balances:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
  }
}

getSolanaTokenBalances(solanaAddress);
