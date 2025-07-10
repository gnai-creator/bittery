import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("Bittery", function () {
  const FEE_RECIPIENT = "0x9EA7EbEb25192B6d7e8e240A852e7EC56D4FB865";
  async function deployFixture() {
    const [owner, user] = await ethers.getSigners();
    const Lottery = await ethers.getContractFactory("Bittery");
    const lottery = (await Lottery.deploy(
      ethers.ZeroAddress,
      0,
      ethers.ZeroHash
    )) as any;
    await lottery.waitForDeployment();
    return { lottery, owner, user };
  }

  it("should allow ticket purchase", async function () {
    const { lottery, user } = await loadFixture(deployFixture);
    await expect(
      lottery.connect(user).buyTicket({ value: ethers.parseEther("0.01") })
    ).to.changeEtherBalances(
      [user, lottery, FEE_RECIPIENT],
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
      "Not owner"
    );
  });

  it("owner can update fee recipient", async function () {
    const { lottery, owner } = await loadFixture(deployFixture);
    const newRecipient = owner.address;
    await lottery.connect(owner).setFeeRecipient(newRecipient);
    expect(await lottery.feeRecipient()).to.equal(newRecipient);
  });
});
