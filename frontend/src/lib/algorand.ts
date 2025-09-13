import algosdk from "algosdk";

const algodServer = "http://localhost:4001";
const algodToken =
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const algodClient = new algosdk.Algodv2(algodToken, algodServer);

export const createDAO = async (
  name: string,
  description: string,
  votingPeriod: number,
  quorum: number,
  creatorMnemonic: string
) => {
  try {
    const creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
    const params = await algodClient.getTransactionParams().do();

    // Create the application call transaction
    const txn = algosdk.makeApplicationCreateTxnFromObject({
      from: creatorAccount.addr,
      suggestedParams: params,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      approvalProgram: new Uint8Array(0), // This will be replaced with the actual program
      clearProgram: new Uint8Array(0), // This will be replaced with the actual program
      numGlobalByteSlices: 1,
      numGlobalInts: 4,
      numLocalByteSlices: 2,
      numLocalInts: 7,
      appArgs: [
        new Uint8Array(Buffer.from("create_dao")),
        new Uint8Array(Buffer.from(name)),
        new Uint8Array(Buffer.from(description)),
        new Uint8Array(Buffer.from(votingPeriod.toString())),
        new Uint8Array(Buffer.from(quorum.toString())),
      ],
    });

    // Sign the transaction
    const signedTxn = txn.signTxn(creatorAccount.sk);

    // Submit the transaction
    const txId = await algodClient.sendRawTransaction(signedTxn).do();

    // Wait for confirmation
    const result = await algosdk.waitForConfirmation(algodClient, txId, 5);

    return result["application-index"];
  } catch (error) {
    console.error("Error creating DAO:", error);
    throw error;
  }
};

export const createProposal = async (
  appId: number,
  title: string,
  description: string,
  creatorMnemonic: string
) => {
  try {
    const creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
    const params = await algodClient.getTransactionParams().do();

    const txn = algosdk.makeApplicationCallTxnFromObject({
      from: creatorAccount.addr,
      appIndex: appId,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      suggestedParams: params,
      appArgs: [
        new Uint8Array(Buffer.from("create_proposal")),
        new Uint8Array(Buffer.from(title)),
        new Uint8Array(Buffer.from(description)),
      ],
    });

    const signedTxn = txn.signTxn(creatorAccount.sk);
    const txId = await algodClient.sendRawTransaction(signedTxn).do();
    return await algosdk.waitForConfirmation(algodClient, txId, 5);
  } catch (error) {
    console.error("Error creating proposal:", error);
    throw error;
  }
};

export const voteOnProposal = async (
  appId: number,
  proposalId: number,
  vote: "yes" | "no" | "abstain",
  voterMnemonic: string
) => {
  try {
    const voterAccount = algosdk.mnemonicToSecretKey(voterMnemonic);
    const params = await algodClient.getTransactionParams().do();

    const txn = algosdk.makeApplicationCallTxnFromObject({
      from: voterAccount.addr,
      appIndex: appId,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      suggestedParams: params,
      appArgs: [
        new Uint8Array(Buffer.from("vote")),
        new Uint8Array(Buffer.from(vote)),
      ],
    });

    const signedTxn = txn.signTxn(voterAccount.sk);
    const txId = await algodClient.sendRawTransaction(signedTxn).do();
    return await algosdk.waitForConfirmation(algodClient, txId, 5);
  } catch (error) {
    console.error("Error voting on proposal:", error);
    throw error;
  }
};
