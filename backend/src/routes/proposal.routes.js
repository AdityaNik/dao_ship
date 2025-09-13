const express = require("express");
const router = express.Router();
const Proposal = require("../models/Proposal");
const {
  createProposal,
  voteOnProposal,
} = require("../services/algorand.service");

// Create a new proposal
router.post("/", async (req, res) => {
  try {
    const { title, description, dao, creator, startTime, endTime } = req.body;

    // Create proposal on Algorand
    const proposalId = await createProposal({
      dao,
      title,
      description,
      startTime,
      endTime,
    });

    const proposal = new Proposal({
      title,
      description,
      dao,
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
    const { voter, vote, votingPower } = req.body;
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    if (proposal.status !== "active") {
      return res.status(400).json({ message: "Proposal is not active" });
    }

    // Record vote on Algorand
    await voteOnProposal({
      proposalId: proposal.proposalId,
      voter,
      vote,
      votingPower,
    });

    // Update vote counts
    proposal.votes.push({ voter, vote, votingPower });
    proposal[`${vote}Votes`] += votingPower;

    // Check if proposal has ended
    if (new Date() > proposal.endTime) {
      const totalVotes =
        proposal.yesVotes + proposal.noVotes + proposal.abstainVotes;
      if (totalVotes >= proposal.dao.quorum) {
        proposal.status =
          proposal.yesVotes > proposal.noVotes ? "passed" : "failed";
      }
    }

    await proposal.save();
    res.json(proposal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
