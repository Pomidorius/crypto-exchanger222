import { expect } from "chai";
import { BigNumber } from "ethers";
import hre from "hardhat";
const { ethers } = hre;

describe("ProxySwap integration", function() {
  let owner: any, user: any;
  let TokenA: any, TokenB: any;
  let tokenA: any, tokenB: any;
  let MockRouter: any, mockRouter: any;
  let ProxySwap: any, proxy: any;

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();

    // 1) Deploy two ERC20 mocks
    TokenA = await ethers.getContractFactory("MockERC20");
    tokenA = await TokenA.connect(owner).deploy("TokenA", "TKA");
    await tokenA.deployed();

    TokenB = await ethers.getContractFactory("MockERC20");
    tokenB = await TokenB.connect(owner).deploy("TokenB", "TKB");
    await tokenB.deployed();

    // 2) Deploy MockRouter with fixedOut = 1_000 units
    MockRouter = await ethers.getContractFactory("MockRouter");
    mockRouter = await MockRouter.connect(owner).deploy(BigNumber.from("1000"));
    await mockRouter.deployed();

    // 3) Deploy ProxySwap, passing mockRouter address
    ProxySwap = await ethers.getContractFactory("ProxySwap");
    proxy = await ProxySwap.connect(owner).deploy(mockRouter.address);
    await proxy.deployed();

    // 4) Mint some TokenA to user and give allowance
    await tokenA.connect(owner).mint(user.address, ethers.utils.parseUnits("100", 18));
    await tokenA.connect(user).approve(proxy.address, ethers.utils.parseUnits("100", 18));
    // Also mint TokenB to mockRouter so it can transfer
    await tokenB.connect(owner).mint(mockRouter.address, BigNumber.from("1000"));
  });

  it("should take 0.1% fee and swap correctly", async function() {
    // user does swapExactInputSingle: 10 TKA
    const amountIn = ethers.utils.parseUnits("10", 18); // 10 * 1e18
    const expectedFee = amountIn.mul(10).div(10000);    // 0.1% of 10
    const amountAfterFee = amountIn.sub(expectedFee);

    // initial balances
    const userBalBefore  = await tokenA.balanceOf(user.address);
    const ownerBalBefore = await tokenA.balanceOf(owner.address);
    const outBalBefore   = await tokenB.balanceOf(user.address);

    // perform swap
    await proxy.connect(user).swapExactInputSingle(
      tokenA.address,
      tokenB.address,
      amountIn,
      0 // no minOutMinimum check
    );

    // user TKA deducted full amountIn
    const userBalAfter = await tokenA.balanceOf(user.address);
    expect(
      userBalAfter.eq(userBalBefore.sub(amountIn)),
      `Expected user balance ${userBalAfter.toString()} to equal ${userBalBefore.sub(amountIn).toString()}`
    ).to.be.true;

    // owner (deployer) got fee expectedFee
    const ownerBalAfter = await tokenA.balanceOf(owner.address);

    // debugging output
    console.log("ownerBalAfter:", ownerBalAfter.toString());
    console.log("expectedFee  :", expectedFee.toString());

    // owner had zero before
    expect(
      ownerBalBefore.eq(0),
      `Expected owner initial balance 0, got ${ownerBalBefore.toString()}`
    ).to.be.true;

    // and equals expectedFee now
    expect(
      ownerBalAfter.eq(expectedFee),
      `Expected owner to receive fee ${expectedFee.toString()}, got ${ownerBalAfter.toString()}`
    ).to.be.true;

    // user received exactly fixedOut (1000) TKB
    const outBalAfter = await tokenB.balanceOf(user.address);
    const expectedOut = BigNumber.from("1000");
    expect(
      outBalAfter.eq(outBalBefore.add(expectedOut)),
      `Expected user to receive ${expectedOut.toString()} tokens, got ${outBalAfter
        .sub(outBalBefore)
        .toString()}`
    ).to.be.true;
  });
});
