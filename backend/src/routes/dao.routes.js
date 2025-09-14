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
      creator,
      manager, // Changed from 'creator' to 'manager'
      contractAddress,
      votePrice,
      tokenName,
      tokenSymbol,
      tokenSupply,
      votingPeriod,
      stakingPeriod,
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
      daoId
    } = req.body;

    console.log("Creating DAO with parameters:", {
      name,
      description,
      creator,
      manager,
      contractAddress,
      votePrice,
      tokenName,
      tokenSymbol,
      tokenSupply,
      minTokens,
      daoId
    });

    // Use the contract address from the frontend (already deployed)
    // No need to deploy a new contract since it's already deployed on Avalanche
    const finalContractAddress = contractAddress || "0x0000000000000000000000000000000000000000";

    console.log("Received DAO create request with:", req.body);

    const dao = new DAO({
      name,
      description,
      creator: creator || manager, // Use creator if provided, otherwise use manager
      manager, // Add manager field if your model supports it
      contractAddress: finalContractAddress,
      votePrice,
      tokenName,
      tokenSymbol,
      tokenSupply,
      votingPeriod,
      stakingPeriod, // Add staking period
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
      members: [{ walletAddress: manager }], // Initialize with manager as first member
      // Add invited collaborators to members if they should be auto-added
      // members: [manager, ...(invitedCollaborators || [])],
      members: members || [creator || manager], // Use provided members or default to creator/manager
      daoId, // Add DAO ID from contract
    });

    const savedDao = await dao.save();

    // Create invitations for all invited collaborators
    if (invitedCollaborators && invitedCollaborators.length > 0) {
      try {
        const invitations = invitedCollaborators.map((githubUsername) => ({
          daoId: savedDao._id,
          githubUsername: githubUsername,
          invitedBy: manager,
          status: "pending",
        }));

        await Invitation.insertMany(invitations);
        console.log(`Created ${invitations.length} invitations for DAO ${savedDao._id}`);
      } catch (invitationError) {
        console.error("Error creating invitations:", invitationError);
        // Don't fail the DAO creation if invitations fail
        // You might want to log this for monitoring
      }
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

    // Create proposal on Algorand
    // const proposalId = await createProposal({
    //   dao: daoId,
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
      creator,
      startTime,
      endTime,
      proposalId,
    });

    await proposal.save();
    res.status(201).json(proposal);
  } catch (error) {
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
