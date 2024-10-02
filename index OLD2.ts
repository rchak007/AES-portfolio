import {
  Connection,
  PublicKey,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

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

// Function to get SPL token balances
async function getSolanaTokenBalances(address: string) {
  const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
  const publicKey = new PublicKey(address);

  try {
    const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
      programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), // SPL token program ID
    });

    const tokenBalances = [];
    // Limit the number of tokens processed to 50
    // console.log("tokenBalances total ", len)
    const limitedTokenAccounts = tokenAccounts.value.slice(0, 50);

    for (const tokenAccount of limitedTokenAccounts) {
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

        tokenBalances.push({ mintAddress, tokenAmount });
      }
    }

    // for (const tokenAccount of tokenAccounts.value) {
    //   const accountInfo = await connection.getParsedAccountInfo(
    //     tokenAccount.pubkey
    //   );

    //   if (
    //     accountInfo.value?.data instanceof Object &&
    //     "parsed" in accountInfo.value.data
    //   ) {
    //     const parsedInfo = accountInfo.value.data["parsed"]["info"];
    //     const tokenAmount = parsedInfo?.tokenAmount?.uiAmountString;
    //     const mintAddress = parsedInfo?.mint;

    //     tokenBalances.push({ mintAddress, tokenAmount });
    //   }
    // }

    return tokenBalances;
  } catch (error) {
    console.error("Error querying token balances:", error);
    throw error;
  }
}

// Consolidated function to get both SOL and SPL token balances
export async function getBalances(address: string) {
  try {
    // Fetch SOL balance
    const solBalance = await getSolanaBalance(address);

    // Fetch SPL token balances
    // const tokenBalances = await getSolanaTokenBalances(address);

    // Consolidate and return both balances
    return {
      solBalance,
      // tokenBalances,
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
    // console.log("Token Balances:", balances.tokenBalances);
  })
  .catch((error) => console.error(error));
