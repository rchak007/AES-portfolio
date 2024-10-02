import {
  Connection,
  PublicKey,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
// import {
//   Metadata,
//   PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
// } from "@metaplex-foundation/mpl-token-metadata"; // Correct import for Metaplex Metadata

// Helper function to introduce a delay
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Replace with the Solana address you want to query
const solanaAddress = Buffer.from(process.env.solAccount1 as string, "utf8");

// Function to get SOL balance
async function getSolanaBalance(address: string): Promise<number> {
  const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

  try {
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL; // Convert lamports to SOL
  } catch (error) {
    console.error("Error fetching SOL balance:", error);
    throw error;
  }
}

// Function to get SPL token balances with token names
async function getSolanaTokenBalances(address: string) {
  const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
  const publicKey = new PublicKey(address);

  try {
    const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
      programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), // SPL token program ID
    });

    const tokenBalances = [];

    for (const tokenAccount of tokenAccounts.value) {
      const accountInfo = await connection.getParsedAccountInfo(
        tokenAccount.pubkey
      );

      if (
        accountInfo.value?.data instanceof Object &&
        "parsed" in accountInfo.value.data
      ) {
        const parsedInfo = accountInfo.value.data["parsed"]["info"];
        const tokenAmount = parsedInfo?.tokenAmount?.uiAmountString;
        const mintAddress = parsedInfo?.mint;

        // Fetch token name using Metaplex metadata
        const tokenName = await getTokenName(connection, mintAddress);

        tokenBalances.push({ mintAddress, tokenAmount, tokenName });
      }

      // Add a delay to avoid rate-limiting (e.g., 500ms delay between requests)
      await delay(500);
    }

    return tokenBalances;
  } catch (error) {
    console.error("Error querying token balances:", error);
    throw error;
  }
}

// Function to fetch token name from the Metaplex metadata program
async function getTokenName(
  connection: Connection,
  mintAddress: string
): Promise<string> {
  try {
    // Find the PDA (Program Derived Address) for the token metadata
    const metadataPDA = await PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        new PublicKey(mintAddress).toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    const metadataAccount = await connection.getAccountInfo(metadataPDA[0]);

    if (metadataAccount) {
      const metadata = Metadata.deserialize(metadataAccount.data);
      return metadata[0].data.name.trim(); // Return the token name
    } else {
      return "Unknown Token";
    }
  } catch (error) {
    console.error("Error fetching token metadata:", error);
    return "Unknown Token"; // Return a fallback name if metadata is unavailable
  }
}

// Consolidated function to get both SOL and SPL token balances
export async function getBalances(address: string) {
  try {
    // Fetch SOL balance
    const solBalance = await getSolanaBalance(address);

    // Fetch SPL token balances
    const tokenBalances = await getSolanaTokenBalances(address);

    // Consolidate and return both balances
    return {
      solBalance,
      tokenBalances,
    };
  } catch (error) {
    console.error("Error fetching balances:", error);
    throw error;
  }
}

// Example usage
getBalances(solanaAddress)
  .then((balances) => {
    console.log(`SOL Balance: ${balances.solBalance} SOL`);
    console.log("Token Balances:");
    balances.tokenBalances.forEach((token) => {
      console.log(
        `Token: ${token.tokenName} (${token.mintAddress}), Balance: ${token.tokenAmount}`
      );
    });
  })
  .catch((error) => console.error(error));
