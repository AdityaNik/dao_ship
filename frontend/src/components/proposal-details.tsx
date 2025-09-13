import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";
import { Vote, Check, X } from "lucide-react";
import GlassmorphicCard from "@/components/ui/glassmorphic-card";
import GradientButton from "@/components/ui/gradient-button";

interface ProposalDetailsProps {
  proposal: {
    _id: string;
    title: string;
    description: string;
    votes: Array<{
      voter: string;
      vote: "yes" | "no";
    }>;
    status: string;
    startDate: string;
    endDate: string;
  };
  totalMembers: number;
}

const ProposalDetails: React.FC<ProposalDetailsProps> = ({
  proposal,
  totalMembers,
}) => {
  const { toast } = useToast();
  const { isConnected, walletAddress } = useWallet();
  const [hasVoted, setHasVoted] = useState(false);
  const [voteCount, setVoteCount] = useState({ yes: 0, no: 0 });

  useEffect(() => {
    // Calculate vote counts
    const yesVotes = proposal.votes.filter((v) => v.vote === "yes").length;
    const noVotes = proposal.votes.filter((v) => v.vote === "no").length;
    setVoteCount({ yes: yesVotes, no: noVotes });

    // Check if current user has voted
    setHasVoted(proposal.votes.some((v) => v.voter === walletAddress));
  }, [proposal, walletAddress]);

  const handleVote = async (vote: "yes" | "no") => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to vote",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/dao/proposals/${proposal._id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voter: walletAddress,
          vote,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit vote");

      toast({
        title: "Vote Submitted",
        description: "Your vote has been recorded successfully",
      });

      // Refresh proposal data
      // ... fetch updated proposal data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const totalVotes = voteCount.yes + voteCount.no;
  const participationPercentage = (totalVotes / totalMembers) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{proposal.title}</h1>
        <p className="text-gray-300 mb-8">{proposal.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Voting Stats */}
          <GlassmorphicCard className="p-6">
            <h2 className="text-xl font-semibold mb-4">Voting Progress</h2>
            <div className="w-48 h-48 mx-auto mb-4">
              <CircularProgressbar
                value={participationPercentage}
                text={`${Math.round(participationPercentage)}%`}
                styles={buildStyles({
                  pathColor: "#3B82F6",
                  textColor: "#fff",
                  trailColor: "#374151",
                })}
              />
            </div>
            <div className="text-center">
              <p className="text-gray-400">
                {totalVotes} of {totalMembers} members have voted
              </p>
            </div>
          </GlassmorphicCard>

          {/* Vote Results */}
          <GlassmorphicCard className="p-6">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Yes</span>
                  <span>{voteCount.yes} votes</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${(voteCount.yes / totalVotes) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>No</span>
                  <span>{voteCount.no} votes</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: `${(voteCount.no / totalVotes) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </GlassmorphicCard>
        </div>

        {/* Voting Section */}
        {!hasVoted && proposal.status === "active" && (
          <GlassmorphicCard className="mt-8 p-6">
            <h2 className="text-xl font-semibold mb-4">Cast Your Vote</h2>
            <div className="flex gap-4">
              <GradientButton
                onClick={() => handleVote("yes")}
                className="flex-1"
              >
                <Check className="mr-2 h-5 w-5" />
                Yes
              </GradientButton>
              <GradientButton
                onClick={() => handleVote("no")}
                className="flex-1"
                variant="destructive"
              >
                <X className="mr-2 h-5 w-5" />
                No
              </GradientButton>
            </div>
          </GlassmorphicCard>
        )}
      </div>
    </div>
  );
};

export default ProposalDetails;
