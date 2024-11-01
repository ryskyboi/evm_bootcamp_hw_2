import { viem } from "hardhat";
import { toHex, hexToString, formatEther } from "viem";

const address: `0x${string}` = "0x20d9CDe75E37F114f2c821758297AA9667D3bE14";
const ab_eth_address: `0x${string}` = "0x6d57b739729f83A20D5B38572926BaA53b0F4e97";

async function main() {
    const publicClient = await viem.getPublicClient();
    const blockNumber = await publicClient.getBlockNumber();
    console.log("Last block number:", blockNumber);
    const [myWallet] = await viem.getWalletClients();
    const ballotContract = await viem.getContractAt("Ballot", address);
    console.log("Getting Proposals: ");
    for (let index = 0; index <  3; index++) {
        const proposal = await ballotContract.read.proposals([BigInt(index)]) as [`0x${string}`];
        const name = hexToString(proposal[0], { size: 32 });
        console.log({ index, name, proposal });
      }
    console.log("Querying for the Chairperson: ");
    const chairperson = await ballotContract.read.chairperson();
    console.log(`The Chairperson is ${ chairperson } `);
    const winningProposalhex = await ballotContract.read.winnerName()  as `0x${string}`;
    const winningProposal = hexToString(winningProposalhex, { size: 32 });
    console.log(`The current winning proposal is ${winningProposal}`);
    console.log("Trying to give right to vote to my wallet");
    try {
        await ballotContract.write.giveRightToVote([myWallet.account.address]);
    } catch (error) {
        console.error("Transaction reverted:", error);
    }
    console.log("Delegating my vote to ab.eth:");
    const tx = await ballotContract.write.delegate([ab_eth_address]);
    console.log("Transaction hash:", tx);
    console.log("Now Trying to vote");
    try {
        await ballotContract.write.vote([BigInt(0)]);
    } catch (error) {
        console.error("Transaction reverted:", error);
    }
    console.log("Querying for the winner again: ");
    const winningProposalhex2 = await ballotContract.read.winnerName() as `0x${string}`;
    const winningProposal2 = hexToString(winningProposalhex2, { size: 32 });
    console.log(`The current winning proposal is still ${winningProposal2}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });