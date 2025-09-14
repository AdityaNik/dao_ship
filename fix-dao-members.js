// Direct MongoDB connection to fix the members data
const { MongoClient } = require("mongodb");

async function fixDAOMembers() {
  const uri = "mongodb://localhost:27017"; // Default MongoDB connection
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("daoship"); // Assuming database name is 'daoship'
    const daosCollection = db.collection("daos");

    // Find all DAOs
    const daos = await daosCollection.find({}).toArray();
    console.log(`Found ${daos.length} DAOs`);

    for (const dao of daos) {
      console.log(`\nDAO: ${dao.name}`);
      console.log("Current members:", dao.members);

      // Convert string members to proper format
      const newMembers = [];

      if (dao.members && Array.isArray(dao.members)) {
        for (const member of dao.members) {
          if (typeof member === "string") {
            newMembers.push({ walletAddress: member });
          } else if (member && typeof member === "object") {
            // Check if it's the weird object format
            if (member["0"] && member["1"] && !member.walletAddress) {
              // Reconstruct the string from the object
              const keys = Object.keys(member)
                .filter((key) => !isNaN(key))
                .sort((a, b) => parseInt(a) - parseInt(b));
              const walletAddress = keys.map((key) => member[key]).join("");
              newMembers.push({ walletAddress });
            } else if (member.walletAddress) {
              // Already in correct format
              newMembers.push(member);
            }
          }
        }
      }

      // If creator exists and not in members, add them
      if (dao.creator && !newMembers.find((m) => m.walletAddress === dao.creator)) {
        newMembers.unshift({ walletAddress: dao.creator });
      }

      console.log("New members format:", newMembers);

      // Update the DAO
      await daosCollection.updateOne({ _id: dao._id }, { $set: { members: newMembers } });

      console.log("Updated DAO members");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

fixDAOMembers();
