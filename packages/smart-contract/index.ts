import NFTMarketPlaceArtifacts from "./artifacts/contracts/NFTMarketPlace.sol/NftMarketplace.json";
import * as WagmiGenerated from "./wagmi/generated";
import * as TypeChain from "./typechain-types/index";
import DeployedAddress31337 from "@/ignition/deployments/chain-31337/deployed_addresses.json";
const DeployedAddresses = {
  "31337": DeployedAddress31337,
};
export {
  NFTMarketPlaceArtifacts,
  TypeChain,
  DeployedAddresses,
  WagmiGenerated,
};
