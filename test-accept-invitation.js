// Test accepting the pending invitation
const API_URL = "http://localhost:3000/api";

async function testAcceptInvitation() {
  try {
    // Use the invitation ID we found earlier
    const invitationId = "68c5e26c27ba8319d9a302e5";

    console.log(`Attempting to accept invitation ${invitationId}...`);

    const acceptResponse = await fetch(`${API_URL}/invitations/${invitationId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "accepted",
        walletAddress: "0x9876543210987654321098765432109876543210",
      }),
    });

    const result = await acceptResponse.json();
    console.log("Accept result:", result);

    if (acceptResponse.ok) {
      console.log("\n✅ Invitation accepted successfully!");

      // Check the DAO members after acceptance
      console.log("\nChecking DAO members after acceptance...");
      const daoResponse = await fetch(`${API_URL}/dao/68c5e26c27ba8319d9a302e2`);
      const dao = await daoResponse.json();
      console.log("DAO members after acceptance:", dao.members);

      // Check invitations for this DAO
      console.log("\nChecking DAO invitations...");
      const invitationsResponse = await fetch(`${API_URL}/dao/68c5e26c27ba8319d9a302e2/invitations`);
      const invitations = await invitationsResponse.json();
      console.log(
        "DAO invitations:",
        invitations.map((inv) => ({
          user: inv.githubUsername,
          status: inv.status,
        })),
      );
    } else {
      console.log("❌ Failed to accept invitation:", result);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

testAcceptInvitation();
