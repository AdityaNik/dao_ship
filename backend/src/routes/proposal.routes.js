const express = require("express");
const router = express.Router();
const Proposal = require("../models/Proposal");
const DAO = require("../models/DAO");
const { createProposal, voteOnProposal } = require("../services/algorand.service");

// Create a new proposal
router.post("/", async (req, res) => {
  try {
    const { title, description, dao, creator, startTime, endTime } = req.body;

    // Fetch the DAO to get its contract address
    const daoObject = await DAO.findById(dao);
    if (!daoObject) {
      return res.status(404).json({ message: "DAO not found" });
    }

    console.log("Creating proposal for DAO:", {
      daoId: dao,
      contractAddress: daoObject.contractAddress,
      title,
      creator,
    });

    // Create proposal on Algorand with contract address
    const proposalId = await createProposal({
      dao,
      contractAddress: daoObject.contractAddress,
      title,
      description,
      startTime,
      endTime,
    });

    const proposal = new Proposal({
      title,
      description,
      dao,
      contractAddress: daoObject.contractAddress,
      creator,
      startTime,
      endTime,
      proposalId,
    });

    await proposal.save();
    console.log("Proposal created successfully:", proposal._id);
    res.status(201).json(proposal);
  } catch (error) {
    console.error("Error creating proposal:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get all proposals for a DAO
router.get("/dao/:daoId", async (req, res) => {
  try {
    // First, find the proposals without population
    const proposals = await Proposal.find({ dao: req.params.daoId }).sort({
      createdAt: -1,
    });

    // Then, we'll manually process the results to handle the potentially invalid creator IDs
    const processedProposals = [];

    for (const proposal of proposals) {
      try {
        // Only try to populate if the creator looks like a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(proposal.creator)) {
          const populatedProposal = await Proposal.findById(proposal._id)
            .populate("creator", "username walletAddress")
            .lean();
          processedProposals.push(populatedProposal);
        } else {
          // For invalid creator IDs, just return the proposal with a placeholder creator
          const plainProposal = proposal.toObject();
          plainProposal.creator = {
            _id: plainProposal.creator,
            username: "Unknown User",
            walletAddress: "N/A",
          };
          processedProposals.push(plainProposal);
        }
      } catch (err) {
        // If population fails for this item, add it without population
        processedProposals.push(proposal.toObject());
      }
    }

    res.json(processedProposals);
  } catch (error) {
    console.log("error in getProposals", error);
    res.status(500).json({ message: error.message });
  }
});

// Get a specific proposal
router.get("/:id", async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate("creator", "username walletAddress")
      .populate("dao", "name contractAddress");
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }
    res.json(proposal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Vote on a proposal
router.post("/:id/vote", async (req, res) => {
  try {
    const { walletAddress, githubUsername, vote, votingPower = 1 } = req.body;

    // Validate required fields
    if (!walletAddress || !githubUsername || !vote) {
      return res.status(400).json({
        message: "Wallet address, GitHub username, and vote are required",
      });
    }

    // Find the proposal and populate the DAO
    const proposal = await Proposal.findById(req.params.id).populate("dao");

    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    if (proposal.status !== "active") {
      return res.status(400).json({ message: "Proposal is not active" });
    }

    // Check if proposal has expired
    if (new Date() > proposal.endTime) {
      return res.status(400).json({ message: "Voting period has ended" });
    }

    // Validate that the user is a member of the DAO
    const dao = proposal.dao;
    const isMember = dao.members.some(
      (member) =>
        member.walletAddress.toLowerCase() === walletAddress.toLowerCase() ||
        member.username?.toLowerCase() === githubUsername.toLowerCase(),
    );

    if (!isMember) {
      return res.status(403).json({
        message: "Only DAO members can vote on proposals",
      });
    }

    // Check if user has already voted
    const existingVote = proposal.votes.find(
      (v) =>
        v.walletAddress.toLowerCase() === walletAddress.toLowerCase() ||
        v.githubUsername.toLowerCase() === githubUsername.toLowerCase(),
    );

    if (existingVote) {
      return res.status(400).json({
        message: "You have already voted on this proposal",
      });
    }

    // Record vote on Algorand (if needed)
    try {
      await voteOnProposal({
        proposalId: proposal.proposalId,
        voter: walletAddress,
        vote,
        votingPower,
      });
    } catch (algorandError) {
      console.log("Algorand voting error (continuing anyway):", algorandError.message);
      // Continue even if Algorand fails, as we want to store the vote in our database
    }

    // Add the vote to the proposal
    const newVote = {
      walletAddress,
      githubUsername,
      vote,
      votingPower,
      votedAt: new Date(),
    };

    proposal.votes.push(newVote);

    // Update vote counts
    proposal[`${vote}Votes`] += votingPower;

    // Check if proposal should be finalized
    const totalVotes = proposal.yesVotes + proposal.noVotes + proposal.abstainVotes;

    // Auto-finalize if voting period ended or if all members have voted
    if (new Date() > proposal.endTime || proposal.votes.length >= dao.members.length) {
      if (totalVotes > 0) {
        proposal.status = proposal.yesVotes > proposal.noVotes ? "passed" : "failed";
      }
    }

    await proposal.save();

    // Return the updated proposal with vote counts
    res.json({
      ...proposal.toObject(),
      message: "Vote recorded successfully",
      voteStatus: {
        totalVotes,
        yesVotes: proposal.yesVotes,
        noVotes: proposal.noVotes,
        abstainVotes: proposal.abstainVotes,
        userVote: newVote,
      },
    });
  } catch (error) {
    console.error("Error recording vote:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
