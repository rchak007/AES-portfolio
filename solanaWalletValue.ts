import axios from "axios";

import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const SOLSCAN_API_URL = "https://api.solscan.io";
// const SOLSCAN_API_KEY = Buffer.from(
//   process.env.SOLSCAN_API_KEY as string,
//   "utf8"
// ); // Replace with your actual API key
// const SOLSCAN_API_KEY = process.env.SOLSCAN_API_KEY as string; // Replace with your actual API key
const SOLSCAN_API_KEY = process.env.SOLSCAN_API_KEY; // Replace with your actual API key
interface TokenBalance {
  tokenAddress: string;
  tokenAmount: number;
  tokenPrice: number;
  tokenName: string;
  tokenSymbol: string;
  usdValue: number;
}

interface SolscanTokenResponse {
  success: boolean;
  data: {
    tokenAddress: string;
    amount: string;
    decimals: number;
    tokenSymbol: string;
    tokenName: string;
  }[];
}

interface PriceResponse {
  success: boolean;
  data: {
    price: number;
  };
}

// Function to fetch token balances for a given wallet address
async function getTokenBalances(
  walletAddress: string
): Promise<TokenBalance[]> {
  try {
    const response = await axios.get<SolscanTokenResponse>(
      `${SOLSCAN_API_URL}/account/tokens?account=${walletAddress}`,
      {
        headers: {
          Authorization: `Bearer ${SOLSCAN_API_KEY}`,
        },
      }
    );

    if (response.data.success) {
      const tokenBalances: TokenBalance[] = [];

      for (const token of response.data.data) {
        const tokenAmount =
          parseFloat(token.amount) / Math.pow(10, token.decimals);

        // Fetch token price from Solscan or any other price API
        const tokenPrice = await getTokenPrice(token.tokenSymbol);

        tokenBalances.push({
          tokenAddress: token.tokenAddress,
          tokenAmount: tokenAmount,
          tokenPrice: tokenPrice,
          tokenName: token.tokenName,
          tokenSymbol: token.tokenSymbol,
          usdValue: tokenAmount * tokenPrice,
        });
      }

      return tokenBalances;
    } else {
      throw new Error("Failed to fetch token balances");
    }
  } catch (error) {
    console.error("Error fetching token balances:", error);
    throw error;
  }
}

// Function to fetch token price in USD
async function getTokenPrice(tokenSymbol: string): Promise<number> {
  try {
    const response = await axios.get<PriceResponse>(
      `${SOLSCAN_API_URL}/market/token/${tokenSymbol}`,
      {
        headers: {
          Authorization: `Bearer ${SOLSCAN_API_KEY}`,
        },
      }
    );

    if (response.data.success) {
      return response.data.data.price;
    } else {
      throw new Error("Failed to fetch token price");
    }
  } catch (error) {
    console.error(`Error fetching price for token ${tokenSymbol}:`, error);
    return 0; // Return 0 if price is not available
  }
}

// Function to calculate the total USD value of a wallet
async function getTotalWalletValue(walletAddress: string): Promise<number> {
  const tokenBalances = await getTokenBalances(walletAddress);

  let totalValue = 0;
  for (const token of tokenBalances) {
    totalValue += token.usdValue;
  }

  console.log("Total USD Value:", totalValue);
  return totalValue;
}

// Example usage
const walletAddress = "your_solana_wallet_address_here"; // Replace with actual wallet address
const solHeliumMobile = process.env.solHeliumMobile as string; // Account- Helium Mobile - - iphone

getTotalWalletValue(solHeliumMobile)
  .then((totalValue) => {
    console.log(`Total USD value of the wallet: $${totalValue}`);
  })
  .catch((error) => {
    console.error("Error:", error);
  });

// getTotalWalletValue(solHeliumMobile);
