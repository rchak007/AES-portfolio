import { Metaplex } from "@metaplex-foundation/js";
import { Connection, PublicKey } from "@solana/web3.js";

async function getTokenMetadata() {
  const connection = new Connection("https://api.mainnet-beta.solana.com");
  const metaplex = Metaplex.make(connection);

  const mintAddress = new PublicKey(
    "2BeGjx5eYHbGqT2kUZ7K3TvsNGBc65xvorcMqL6kgefQ"
  );

  let tokenName;
  let tokenSymbol;
  //   let tokenLogo;

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
    console.log("Token name = ", tokenName);
    tokenSymbol = token.symbol;
    console.log("Token Symbol = ", tokenSymbol);
    // tokenLogo = token.json.image;
  }
}

getTokenMetadata();
