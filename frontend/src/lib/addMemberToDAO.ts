import { daoShipContract } from "@/contracts/contract";
import { parseEther } from "viem";
import { avalancheFuji } from "viem/chains";

export const addMembersToDAO = async (
    writeContract: any,
    daoAddress: string,
    addresses: string[],
    githubUsernames: string[],
    userAddress: string
) => {
    // Validate input
    try {
        if (addresses.length !== githubUsernames.length) {
            throw new Error("Addresses and GitHub usernames arrays must have the same length");
        }

        if (addresses.length === 0) {
            throw new Error("At least one member must be provided");
        }

        return writeContract({
            address: daoAddress as `0x${string}`,
            abi: daoShipContract.abi,
            functionName: "addMembers",
            args: [addresses, githubUsernames],
            chain: avalancheFuji,
            account: userAddress
        });
    } catch (e) {
        console.log("error: ", e)
    }

};

export const disctributeTokenToMembers = async (
    writeContract: any,
    daoAddress: string,
    addresses: string[],
    amounts: number[],
    userAddress: string
) => {
    // Validate input
    if (addresses.length !== amounts.length) {
        throw new Error("Addresses and GitHub usernames arrays must have the same length");
    }

    if (addresses.length === 0) {
        throw new Error("At least one member must be provided");
    }

    let newAmounts = [];

    for (let i = 0; i < amounts.length; i++) {
        newAmounts[i] = parseEther(amounts[i].toString());
    }

    console.log("newAmounts: ", newAmounts);

    console.log("addresses: ", addresses);

    return writeContract({
        address: daoAddress as `0x${string}`,
        abi: daoShipContract.abi,
        functionName: "distributeTokens",
        args: [addresses, newAmounts],
        chain: avalancheFuji,
        account: userAddress
    });
};

