const { expect } = require("chai");
const { ethers } = require("hardhat");
const keccak256 = require("keccak256");
const { MerkleTree } = require("merkletreejs");

function encodeLeaf(address, spots) {
  return ethers.utils.defaultAbiCoder.encode(
    ["address", "uint64"],
    [address, spots]
  );
}

describe("Check if merkle root is working or not", () => {
  it("Should confirm if an address given is in whitelist or not", async () => {
    const [ownerAddress, address1, address2, address3, address4, address5] =
      await ethers.getSigners();

    const encodedAddresslist = [
      encodeLeaf(ownerAddress.address, 2),
      encodeLeaf(address1.address, 2),
      encodeLeaf(address2.address, 2),
      encodeLeaf(address3.address, 2),
      encodeLeaf(address4.address, 2),
      encodeLeaf(address5.address, 2),
    ];

    const merkleTree = new MerkleTree(encodedAddresslist, keccak256, {
      hashLeaves: true,
      sortPairs: true,
    });

    const root = merkleTree.getHexRoot();

    const whitelist = await ethers.getContractFactory("Whitelist");
    const Whitelist = await whitelist.deploy(root);
    await Whitelist.deployed();
    console.log("Whitelist Contract Address is", Whitelist.address);

    const leaf = keccak256(encodedAddresslist[0]);
    const proof = merkleTree.getHexProof(leaf);

    let verified = await Whitelist.checkInWhitelist(proof, 2);
    expect(verified).to.equal(true);

    verified = await Whitelist.checkInWhitelist([], 2);
    expect(verified).to.equal(false);
  });
});
