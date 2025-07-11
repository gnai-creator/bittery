import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("Bittery", function () {
  async function deployFixture() {
    const [owner, user] = await ethers.getSigners();
    const Lottery = await ethers.getContractFactory("Bittery");
    const lottery = (await Lottery.deploy(
      owner.address,
      0,
      ethers.ZeroHash,
      owner.address
    )) as any;
    await lottery.waitForDeployment();
    await lottery.createRoom(ethers.parseEther("0.01"), 2);
    return { lottery, owner, user };
  }

  it("should allow ticket purchase", async function () {
    const { lottery, user, owner } = await loadFixture(deployFixture);
    await expect(
      lottery.connect(user).buyTicket(0, ethers.ZeroAddress, {
        value: ethers.parseEther("0.01"),
      })
    ).to.changeEtherBalances(
      [user, lottery, owner],
      [
        ethers.parseEther("-0.01"),
        ethers.parseEther("0.0095"),
        ethers.parseEther("0.0005"),
      ]
    );
  });

  it("owner can update fee percent", async function () {
    const { lottery, owner } = await loadFixture(deployFixture);
    await lottery.connect(owner).setFeePercent(10);
    expect(await lottery.feePercent()).to.equal(10);
  });

  it("non-owner cannot update fee percent", async function () {
    const { lottery, user } = await loadFixture(deployFixture);
    await expect(lottery.connect(user).setFeePercent(10)).to.be.revertedWith(
      "Only callable by owner"
    );
  });

  it("owner can update fee recipient", async function () {
    const { lottery, owner } = await loadFixture(deployFixture);
    const newRecipient = owner.address;
    await lottery.connect(owner).setFeeRecipient(newRecipient);
    expect(await lottery.feeRecipient()).to.equal(newRecipient);
  });
});
