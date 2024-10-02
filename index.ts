

import {
  Connection,
  PublicKey,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { getMint } from "@solana/spl-token";
import { Metaplex, token } from "@metaplex-foundation/js";
import { ENV, TokenListProvider } from "@solana/spl-token-registry";
import axios from "axios";

import dotenv from "dotenv";


// import {
//   JsonRpcProvider as SuiJsonRpcProvider,
//   Connection as SuiConnection,
// } from "@mysten/sui.js";

import { ethers } from "ethers";

// import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { getFaucetHost, requestSuiFromFaucetV1 } from "@mysten/sui/faucet";
import { MIST_PER_SUI } from "@mysten/sui/utils";

// // Initialize connection to the Sui network (Mainnet, Testnet, or Devnet)
// const suiConnection = new SuiConnection({
//   fullnode: "https://fullnode.mainnet.sui.io", // Replace with appropriate network URL (Mainnet, Testnet, etc.)
// });


// Load environment variables from .env file
dotenv.config();

// CoinGecko API base URL
const COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price";
// https://api.coingecko.com/api/v3/simple/price?ids=jupiter&vs_currencies=usd

// Define the structure of token balance objects
interface TokenBalance {
  mintAddress: PublicKey;
  tokenAmount: string;
  tokenName: string;
  tokenSymbol: string;
  balanceInUSD: number;
  tokenPriceInUSD: number;
}

interface RebalanceResult {
  action: "BUY" | "SELL" | "NEUTRAL";
  valueInUSD: number;
  tokenQuantity: number;
}

// https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin&x_cg_demo_api_key=....

// https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&contract_addresses=.......fQ&x_cg_demo_api_key=.....

// [{"id":"bitcoin","symbol":"btc","name":"Bitcoin","image":"https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png?1696501400","current_price":56875,"market_cap":1124527674971,"market_cap_rank":1,"fully_diluted_valuation":1195565864436,"total_volume":34496456931,"high_24h":57897,"low_24h":54599,"price_change_24h":2265.75,"price_change_percentage_24h":4.14901,"market_cap_change_24h":46507310722,"market_cap_change_percentage_24h":4.31414,"circulating_supply":19752221.0,"total_supply":21000000.0,"max_supply":21000000.0,"ath":73738,"ath_change_percentage":-22.91466,"ath_date":"2024-03-14T07:10:36.635Z","atl":67.81,"atl_change_percentage":83725.35584,"atl_date":"2013-07-06T00:00:00.000Z","roi":null,"last_updated":"2024-09-10T05:48:22.508Z"}]

// Helper function to introduce a delay
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Replace with the Solana address you want to query
// const solAccount1 = Buffer.from(process.env.solAccount1 as string, "utf8"); // Account 1 iphone

const solHeliumMobile = Buffer.from(process.env.solHeliumMobile as string, "utf8"); // Account- Helium Mobile - - iphone

const solHeliumHnt = Buffer.from(process.env.solHeliumHnt as string, "utf8"); // Account- Helium HNT - iphone

const solChitra = Buffer.from(process.env.solChitra as string, "utf8"); // Account- Chitra - - iphone

const solTrump = Buffer.from(process.env.solTrump as string, "utf8"); // Account- Trump - - does not work price

const solMaga = Buffer.from(process.env.solMaga as string, "utf8"); // Account- Maga - - iphone

const solWBTC = Buffer.from(process.env.solWBTC as string, "utf8"); // Account- WBTC phantom iphone
const solRENDER = Buffer.from(process.env.solRENDER as string, "utf8"); // Account- WBTC phantom iphone

const solJUPITER = Buffer.from(process.env.solJUPITER as string, "utf8"); // Account- desktop phantom jupiter
const solPYTH = Buffer.from(process.env.solPYTH as string, "utf8"); // Account- desktop phantom pyth

// not using exodus anymore as swapping is expensive - sent this to WBTC iphone Phantom
const exodusUSDT = Buffer.from(process.env.exodusUSDT as string, "utf8"); // exodus wallet iphone USDT in sol network
const exodusBTCiphone = Buffer.from(process.env.exodusBTCiphone as string, "utf8"); // exodus wallet iphone btc

const YOUR_INFURA_API_KEY = Buffer.from(process.env.YOUR_INFURA_API_KEY as string, "utf8");

// Worldcoin (WLD) contract address on Optimism
const WLD_CONTRACT_ADDRESS = Buffer.from(process.env.WLD_CONTRACT_ADDRESS as string, "utf8");

// Define the Sui wallet address
const suiWalletAddress =
Buffer.from(process.env.suiWalletAddress as string, "utf8"); // Replace with your actual Sui wallet address

// Function to get SOL balance
async function getSolanaBalance(address: string): Promise<number> {
  const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

  try {
    const publicKey = new PublicKey(address);
    // console.log("Pub key = ", publicKey);
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

  const metaplex = Metaplex.make(connection);

  try {
    const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
      programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), // SPL token program ID
    });

    const tokenBalances: TokenBalance[] = [];

    for (const tokenAccount of tokenAccounts.value) {
      await delay(3000);
      const accountInfo = await connection.getParsedAccountInfo(
        tokenAccount.pubkey
      );

      if (
        accountInfo.value?.data instanceof Object &&
        "parsed" in accountInfo.value.data
      ) {
        const parsedInfo = accountInfo.value.data["parsed"]["info"];
        const tokenAmount = parsedInfo?.tokenAmount?.uiAmountString;
        // const mintAddress = parsedInfo?.mint;
        const mintAddress = new PublicKey(parsedInfo?.mint);
        // console.log("mintaddress- ", mintAddress);

        // Fetch token metadata (name, symbol) using the new approach
        const { tokenName, tokenSymbol } = await getTokenMetadata(mintAddress);
        let formattedTokenName = tokenName.replace(/ /g, "-").toLowerCase();
        // console.log("formatted token listing- ", formattedTokenName);

        // if (
        //   formattedTokenName.toLowerCase() === "flork-demon" ||
        //   formattedTokenName.toLowerCase() === "mafia" ||
        //   formattedTokenName.toLowerCase() === "trump" ||
        //   formattedTokenName.toLowerCase() === "wormhole-token" ||
        //   formattedTokenName.toLowerCase() === "baby-bonk" ||
        //   formattedTokenName.toLowerCase() === "maga-(wormhole)"
        // ) {
        //   continue; // skip these bad tokens
        // }

        if (
          formattedTokenName.toLowerCase() === "mew" ||
          formattedTokenName.toLowerCase() === "chat" ||
          // formattedTokenName.toLowerCase() === "wrapped-bitcoin" ||
          // formattedTokenName.toLowerCase() === "ethereum-wormhole" ||
          // formattedTokenName.toLowerCase() === "whales" ||
          formattedTokenName.toLowerCase() === "whales-market" ||
          // formattedTokenName.toLowerCase() === "usd-coin-pos-wormhole" ||
          // formattedTokenName.toLowerCase() === "wormhole" ||
          // formattedTokenName.toLowerCase() === "wrapped-btc-wormhole" ||
          formattedTokenName.toLowerCase() === "catwifhat" ||
          formattedTokenName.toLowerCase() === "samoyed-coin" ||
          formattedTokenName.toLowerCase() === "success-kid" ||
          formattedTokenName.toLowerCase() === "gummy" ||
          formattedTokenName.toLowerCase() === "guacamole" ||
          formattedTokenName.toLowerCase() === "bridged-maga-wormhole" ||
          formattedTokenName.toLowerCase() === "cat-in-a-dogs-world" ||
          formattedTokenName.toLowerCase() === "babybonk" ||
          // formattedTokenName.toLowerCase() === "wrapped-ether-(wormhole)" ||
          // formattedTokenName.toLowerCase() === "wrapped-btc-(wormhole)" ||
          formattedTokenName.toLowerCase() === "usd-coin" ||
          // formattedTokenName.toLowerCase() === "usdt" ||
          formattedTokenName.toLowerCase() === "wormhole-token" ||
          formattedTokenName.toLowerCase() === "nosana" ||
          // formattedTokenName.toLowerCase() === "weth" ||
          // formattedTokenName.toLowerCase() === "wbtc" ||
          formattedTokenName.toLowerCase() === "helium" ||
          formattedTokenName.toLowerCase() === "helium-mobile" ||
          // formattedTokenName.toLowerCase() === "helium-network-token" ||
          formattedTokenName.toLowerCase() === "helium" ||
          // formattedTokenName.toLowerCase() === "jupiter-exchange-solana" ||
          formattedTokenName.toLowerCase() === "pyth" ||
          // formattedTokenName.toLowerCase() === "jupiter" ||
          formattedTokenName.toLowerCase() === "pyth-network" ||
          formattedTokenName.toLowerCase() === "babybonk"
          // formattedTokenName.toLowerCase() === "tether-usd-wormhole"
        ) {
        } else if (
          formattedTokenName.toLowerCase() === "wrapped-btc-(wormhole)"
        ) {
          formattedTokenName = "bitcoin";
        } else if (
          formattedTokenName.toLowerCase() === "wrapped-ether-(wormhole)"
        ) {
          formattedTokenName = "ethereum";
        } else if (formattedTokenName.toLowerCase() === "usdt") {
          formattedTokenName = "tether";
        } else if (
          formattedTokenName.toLowerCase() === "helium-network-token"
        ) {
          formattedTokenName = "helium";
        } else if (formattedTokenName.toLowerCase() === "jupiter") {
          formattedTokenName = "jupiter-exchange-solana";
        } else if (formattedTokenName.toLowerCase() === "maga-(wormhole)") {
          formattedTokenName = "maga";
        } else {
          console.log("skipping token - ", formattedTokenName);
          continue;
        }

        // mintAddress
        // connection,
        // metaplex
        // console.log(
        //   "in FOR LOOP - -- Token name = ",
        //   tokenName,
        //   " symbol = ",
        //   tokenSymbol
        // );

        // Fetch the token price in USD
        // const tokenPriceInUSD = await getTokenPriceInUSD(
        //   tokenSymbol.toLowerCase()
        // );
        // console.log("formatted token getting price- ", formattedTokenName);
        const tokenPriceInUSD = await getTokenPriceInUSD(
          formattedTokenName.toLowerCase()
        );

        // Calculate the balance value in USD
        const balanceInUSD = parseFloat(tokenAmount) * tokenPriceInUSD;
        // console.log(
        //   "in FOR loop token, ",
        //   tokenSymbol,
        //   "formatted token name ",
        //   formattedTokenName,
        //   " USD token price",
        //   tokenPriceInUSD,
        //   " token qty = ",
        //   tokenAmount,
        //   " Total value = ",
        //   balanceInUSD
        // );

        tokenBalances.push({
          mintAddress,
          tokenAmount,
          tokenName: formattedTokenName,
          tokenSymbol,
          balanceInUSD,
          tokenPriceInUSD,
        });

        // process.exit(0);

        // tokenBalances.push({
        //   mintAddress,
        //   tokenAmount,
        //   tokenName,
        //   tokenSymbol,
        // });
      }

      // Add a delay to avoid rate-limiting (e.g., 500ms delay between requests)
      await delay(1000);
    }

    return tokenBalances;
  } catch (error) {
    console.error("Error querying token balances:", error);
    throw error;
  }
}

// Function to fetch token name and symbol using Metaplex or SPL Token Registry
async function getTokenMetadata(mintAddress: PublicKey) {
  // connection: Connection,
  // metaplex: Metaplex

  let tokenName;
  let tokenSymbol;

  const connection = new Connection("https://api.mainnet-beta.solana.com");
  const metaplex = Metaplex.make(connection);

  // console.log("mintAddress in side getTokenmetadata = ", mintAddress);

  // const mintAddress = new PublicKey(
  //   "8otGo2J4Et8kXALWKU5QTd7aX2QMQ93BgX6H1MtZXw3z"
  // );

  // try {
  const metadataAccount = metaplex
    .nfts()
    .pdas()
    .metadata({ mint: mintAddress });
  // console.log("CAME HERE metaplex 1st call");
  const metadataAccountInfo = await connection.getAccountInfo(metadataAccount);
  // console.log("CAME HERE after connection");

  if (metadataAccountInfo) {
    // console.log("CAME HERE into metadataAccountInfo is true");
    const token = await metaplex.nfts().findByMint({ mintAddress });
    tokenName = token.name;
    tokenSymbol = token.symbol;
    // console.log("1st IF ", tokenName, " ", tokenSymbol);
  } else {
    const provider = await new TokenListProvider().resolve();
    const tokenList = provider.filterByChainId(ENV.MainnetBeta).getList();
    const tokenMap = tokenList.reduce((map, item) => {
      map.set(item.address, item);
      return map;
    }, new Map());

    const token = tokenMap.get(mintAddress.toBase58());
    // if (token) {
    tokenName = token.name;
    tokenSymbol = token.symbol;
    console.log("2nd IF ", tokenName, " ", tokenSymbol);
    // } else {
    //   tokenName = "Unknown Token";
    //   tokenSymbol = "Unknown Symbol";
    // }
  }
  // } catch (error) {
  //   console.error(
  //     // `Error fetching metadata for token ${mintAddress.toBase58()}:`,
  //     `Error fetching metadata for token CHNGED---- `,
  //     error
  //   );
  //   tokenName = "Unknown Token";
  //   tokenSymbol = "Unknown Symbol";
  // }

  return { tokenName, tokenSymbol };
}

// Consolidated function to get both SOL and SPL token balances
export async function getBalances(address: string, solanaPriceInUSD: number) {
  try {
    // Fetch SOL balance
    const solBalance = await getSolanaBalance(address);

    // Fetch SPL token balances
    const tokenBalances = await getSolanaTokenBalances(address);
    // const solanaPriceInUSD = await getTokenPriceInUSD("solana");
    // Consolidate and return both balances
    return {
      solBalance,
      tokenBalances,
      solanaPriceInUSD,
    };
  } catch (error) {
    console.error("Error fetching balances:", error);
    throw error;
  }
}

// Function to get token price in USD using CoinGecko API
async function getTokenPriceInUSD(tokenName: string): Promise<number> {
  // If token symbol is "_" or missing, assume it's SOL
  // console.log("toke Symbol passed to getTokenPriceInUSD - ", tokenName);
  // if (!tokenName || tokenName === "_") {
  //   tokenName = "solana";
  // } else if (tokenName === "sonda") {
  //   tokenName = "solanaconda";
  // }
  // tokenSymbol = "solana";
  tokenName = tokenName.toLowerCase();
  const url = `${COINGECKO_API}?ids=${tokenName}&vs_currencies=usd`;
  // console.log("token symbol = ", tokenName);
  // console.log("URL = ", url);
  try {
    const response = await axios.get(
      `${COINGECKO_API}?ids=${tokenName}&vs_currencies=usd`
    );
    // console.log(
    //   "Json Data =",
    //   response.data,
    //   " Json token  =",
    //   response.data[tokenName.toLowerCase()],
    //   "Json USD =",
    //   response.data[tokenName].usd
    // );
    if (response.data[tokenName]) {
      return response.data[tokenName].usd;
    }
  } catch (error) {
    console.error(`Error fetching price for ${tokenName}:`, error);
  }
  // process.exit(0);
  return 0; // Default to 0 if price not found
}

// Example usage

// async function portfolioRebalancer(
//   wallet: string,
//   rebalSymbol: string,
//   target: number
// ): Promise<number> {
//   return getBalances(wallet)
//     .then((balances) => {
//       console.log(
//         `SOL Balance: ${balances.solBalance} SOL`,
//         `SOL USD Price : ${balances.solanaPriceInUSD} USD`,
//         `SOL USD value = ${balances.solBalance * balances.solanaPriceInUSD}`
//       );
//       let cash = 0;
//       let rebalSymbolUSD = 0;
//       let rebalSymbolPrice = 0;
//       console.log("Token Balances:");
//       balances.tokenBalances.forEach((token) => {
//         console.log(
//           `Token: ${token.tokenName} (${token.tokenSymbol}), Balance: ${token.tokenAmount}, USD Price: ${token.tokenPriceInUSD}, Value in USD: $${token.balanceInUSD}`
//         );
//         if (token.tokenSymbol === "USDT" || token.tokenSymbol === "USDC") {
//           cash = cash + token.balanceInUSD;
//         }
//         if (token.tokenSymbol === rebalSymbol) {
//           rebalSymbolUSD = rebalSymbolUSD + token.balanceInUSD;
//           rebalSymbolPrice = token.tokenPriceInUSD;
//         }
//         // console.log(
//         //   `Token: ${token.tokenName} (${token.tokenSymbol}), Balance: ${token.tokenAmount}`
//         //   // `Token:Balance: ${token.tokenAmount}`
//         // );
//       });

//       if (rebalSymbol === "NONE") {
//         console.log("Cash from insdide = ", cash);
//         return cash;
//       }

//       let percentInCash = (cash * 100) / (cash + rebalSymbolUSD);
//       console.log(
//         "*** FINAL *** Cash value = ",
//         cash,
//         `${rebalSymbol} value`,
//         rebalSymbolUSD,
//         " % in Cash = ",
//         percentInCash
//       );

//       let totalValUSD = cash + rebalSymbolUSD;
//       console.log("total USD val = ", totalValUSD);
//       let expectedTargetUSD = totalValUSD * (target / 100);
//       console.log("expectedTargetUSD = ", expectedTargetUSD);
//       let expectedRebalSymbolUSD = totalValUSD - expectedTargetUSD;
//       console.log("expectedRebalSymbolUSD = ", expectedRebalSymbolUSD);

//       let buyVal = 0;
//       let buyQty = 0;
//       if (expectedRebalSymbolUSD > rebalSymbolUSD) {
//         buyVal = expectedRebalSymbolUSD - rebalSymbolUSD;
//         buyQty = buyVal / rebalSymbolPrice;
//         console.log("**** BUY ***** buyVal = ", buyVal, " Buy Qty = ", buyQty);
//       } else if (expectedRebalSymbolUSD < rebalSymbolUSD) {
//         let sellVal = rebalSymbolUSD - expectedRebalSymbolUSD;
//         let sellQty = sellVal / rebalSymbolPrice;
//         console.log(
//           "**** SELL ***** sellVal = ",
//           sellVal,
//           " Sell Qty = ",
//           sellQty
//         );
//       } else {
//         console.log("**** NEUTRAL -EQUAL-- ");
//       }
//       return cash; // Ensure to return cash or another value for rebalancing.
//     })
//     .catch((error) => {
//       console.error(error);
//       throw error;
//     });
// }

async function portfolioRebalancer(
  wallet: string,
  rebalSymbol: string,
  target: number,
  solanaPriceInUSD: number
): Promise<number> {
  return getBalances(wallet, solanaPriceInUSD)
    .then((balances) => {
      if (solanaPriceInUSD > 0) {
        console.log(
          `SOL Balance: ${balances.solBalance} SOL`,
          `SOL USD Price : ${balances.solanaPriceInUSD} USD`,
          `SOL USD value = ${balances.solBalance * balances.solanaPriceInUSD}`
        );
      }
      let cash = 0;
      let rebalSymbolUSD = 0;
      let rebalSymbolPrice = 0;
      console.log("Token Balances:");
      balances.tokenBalances.forEach((token) => {
        console.log(
          `Token: ${token.tokenName} (${token.tokenSymbol}), Balance: ${token.tokenAmount}, USD Price: ${token.tokenPriceInUSD}, Value in USD: $${token.balanceInUSD}`
        );
        if (token.tokenSymbol === "USDT" || token.tokenSymbol === "USDC") {
          cash = cash + token.balanceInUSD;
        }
        if (token.tokenSymbol === rebalSymbol) {
          rebalSymbolUSD = rebalSymbolUSD + token.balanceInUSD;
          rebalSymbolPrice = token.tokenPriceInUSD;
        }
      });

      if (rebalSymbol === "NONE") {
        // console.log("Cash from inside = ", cash);
        return cash;
      }

      const rebalanceResult = calculateRebalance(
        cash,
        rebalSymbolUSD,
        rebalSymbolPrice,
        target
      );

      if (rebalanceResult.action === "BUY") {
        console.log(
          `**** BUY ***** buyVal = ${rebalanceResult.valueInUSD} USD, Buy Qty = ${rebalanceResult.tokenQuantity}`
        );
      } else if (rebalanceResult.action === "SELL") {
        console.log(
          `**** SELL ***** sellVal = ${rebalanceResult.valueInUSD} USD, Sell Qty = ${rebalanceResult.tokenQuantity}`
        );
      } else {
        console.log("**** NEUTRAL - EQUAL-- ");
      }

      return cash; // Ensure to return cash or another value for rebalancing.
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
}

// Function to query a Bitcoin address balance using BlockCypher API
async function queryBitcoinAddress(address: string) {
  const apiUrl = `https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance`;

  try {
    const response = await axios.get(apiUrl);
    const data = response.data;
    const btcPriceInUSD = await getTokenPriceInUSD("bitcoin");
    console.log("started with BTC = 0.09252135 + 0.00185233 = 0.09437368");
    console.log("Curren BTC price = ", btcPriceInUSD);

    const btcValUSD = (data.balance / 100_000_000) * btcPriceInUSD;

    console.log(
      `Address: ${address}`,
      `Balance: ${data.balance} satoshis`,
      `Balance in BTC: ${data.balance / 100_000_000} BTC`,
      `BTC USD value = ${(data.balance / 100_000_000) * btcPriceInUSD}`
    );
    const usdt = await portfolioRebalancer(
      exodusUSDT,
      "NONE",
      20,
      0 // solanaPriceInUSD - dont need this for Bitcoin.
    );
    console.log("USDT = ", usdt);
    let target = 20;

    let totalValUSD = usdt + btcValUSD;
    console.log("total USD val = ", totalValUSD);
    let usdCurrPerc = (usdt / totalValUSD) * 100;
    console.log("Current USD % = ", usdCurrPerc);
    console.log("Target USD % = ", target);
    let expectedTargetUSD = totalValUSD * (target / 100);
    console.log("expectedTargetUSD = ", expectedTargetUSD);
    let expectedRebalSymbolUSD = totalValUSD - expectedTargetUSD;
    console.log("expectedRebalSymbolUSD = ", expectedRebalSymbolUSD);
    let buyVal = 0;
    let buyQty = 0;
    if (expectedRebalSymbolUSD > btcValUSD) {
      buyVal = expectedRebalSymbolUSD - btcValUSD;
      buyQty = buyVal / btcPriceInUSD;
      console.log("**** BUY ***** buyVal = ", buyVal, " Buy Qty = ", buyQty);
    } else if (expectedRebalSymbolUSD < btcValUSD) {
      let sellVal = btcValUSD - expectedRebalSymbolUSD;
      let sellQty = sellVal / btcPriceInUSD;
      console.log(
        "**** SELL ***** sellVal = ",
        sellVal,
        " Sell Qty = ",
        sellQty
      );
    } else {
      console.log("**** NEUTRAL -EQUAL-- ");
    }

    // console.log(`Total Received: ${data.total_received} satoshis`);
    // console.log(`Total Sent: ${data.total_sent} satoshis`);
  } catch (error) {
    if (error instanceof Error) {
      // Now you can safely access error.message
      console.error("Error querying the Bitcoin address:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
  }
}

// Function to query Ethereum address balance
// async function getEthereumBalance(address: string): Promise<number> {
//   // const ethers = require("ethers");
//   const provider = new ethers.providers.InfuraProvider(
//     "mainnet",
//     YOUR_INFURA_API_KEY
//   );

//   try {
//     const balance = await provider.getBalance(address);
//     const balanceInEther = parseFloat(ethers.utils.formatEther(balance));
//     console.log(`ETH Balance: ${balanceInEther} ETH`);
//     return balanceInEther;
//   } catch (error) {
//     console.error("Error querying Ethereum balance:", error);
//     throw error;
//   }
// }

// Function to query Ethereum address balance
async function getEthereumBalance(address: string): Promise<number> {

  if (!YOUR_INFURA_API_KEY) {
    throw new Error("Infura API key is not defined in the environment variables");
  }
  const provider = new ethers.JsonRpcProvider(
    `https://mainnet.infura.io/v3/${YOUR_INFURA_API_KEY}`
  );  

  try {
    const balance = await provider.getBalance(address);
    const balanceInEther = parseFloat(ethers.formatEther(balance)); // Note: ethers@6.x.x uses ethers.formatEther
    console.log(`ETH Balance: ${balanceInEther} ETH`);
    return balanceInEther;
  } catch (error) {
    console.error("Error querying Ethereum balance:", error);
    throw error;
  }
}

// Function to query Layer 2 balances (Optimism and Arbitrum)
async function getLayer2Balance(address: string): Promise<number> {
  const optimismProvider = new ethers.JsonRpcProvider(
    "https://mainnet.optimism.io"
  );
  const arbitrumProvider = new ethers.JsonRpcProvider(
    "https://arb1.arbitrum.io/rpc"
  );

  try {
    const optimismBalance = await optimismProvider.getBalance(address);
    const arbitrumBalance = await arbitrumProvider.getBalance(address);

    const optimismInEther = parseFloat(ethers.formatEther(optimismBalance)); // Use ethers.formatEther
    const arbitrumInEther = parseFloat(ethers.formatEther(arbitrumBalance));

    console.log(`Optimism Balance: ${optimismInEther} ETH`);
    console.log(`Arbitrum Balance: ${arbitrumInEther} ETH`);

    return optimismInEther + arbitrumInEther;
  } catch (error) {
    console.error("Error querying Layer 2 balance:", error);
    throw error;
  }
}

// ERC-20 ABI, minimum required to interact with `balanceOf`
const ERC20_ABI = [
  // balanceOf
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  // decimals
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
];

// Function to get Token balance
async function getTokenBalance(
  address: string,
  token: string,
  tokenName: string
): Promise<string> {
  const optimismProvider = new ethers.JsonRpcProvider(
    "https://mainnet.optimism.io"
  );

  try {
    // Create a new contract instance for Token
    const tokenContract = new ethers.Contract(
      token,
      ERC20_ABI,
      optimismProvider
    );

    // Get balance in WLD for the provided address
    const balance = await tokenContract.balanceOf(address);

    // Get decimals for WLD token
    const decimals = await tokenContract.decimals();

    // Convert the balance to a human-readable format (divide by 10^decimals)
    const balanceInToken = ethers.formatUnits(balance, decimals);

    console.log(`*********  ${tokenName} Token Balance: ${balanceInToken}   `);
    return balanceInToken;
  } catch (error) {
    console.error("Error querying WLD token balance:", error);
    throw error;
  }
}

interface RebalanceResult {
  action: "BUY" | "SELL" | "NEUTRAL";
  valueInUSD: number;
  tokenQuantity: number;
}

function calculateRebalance(
  currentCashUSD: number,
  currentTokenUSD: number,
  tokenPrice: number,
  targetCashPercentage: number
): RebalanceResult {
  const totalValUSD = currentCashUSD + currentTokenUSD;

  // Calculate the target cash value in USD
  const expectedTargetUSD = totalValUSD * (targetCashPercentage / 100);
  const expectedRebalTokenUSD = totalValUSD - expectedTargetUSD;

  const currCashperc = (currentCashUSD / totalValUSD) * 100;
  console.log("currCashperc = ", currCashperc, "%");

  let action: "BUY" | "SELL" | "NEUTRAL" = "NEUTRAL";
  let valueInUSD = 0;
  let tokenQuantity = 0;

  // If we need to buy tokens
  if (expectedRebalTokenUSD > currentTokenUSD) {
    valueInUSD = expectedRebalTokenUSD - currentTokenUSD;
    tokenQuantity = valueInUSD / tokenPrice;
    action = "BUY";
  }
  // If we need to sell tokens
  else if (expectedRebalTokenUSD < currentTokenUSD) {
    valueInUSD = currentTokenUSD - expectedRebalTokenUSD;
    tokenQuantity = valueInUSD / tokenPrice;
    action = "SELL";
  }

  return {
    action,
    valueInUSD,
    tokenQuantity,
  };
}

// Replace with the Bitcoin address you want to query
const bitcoinAddress = exodusBTCiphone;

// create a new SuiClient object pointing to the network you want to use
// const suiClient = new SuiClient({ url: getFullnodeUrl("mainnet") });

// // Convert MIST to Sui
// const balance = (balance) => {
//   return Number.parseInt(balance.totalBalance) / Number(MIST_PER_SUI);
// };

// store the JSON representation for the SUI the address owns before using faucet
// const suiBefore = await suiClient.getBalance({
//   owner: suiWalletAddress,
// });

// await requestSuiFromFaucetV1({
//   // use getFaucetHost to make sure you're using correct faucet address
//   // you can also just use the address (see Sui TypeScript SDK Quick Start for values)
//   host: getFaucetHost("devnet"),
//   recipient: suiWalletAddress,
// });

// // store the JSON representation for the SUI the address owns after using faucet
// const suiAfter = await suiClient.getBalance({
//   owner: suiWalletAddress,
// });

// // Output result to console.
// console.log(
//   `Balance before faucet: ${balance(suiBefore)} SUI. Balance after: ${balance(
//     suiAfter
//   )} SUI. Hello, SUI!`
// );

async function runRebalancer(tokens: string[], solanaPriceInUSD: number) {
  // Define the token options and their associated wallets
  const tokenOptions: {
    [key: string]: { wallet: string; rebalSymbol: string };
  } = {
    MOBILE: { wallet: solHeliumMobile, rebalSymbol: "MOBILE" },
    HNT: { wallet: solHeliumHnt, rebalSymbol: "HNT" },
    TRUMP: { wallet: solMaga, rebalSymbol: "TRUMP" },
    JUP: { wallet: solJUPITER, rebalSymbol: "JUP" },
    PYTH: { wallet: solPYTH, rebalSymbol: "PYTH" },
    WBTC: { wallet: solWBTC, rebalSymbol: "WBTC" },
    // Add more tokens as needed...
  };

  // Loop through the provided tokens list and run portfolioRebalancer for each
  for (const token of tokens) {
    if (tokenOptions[token]) {
      const { wallet, rebalSymbol } = tokenOptions[token];
      console.log("*******************************************");
      await portfolioRebalancer(wallet, rebalSymbol, 20, solanaPriceInUSD);
      console.log("*******************************************");
      await delay(5000); // Adjust delay as necessary
    } else {
      console.log(`Token ${token} not found.`);
    }
  }
}

// queryBitcoinAddress(bitcoinAddress);

// // getEthereumBalance("0x6A30aA8E9Ae3Ed24c565Bf1f4060Ab167b0DA042");
// getLayer2Balance("0x6A30aA8E9Ae3Ed24c565Bf1f4060Ab167b0DA042");
// getTokenBalance(
//   "0x6A30aA8E9Ae3Ed24c565Bf1f4060Ab167b0DA042",
//   WLD_CONTRACT_ADDRESS,
//   "WLD"
// );

async function main() {
  const solanaPriceInUSD = await getTokenPriceInUSD("solana");
  console.log("Solana price = ", solanaPriceInUSD);
  // await runRebalancer(["WBTC"], solanaPriceInUSD); // only symbol
  // await delay(5000);
  // await runRebalancer(["PYTH"], solanaPriceInUSD); // only symbol
  // await delay(5000);
  // await runRebalancer(["JUP"], solanaPriceInUSD); // only symbol
  // await delay(5000);
  // await runRebalancer(["MOBILE"], solanaPriceInUSD); // only symbol
  // await delay(5000);
  // await runRebalancer(["HNT"], solanaPriceInUSD); // only symbol
  await delay(5000);
  await runRebalancer(["TRUMP"], solanaPriceInUSD); // only symbol
  // await queryBitcoinAddress(bitcoinAddress);

  // SUI wallet
  // const suiBalance = await getSuiBalance(suiWalletAddress);
  // const suiUsdtCoinType = '0x...';  // Replace with the correct USDT coin type for Sui
  // const suiUsdtBalance = await getSuiUsdtBalance(suiWalletAddress, suiUsdtCoinType);
}

main();
