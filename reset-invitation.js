// Reset a declined invitation to pending for testing
const API_URL = "http://localhost:3000/api";

async function resetInvitationToPending() {
  try {
    // Reset the vedantbanaitkar invitation to pending
    const invitationId = "68c5e26c27ba8319d9a302e6"; // vedantbanaitkar's invitation

    console.log(`Resetting invitation ${invitationId} to pending...`);

    const response = await fetch(`${API_URL}/invitations/${invitationId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "pending",
      }),
    });

    const result = await response.json();
    console.log("Reset result:", result);

    if (response.ok) {
      console.log("✅ Successfully reset invitation to pending");
      return result;
    } else {
      console.log("❌ Failed to reset invitation");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

resetInvitationToPending();
