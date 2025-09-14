require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const daoRoutes = require("./routes/dao.routes");
const proposalRoutes = require("./routes/proposal.routes");
const userRoutes = require("./routes/user.routes");
const invitationRoutes = require("./routes/invitation.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(
    "mongodb+srv://vedantintiproject:Vedant1@cluster0.cndieto.mongodb.net/mydb?retryWrites=true&w=majority" ||
      "mongodb://localhost:27017/dao-creator",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  )
  .then(async () => {
    console.log("Connected to MongoDB");

    // Clean up old indexes that might cause conflicts
    try {
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();

      // Check if daos collection exists and clean up old daoId index
      const daosCollection = collections.find((col) => col.name === "daos");
      if (daosCollection) {
        try {
          const indexes = await db.collection("daos").indexes();
          const daoIdIndex = indexes.find((index) => index.name === "daoId_1");
          if (daoIdIndex) {
            await db.collection("daos").dropIndex("daoId_1");
            console.log("Dropped old daoId_1 index from daos collection");
          }
        } catch (indexError) {
          console.log("No old daoId index to clean up or already cleaned");
        }
      }
    } catch (cleanupError) {
      console.log("Index cleanup completed or not needed");
    }
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/dao", daoRoutes);
app.use("/api/proposal", proposalRoutes);
app.use("/api/user", userRoutes);
app.use("/api/invitations", invitationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
