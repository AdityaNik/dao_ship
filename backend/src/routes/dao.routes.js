const express = require("express");
const router = express.Router();
const DAO = require("../models/DAO");
const Proposal = require("../models/Proposal");
const Invitation = require("../models/Invitation");
const { deployDAOContract } = require("../services/algorand.service");

// Create a new DAO
// router.post("/", async (req, res) => {
//   try {
//     const { name, description, creator, votingPeriod, quorum } = req.body;

//     // Deploy DAO contract using AlgoKit
//     const contractAddress = await deployDAOContract({
//       name,
//       votingPeriod,
//       quorum,
//     });
//     // const contractAddress = "dummy-algo-address";

//     console.log("Received DAO create request with:", req.body);

//     const dao = new DAO({
//       name,
//       description,
//       creator,
//       contractAddress,
//       votingPeriod,
//       quorum,
//       members: [creator],
//     });

//     await dao.save();
//     res.status(201).json(dao);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

router.post("/", async (req, res) => {
  try {
    const {
      name,
      description,
      manager, // Changed from 'creator' to 'manager'
      votePrice,
      tokenName,
      contractAddress,
      tokenSymbol,
      tokenSupply,
      votingPeriod,
      quorum,
      minTokens,
      githubRepo,
      tokenStrategy,
      initialDistribution,
      tokenAllocation,
      contributionRewards,
      vestingPeriod,
      minContributionForVoting,
      invitedCollaborators,
      members,
    } = req.body;

    console.log("Creating DAO with parameters:", {
      name,
      description,
      manager,
      votePrice,
      contractAddress,
    });

    // Generate a unique contract address if placeholder is used
    let finalContractAddress = contractAddress;
    if (contractAddress === "0xPlaceholderContractAddress") {
      // Generate a unique placeholder using timestamp and random string
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      finalContractAddress = `0xPlaceholder_${timestamp}_${random}`;
      console.log("Generated unique contract address:", finalContractAddress);
    }

    const dao = new DAO({
      name,
      description,
      creator: manager, // Map manager to creator if your DAO model uses 'creator'
      manager, // Add manager field if your model supports it
      contractAddress: finalContractAddress,
      votePrice,
      tokenName,
      tokenSymbol,
      tokenSupply,
      votingPeriod,
      quorum,
      minTokens,
      githubRepo,
      tokenStrategy,
      initialDistribution,
      tokenAllocation,
      contributionRewards,
      vestingPeriod,
      minContributionForVoting,
      invitedCollaborators: invitedCollaborators || [], // Handle array of collaborators
      members: members || [{ walletAddress: manager }], // Use provided members array or default to
    });
    console.log("DAO object to be saved:", dao);
    const savedDao = await dao.save();
    console.log("DAO created with ID:", savedDao._id);

    // Debug: Check invitedCollaborators data
    console.log("Debug - invitedCollaborators:", {
      raw: invitedCollaborators,
      type: typeof invitedCollaborators,
      isArray: Array.isArray(invitedCollaborators),
      length: invitedCollaborators?.length,
    });

    // Create invitations for all invited collaborators
    if (invitedCollaborators && invitedCollaborators.length > 0) {
      try {
        // Remove duplicates from invitedCollaborators array
        const uniqueCollaborators = [...new Set(invitedCollaborators)];
        console.log("Unique collaborators to invite:", uniqueCollaborators);

        const invitations = uniqueCollaborators.map((githubUsername) => ({
          daoId: savedDao._id,
          githubUsername: githubUsername,
          invitedBy: manager,
          status: "pending",
        }));

        console.log("Invitations to create:", invitations);

        await Invitation.insertMany(invitations, { ordered: false });
        console.log(`✅ Created ${invitations.length} invitations for DAO ${savedDao._id}`);
      } catch (invitationError) {
        console.error("❌ Error creating invitations:", invitationError);
        // Don't fail the DAO creation if invitations fail
        // You might want to log this for monitoring
      }
    } else {
      console.log("ℹ️  No collaborators to invite or invitedCollaborators is empty/undefined");
    }

    res.status(201).json(savedDao);
  } catch (error) {
    console.error("Error creating DAO:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get all DAOs
router.get("/", async (req, res) => {
  try {
    const daos = await DAO.find().populate("creator", "username walletAddress");
    res.json(daos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific DAO
router.get("/:id", async (req, res) => {
  console.log("Fetching DAO with ID:", req.params.id);
  try {
    const dao = await DAO.findById(req.params.id);
    if (!dao) {
      return res.status(404).json({ message: "DAO not found" });
    }
    res.json(dao);
    console.log("Fetched DAO:", dao);
  } catch (error) {
    console.error("Error fetching DAO:", error);
    res.status(500).json({ message: error.message });
  }
});

// Add the new route that matches the frontend API call pattern
router.post("/:daoId/proposals", async (req, res) => {
  try {
    const { daoId } = req.params;
    const { title, description, creator, startTime, endTime } = req.body;

    // Fetch the DAO to get its contract address
    const dao = await DAO.findById(daoId);
    if (!dao) {
      return res.status(404).json({ message: "DAO not found" });
    }

    console.log("Creating proposal for DAO via DAO route:", {
      daoId,
      contractAddress: dao.contractAddress,
      title,
      creator,
    });

    // Create proposal on Algorand
    // const proposalId = await createProposal({
    //   dao: daoId,
    //   contractAddress: dao.contractAddress,
    //   title,
    //   description,
    //   startTime,
    //   endTime,
    // });

    // Option 1: Generate a temporary proposalId (until Algorand implementation is ready)
    const proposalId = `proposal-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const proposal = new Proposal({
      title,
      description,
      dao: daoId,
      contractAddress: dao.contractAddress,
      creator,
      startTime,
      endTime,
      proposalId,
    });

    await proposal.save();
    console.log("Proposal created via DAO route:", proposal._id);
    res.status(201).json(proposal);
  } catch (error) {
    console.error("Error creating proposal via DAO route:", error);
    res.status(500).json({ message: error.message });
  }
});

// In your dao.routes.js

// Get all proposals for a specific DAO
router.get("/:id/proposals", async (req, res) => {
  console.log("Fetching proposals for DAO ID:", req.params.id);
  try {
    const daoId = req.params.id;
    console.log(`Fetching proposals for DAO ID: ${daoId}`);
    const proposals = await Proposal.find({ dao: daoId })
      .populate("creator", "username walletAddress")
      .sort({ createdAt: -1 });

    if (!proposals) {
      return res.status(404).json({ message: "No proposals found for this DAO" });
    }

    res.json(proposals);
  } catch (error) {
    console.error("Error fetching proposals:", error);
    res.status(500).json({ message: error.message });
  }
});

// Join a DAO
router.post("/:id/join", async (req, res) => {
  try {
    const { userId } = req.body;
    const dao = await DAO.findById(req.params.id);

    if (!dao) {
      return res.status(404).json({ message: "DAO not found" });
    }

    if (dao.members.includes(userId)) {
      return res.status(400).json({ message: "Already a member" });
    }

    dao.members.push(userId);
    await dao.save();
    res.json(dao);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get invitations for a specific DAO
router.get("/:id/invitations", async (req, res) => {
  try {
    const invitations = await Invitation.find({ daoId: req.params.id })
      .populate("daoId", "name description")
      .sort({ invitedAt: -1 });

    res.json(invitations);
  } catch (error) {
    console.error("Error fetching invitations:", error);
    res.status(500).json({ message: error.message });
  }
});

// Accept or decline an invitation
router.patch("/:daoId/invitations/:invitationId", async (req, res) => {
  try {
    const { daoId, invitationId } = req.params;
    const { status, walletAddress } = req.body; // status: 'accepted' | 'declined'

    const invitation = await Invitation.findById(invitationId);

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    if (invitation.daoId.toString() !== daoId) {
      return res.status(400).json({ message: "Invitation doesn't belong to this DAO" });
    }

    if (invitation.status !== "pending") {
      return res.status(400).json({ message: "Invitation has already been responded to" });
    }

    invitation.status = status;
    invitation.respondedAt = new Date();
    await invitation.save();

    // If accepted, add the user to the DAO members
    if (status === "accepted" && walletAddress) {
      const dao = await DAO.findById(daoId);
      if (dao && !dao.members.includes(walletAddress)) {
        dao.members.push(walletAddress);
        await dao.save();
      }
    }

    res.json(invitation);
  } catch (error) {
    console.error("Error updating invitation:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get invitations for a specific GitHub username across all DAOs
router.get("/invitations/github/:username", async (req, res) => {
  try {
    const invitations = await Invitation.find({
      githubUsername: req.params.username,
    })
      .populate("daoId", "name description creator")
      .sort({ invitedAt: -1 });

    res.json(invitations);
  } catch (error) {
    console.error("Error fetching user invitations:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
