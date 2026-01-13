const hre = require("hardhat");

async function main() {
  console.log("Deploying VerdictSettlement to Shardeum Sphinx...");

  const VerdictSettlement = await hre.ethers.getContractFactory("VerdictSettlement");
  const verdict = await VerdictSettlement.deploy();

  await verdict.waitForDeployment();

  const address = await verdict.getAddress();
  console.log("VerdictSettlement deployed to:", address);
  console.log("Network: Shardeum Sphinx (chainId 8082)");
  console.log("Explorer: https://explorer-sphinx.shardeum.org/address/" + address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

