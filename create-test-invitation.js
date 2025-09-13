// Create a new test invitation
const API_URL = "http://localhost:3000/api";

async function createTestInvitation() {
  try {
    console.log("Creating a new test invitation...");

    // Create invitation for a test user
    const invitationData = {
      daoId: "68c5e26c27ba8319d9a302e2", // Using the existing DAO
      githubUsername: "testuser123",
      invitedBy: "0xDff20D32755F58902B9F5cE05C8Cb7CFA64e5Bf3",
      status: "pending",
    };

    const response = await fetch(`${API_URL}/invitations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invitationData),
    });

    if (response.ok) {
      const invitation = await response.json();
      console.log("Created invitation:", invitation);
      return invitation;
    } else {
      const error = await response.text();
      console.log("Failed to create invitation:", error);

      // If POST doesn't exist, try creating manually in database by checking existing invitations
      console.log("POST endpoint might not exist. Let's manually reset an existing invitation...");

      // Get all invitations
      const getResponse = await fetch(`${API_URL}/invitations`);
      const invitations = await getResponse.json();

      // Find a declined invitation to reset
      const declinedInvitation = invitations.find((inv) => inv.status === "declined");
      if (declinedInvitation) {
        console.log("Found declined invitation to reset:", declinedInvitation._id);

        // Reset it to pending
        const resetResponse = await fetch(`${API_URL}/invitations/${declinedInvitation._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "pending",
          }),
        });

        if (resetResponse.ok) {
          const resetInvitation = await resetResponse.json();
          console.log("Reset invitation to pending:", resetInvitation);
          return resetInvitation;
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

createTestInvitation();
