import hre from "hardhat";
import NFTMarketPlaceProduction from "@/ignition/modules/NFTMarketPlaceProduction";

async function main() {
  const chainId = (await hre.ethers.provider.getNetwork()).chainId;
  console.log("the chainid is", chainId);
  let weth_address = process.env.SEPOLIA_WETH_ADDRESS!;
  if (chainId === 84532n) {
    weth_address = process.env.BASE_SEPOLIA_WETH_ADDRESS!;
  }
  console.log("using weth address", weth_address);
  const { NFTMarketPlace } = await hre.ignition.deploy(
    NFTMarketPlaceProduction,
    {
      parameters: {
        NFTMarketPlaceProduction: {
          weth_address,
        },
      },
    }
  );
  await hre.run("verify:verify", {
    address: await NFTMarketPlace.getAddress(),
    constructorArguments: [weth_address],
  });

  // or `apollo.getAddress()` if you're using Ethers.js
  console.log(
    `NFT Marketplace deployed to: ${await NFTMarketPlace.getAddress()}`
  );
}

main().catch(console.error);
