import { Metaplex } from "@metaplex-foundation/js";
import { Connection, PublicKey } from "@solana/web3.js";
import { ENV, TokenListProvider } from "@solana/spl-token-registry";

async function getTokenMetadata() {
  const connection = new Connection("https://api.mainnet-beta.solana.com");
  const metaplex = Metaplex.make(connection);

  //   const mintAddress = new PublicKey(
  //     "6vE9fMwHjuRD9egfe1DD29XbLrkd3p7oF6L1WrUtuz6v"
  //     );
  const mintAddress = new PublicKey(
    "8otGo2J4Et8kXALWKU5QTd7aX2QMQ93BgX6H1MtZXw3z"
  );

  let tokenName;
  let tokenSymbol;
  let tokenLogo;

  const metadataAccount = metaplex
    .nfts()
    .pdas()
    .metadata({ mint: mintAddress });

  const metadataAccountInfo = await connection.getAccountInfo(metadataAccount);

  if (metadataAccountInfo) {
    const token = await metaplex
      .nfts()
      .findByMint({ mintAddress: mintAddress });
    tokenName = token.name;
    tokenSymbol = token.symbol;
    tokenLogo = token.json?.image;
    console.log("Token name img= ", tokenName);
    console.log("Token Symbol = ", tokenSymbol);
  } else {
    const provider = await new TokenListProvider().resolve();
    const tokenList = provider.filterByChainId(ENV.MainnetBeta).getList();
    console.log(tokenList);
    const tokenMap = tokenList.reduce((map, item) => {
      map.set(item.address, item);
      return map;
    }, new Map());

    const token = tokenMap.get(mintAddress.toBase58());

    tokenName = token.name;
    tokenSymbol = token.symbol;
    tokenLogo = token.logoURI;
    console.log("Token name URI = ", tokenName);
    console.log("Token Symbol = ", tokenSymbol);
  }
}

getTokenMetadata();
