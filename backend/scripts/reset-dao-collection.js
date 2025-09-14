const mongoose = require("mongoose");

async function resetDaoCollection() {
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

    // List current DAOs for backup info
    const currentDaos = await db.collection("daos").find({}).toArray();
    console.log(`Current DAOs count: ${currentDaos.length}`);
    if (currentDaos.length > 0) {
      console.log(
        "Current DAOs:",
        currentDaos.map((dao) => ({ name: dao.name, creator: dao.creator })),
      );
    }

    // Drop the entire daos collection to remove any problematic indexes
    try {
      await db.collection("daos").drop();
      console.log("✅ Successfully dropped daos collection");
    } catch (dropError) {
      if (dropError.message.includes("ns not found")) {
        console.log("ℹ️  Collection doesn't exist, nothing to drop");
      } else {
        console.log("❌ Error dropping collection:", dropError.message);
      }
    }

    // Verify collection is gone
    const collections = await db.listCollections({ name: "daos" }).toArray();
    console.log(`DAOs collection exists after drop: ${collections.length > 0}`);

    console.log("✅ Collection reset complete. The DAO model will recreate it with correct schema on next save.");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

resetDaoCollection();
