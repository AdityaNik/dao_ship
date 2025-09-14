const mongoose = require("mongoose");

async function debugAndFixDaoCollection() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      "mongodb+srv://vedantintiproject:Vedant1@cluster0.cndieto.mongodb.net/mydb?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    );

    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;

    // 1. Check current indexes in daos collection
    console.log("\n=== CHECKING INDEXES ===");
    const indexes = await db.collection("daos").indexes();
    console.log("Current indexes in daos collection:");
    indexes.forEach((index) => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // 2. Check if any documents have daoId field
    console.log("\n=== CHECKING DOCUMENTS ===");
    const daoCount = await db.collection("daos").countDocuments();
    console.log(`Total DAOs: ${daoCount}`);

    const daosWithDaoId = await db
      .collection("daos")
      .find({ daoId: { $exists: true } })
      .toArray();
    console.log(`DAOs with daoId field: ${daosWithDaoId.length}`);

    if (daosWithDaoId.length > 0) {
      console.log("Sample DAO with daoId:", JSON.stringify(daosWithDaoId[0], null, 2));
    }

    // 3. Check for any unique indexes on daoId
    const daoIdIndex = indexes.find((index) => index.name === "daoId_1" || JSON.stringify(index.key).includes("daoId"));
    if (daoIdIndex) {
      console.log("\n=== FOUND PROBLEMATIC INDEX ===");
      console.log("daoId index:", JSON.stringify(daoIdIndex, null, 2));

      try {
        await db.collection("daos").dropIndex(daoIdIndex.name);
        console.log(`✅ Successfully dropped ${daoIdIndex.name}`);
      } catch (dropError) {
        console.log(`❌ Failed to drop ${daoIdIndex.name}:`, dropError.message);
      }
    }

    // 4. Remove daoId field from all documents
    console.log("\n=== CLEANING UP DOCUMENTS ===");
    const result = await db.collection("daos").updateMany({ daoId: { $exists: true } }, { $unset: { daoId: "" } });
    console.log(`Removed daoId field from ${result.modifiedCount} documents`);

    // 5. Show final state
    console.log("\n=== FINAL STATE ===");
    const finalIndexes = await db.collection("daos").indexes();
    console.log("Final indexes:");
    finalIndexes.forEach((index) => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
    });

    const finalDaosWithDaoId = await db.collection("daos").countDocuments({ daoId: { $exists: true } });
    console.log(`DAOs with daoId field after cleanup: ${finalDaosWithDaoId}`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

debugAndFixDaoCollection();
