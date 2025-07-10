import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat"; const { ethers } = hre;

describe("DecentralizedLottery", function () {
  async function deployFixture() {
    const [owner, user] = await ethers.getSigners();
    const Lottery = await ethers.getContractFactory("DecentralizedLottery");
    const lottery = await Lottery.deploy(
      ethers.ZeroAddress,
      0,
      ethers.ZeroHash
    );
    await lottery.waitForDeployment();
    return { lottery, owner, user };
  }

  it("should allow ticket purchase", async function () {
    const { lottery, user } = await loadFixture(deployFixture);
    await expect(
      lottery.connect(user).buyTicket({ value: ethers.parseEther("0.01") })
    ).to.changeEtherBalances([
      user,
      lottery,
    ], [
      ethers.parseEther("-0.01"),
      ethers.parseEther("0.01"),
    ]);
  });
});
