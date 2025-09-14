// Check DAO members after acceptance
const API_URL = "http://localhost:3000/api";

async function checkDAOAfterAcceptance() {
  try {
    console.log("Checking DAO members after invitation acceptance...");
    const daoResponse = await fetch(`${API_URL}/dao/68c5e26c27ba8319d9a302e2`);
    const dao = await daoResponse.json();

    console.log("DAO members:", dao.members);
    console.log("Number of members:", dao.members.length);

    dao.members.forEach((member, index) => {
      console.log(`Member ${index + 1}:`, {
        username: member.username || "No username",
        walletAddress: member.walletAddress || "No wallet address",
        type: typeof member,
      });
    });

    // Check invitations for this DAO
    console.log("\nChecking DAO invitations...");
    const invitationsResponse = await fetch(`${API_URL}/dao/68c5e26c27ba8319d9a302e2/invitations`);
    const invitations = await invitationsResponse.json();

    console.log("DAO invitations:");
    invitations.forEach((inv, index) => {
      console.log(
        `${index + 1}. User: ${inv.githubUsername}, Status: ${inv.status}, Responded: ${inv.respondedAt || "N/A"}`,
      );
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

checkDAOAfterAcceptance();
