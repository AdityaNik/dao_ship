const mongoose = require("mongoose");

async function fixIndexes() {
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

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log(
      "All collections:",
      collections.map((col) => col.name),
    );

    // Check each collection for daoId indexes
    for (const collection of collections) {
      try {
        const indexes = await db.collection(collection.name).indexes();
        const daoIdIndexes = indexes.filter((index) => index.name.includes("daoId"));
        if (daoIdIndexes.length > 0) {
          console.log(
            `Found daoId indexes in ${collection.name}:`,
            daoIdIndexes.map((idx) => idx.name),
          );

          // If it's in the daos collection, try to drop it
          if (collection.name === "daos") {
            for (const index of daoIdIndexes) {
              try {
                await db.collection("daos").dropIndex(index.name);
                console.log(`✅ Dropped ${index.name} from daos collection`);
              } catch (dropError) {
                console.log(`❌ Could not drop ${index.name}:`, dropError.message);
              }
            }
          }
        }
      } catch (error) {
        console.log(`Could not check indexes for ${collection.name}:`, error.message);
      }
    }
  } catch (error) {
    console.error("Connection error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

fixIndexes();
