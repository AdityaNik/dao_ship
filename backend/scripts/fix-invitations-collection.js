const mongoose = require("mongoose");

async function fixInvitationsCollection() {
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

    // 1. Check current indexes in invitations collection
    console.log("\n=== CHECKING INVITATIONS INDEXES ===");
    const indexes = await db.collection("invitations").indexes();
    console.log("Current indexes in invitations collection:");
    indexes.forEach((index) => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // 2. Check documents
    console.log("\n=== CHECKING INVITATION DOCUMENTS ===");
    const invitationCount = await db.collection("invitations").countDocuments();
    console.log(`Total invitations: ${invitationCount}`);

    // Check for documents with dao field (old schema)
    const invitationsWithDao = await db
      .collection("invitations")
      .find({ dao: { $exists: true } })
      .toArray();
    console.log(`Invitations with 'dao' field: ${invitationsWithDao.length}`);

    // Check for documents with daoId field (current schema)
    const invitationsWithDaoId = await db
      .collection("invitations")
      .find({ daoId: { $exists: true } })
      .toArray();
    console.log(`Invitations with 'daoId' field: ${invitationsWithDaoId.length}`);

    if (invitationsWithDao.length > 0) {
      console.log("Sample invitation with 'dao' field:", JSON.stringify(invitationsWithDao[0], null, 2));
    }

    // 3. Drop problematic indexes
    const problematicIndexes = indexes.filter(
      (index) => index.name.includes("dao_1") || (index.key && index.key.dao !== undefined),
    );

    for (const index of problematicIndexes) {
      try {
        await db.collection("invitations").dropIndex(index.name);
        console.log(`✅ Dropped problematic index: ${index.name}`);
      } catch (dropError) {
        console.log(`❌ Failed to drop index ${index.name}:`, dropError.message);
      }
    }

    // 4. Remove documents with dao field (keeping daoId ones)
    const deleteResult = await db.collection("invitations").deleteMany({ dao: { $exists: true } });
    console.log(`🗑️  Removed ${deleteResult.deletedCount} invitations with old 'dao' field`);

    // 5. Remove any null daoId documents
    const deleteNullResult = await db.collection("invitations").deleteMany({ daoId: null });
    console.log(`🗑️  Removed ${deleteNullResult.deletedCount} invitations with null daoId`);

    // 6. Show final state
    console.log("\n=== FINAL STATE ===");
    const finalIndexes = await db.collection("invitations").indexes();
    console.log("Final indexes:");
    finalIndexes.forEach((index) => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
    });

    const finalCount = await db.collection("invitations").countDocuments();
    console.log(`Final invitation count: ${finalCount}`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

fixInvitationsCollection();
