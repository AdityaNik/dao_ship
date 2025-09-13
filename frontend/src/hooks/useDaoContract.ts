import { useState, useEffect } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useReadContract,
} from "wagmi";
import { factoryContract } from "@/contracts/contract";
import { avalancheFuji } from "viem/chains";
import { decodeEventLog, keccak256, toHex } from "viem";

export function useCreateDAO() {
  const [daoAddress, setDaoAddress] = useState<string | null>(null);
  const [daoId, setDaoId] = useState<string | null>(null);

  const { address } = useAccount();
  const { writeContract, data: hash, error: writeError } = useWriteContract();
  const {
    data: receipt,
    isLoading,
    isSuccess,
    error: txError,
  } = useWaitForTransactionReceipt({ hash });

  // Only get DAO info when we have a DAO ID
  const { data: daoInfo } = useReadContract({
    address: factoryContract.address as `0x${string}`,
    abi: factoryContract.abi,
    functionName: "getDAO",
    args: daoId ? [BigInt(daoId)] : undefined,
    chainId: avalancheFuji.id,
    query: {
      enabled: !!daoId,
    },
  });

  // Parse transaction receipt for DAO deployment event
  useEffect(() => {
    if (isSuccess && receipt && receipt.logs) {
      try {
        // Find the DAODeployed event log
        for (const log of receipt.logs) {
          try {
            // Try to decode each log as a DAODeployed event
            const decodedLog = decodeEventLog({
              abi: factoryContract.abi,
              data: log.data,
              topics: log.topics,
            });

            if (decodedLog.eventName === "DAODeployed") {
              const { daoId: eventDaoId, dao: eventDaoAddress } = decodedLog.args as unknown as {
                daoId: bigint;
                dao: string;
                creator: string;
              };

              setDaoId(eventDaoId.toString());
              setDaoAddress(eventDaoAddress);
              return; // Exit once we find the event
            }
          } catch (decodeError) {
            // This log is not a DAODeployed event, continue to next log
            continue;
          }
        }
      } catch (error) {
        console.error("Error parsing transaction receipt:", error);
        
        // Fallback: If event parsing fails, try manual topic parsing
        try {
          // Calculate the keccak256 hash of the event signature
          const eventSignature = keccak256(toHex("DAODeployed(uint256,address,address)"));
          
          const eventLog = receipt.logs.find(log => log.topics[0] === eventSignature);
          
          if (eventLog && eventLog.topics.length >= 3) {
            // Parse the indexed parameters from topics
            const daoIdFromTopic = parseInt(eventLog.topics[1], 16).toString();
            const daoAddressFromTopic = `0x${eventLog.topics[2].slice(26)}`; // Remove padding
            
            setDaoId(daoIdFromTopic);
            setDaoAddress(daoAddressFromTopic);
          }
        } catch (fallbackError) {
          console.error("Fallback parsing also failed:", fallbackError);
        }
      }
    }
  }, [isSuccess, receipt]);

  // Extract DAO address from daoInfo as backup (in case event parsing fails)
  useEffect(() => {
    if (daoInfo && Array.isArray(daoInfo) && daoInfo.length >= 1 && !daoAddress) {
      setDaoAddress(daoInfo[0] as string);
    }
  }, [daoInfo, daoAddress]);

  // Function to trigger createDAO
  const createDAOCall = (
    projectName: string,
    githubRepo: string,
    tokenName: string,
    tokenSymbol: string,
    initialSupply: bigint
  ) => {
    // Reset state before creating new DAO
    setDaoAddress(null);
    setDaoId(null);

    writeContract({
        address: factoryContract.address as `0x${string}`,
        abi: factoryContract.abi,
        functionName: "createDAO",
        args: [projectName, githubRepo, tokenName, tokenSymbol, initialSupply],
        chain: avalancheFuji,
        account: address
    });
  };

  // Function to reset state (useful for cleanup)
  const resetState = () => {
    setDaoAddress(null);
    setDaoId(null);
  };

  return {
    createDAOCall,
    resetState,
    daoAddress,
    daoId,
    isLoading,
    isSuccess,
    error: writeError || txError,
  };
}