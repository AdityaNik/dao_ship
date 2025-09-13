// Check what databases exist
const { MongoClient } = require("mongodb");

async function checkDatabases() {
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();

    console.log("Available databases:");
    dbs.databases.forEach((db) => {
      console.log(`- ${db.name}`);
    });

    // Try common database names
    const dbNames = ["dao-backend", "daoship", "test", "daoship-avax"];

    for (const dbName of dbNames) {
      const db = client.db(dbName);
      const collections = await db.listCollections().toArray();
      if (collections.length > 0) {
        console.log(`\nDatabase '${dbName}' has collections:`);
        collections.forEach((col) => {
          console.log(`- ${col.name}`);
        });

        // Check if it has DAOs
        if (collections.some((col) => col.name === "daos")) {
          const daosCollection = db.collection("daos");
          const count = await daosCollection.countDocuments();
          console.log(`Found ${count} DAOs in '${dbName}' database`);
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

checkDatabases();
