// Script to migrate existing DAO data to the new member format
const API_URL = "http://localhost:3000/api";

async function migrateDAOMembers() {
  try {
    console.log("Getting DAO to check members format...");
    const daoResponse = await fetch(`${API_URL}/dao/68c5e26c27ba8319d9a302e2`);
    const dao = await daoResponse.json();

    console.log("Current DAO members:", dao.members);

    // Check if members need migration (if they're strings instead of objects)
    if (dao.members.length > 0 && typeof dao.members[0] === "string") {
      console.log("Members need migration from string to object format");
      // For now, we'll just test with the pending invitation
    } else if (dao.members.length > 0 && typeof dao.members[0] === "object" && !dao.members[0].walletAddress) {
      console.log("Members are stored as weird object format, need fix");
    } else {
      console.log("Members are in correct format:", dao.members);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

migrateDAOMembers();
