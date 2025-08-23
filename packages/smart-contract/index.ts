import NFTMarketPlaceArtifacts from "./artifacts/contracts/NFTMarketPlace.sol/NftMarketplace.json";
import * as TypeChain from "./typechain-types/index";
import DeployedAddress31337 from "@/ignition/deployments/chain-31337/deployed_addresses.json";
import DeployedAddress11155111 from "@/ignition/deployments/chain-11155111/deployed_addresses.json";
import DeployedAddress84532 from "@/ignition/deployments/chain-84532/deployed_addresses.json";
const DeployedAddresses = {
  "31337": DeployedAddress31337,
  "11155111": DeployedAddress11155111,
  "84532": DeployedAddress84532
};
export { NFTMarketPlaceArtifacts, TypeChain, DeployedAddresses };
