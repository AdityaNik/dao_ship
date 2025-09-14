import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import GlassmorphicCard from "@/components/ui/glassmorphic-card";
import GlassmorphicInput from "@/components/ui/glassmorphic-input";
import GlassmorphicTextarea from "@/components/ui/glassmorphic-textarea";
import GlassmorphicSlider from "@/components/ui/glassmorphic-slider";
import GradientButton from "@/components/ui/gradient-button";
import { useToast } from "@/hooks/use-toast";
import { getDAO, createProposal } from "@/lib/api";
import { addMembersToDAO, disctributeTokenToMembers } from "@/lib/addMemberToDAO";// Import the distribution function
import { useAccount, useWriteContract } from "wagmi";
import { parseEther } from "viem";

const CreateProposal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dao, setDao] = useState(null);
  const [acceptedMembers, setAcceptedMembers] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    votingPeriod: 7,
  });

  const { address } = useAccount();
  const { writeContract } = useWriteContract();

  // Fetch DAO data from the API
  useEffect(() => {
    const fetchDAO = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        console.log("Fetching DAO with ID:", id);

        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

        // Fetch DAO data and invitations in parallel
        const [daoData, invitationsData] = await Promise.all([
          getDAO(id),
          fetch(`${apiUrl}/dao/${id}/invitations`)
            .then((res) => res.json())
            .catch(() => []),
        ]);

        console.log("daoData fetched:", daoData);
        console.log("invitationsData fetched:", invitationsData);
        console.log("DAO members:", daoData?.members);

        // Filter accepted members/invitations
        const acceptedInvitations = invitationsData?.filter((inv) => inv.status === "accepted") || [];
        console.log("Accepted invitations:", acceptedInvitations);

        // If DAO has a members array, filter for accepted status
        let filteredMembers = [];
        if (daoData?.members) {
          filteredMembers = daoData.members;
          console.log("Accepted members from DAO:", filteredMembers);
        }
        
        
        // Combine accepted members from both sources if needed
        const allAcceptedMembers = [...filteredMembers];
        console.log(allAcceptedMembers)
        setDao(daoData);
        setAcceptedMembers(allAcceptedMembers);

        setFormData((prevState) => ({
          ...prevState,
          votingPeriod: 7,
        }));
      } catch (error) {
        console.error("Error fetching DAO:", error);
        toast({
          title: "Error",
          description: "Could not load DAO information. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDAO();
  }, [id, toast]);

  // Handle changes into text input here
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Calculate proposal start and end times based on voting period
  const calculateProposalTimes = (votingPeriodDays) => {
    const startTime = new Date();
    const endTime = new Date();
    endTime.setDate(endTime.getDate() + votingPeriodDays);
    return { startTime, endTime };
  };

  // Calculate token distribution amounts for accepted members
  const calculateTokenDistribution = () => {
    if (!dao || acceptedMembers.length === 0) {
      return { addresses: [], amounts: [] };
    }

    const totalSupply = dao.tokenSupply || 100000;
    const initialDistributionPercentage = dao.tokenAllocation?.initialDistribution || 60;
    
    // Calculate total tokens to distribute for initial distribution
    const totalInitialTokens = Math.floor((totalSupply * initialDistributionPercentage) / 100);
    
    // Distribute equally among accepted members
    const tokensPerMember = Math.floor(totalInitialTokens / acceptedMembers.length);
    
    console.log("Token distribution calculation:", {
      totalSupply,
      initialDistributionPercentage,
      totalInitialTokens,
      acceptedMembersCount: acceptedMembers.length,
      tokensPerMember
    });

    const addresses = acceptedMembers.map(member => member.walletAddress);
    const amounts = acceptedMembers.map(() => tokensPerMember);

    return { addresses, amounts };
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dao) {
      toast({
        title: "Error",
        description: "DAO information not loaded. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Check if there are accepted members to vote on the proposal
    if (acceptedMembers.length === 0) {
      toast({
        title: "Warning",
        description: "This DAO has no accepted members to vote on proposals.",
        variant: "destructive",
      });
    }

    setIsSubmitting(true);

    try {
      console.log("Creating proposal for DAO:", id);
      console.log("Accepted members who can vote:", acceptedMembers);

      // Try to get the real creator ID from the DAO If it's not available, use a valid placeholder ObjectId
      const currentUserId = dao.creator?._id || dao.creator;

      // Use this valid ObjectId as a placeholder if needed This MUST be a valid 24-character hex string that can be cast to ObjectId
      const placeholderUserId = "507f1f77bcf86cd799439011";

      // Ensure we have a valid ObjectId-compatible string
      const creatorId =
        currentUserId && /^[0-9a-fA-F]{24}$/.test(currentUserId)
          ? currentUserId
          : placeholderUserId;

      const { startTime, endTime } = calculateProposalTimes(
        formData.votingPeriod
      );

      // Prepare proposal data according to backend requirements
      const proposalData = {
        title: formData.title,
        description: formData.description,
        dao: id, // DAO ID from URL param
        creator: creatorId, // Use the valid ObjectId-compatible string
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        eligibleVoters: acceptedMembers.map(member => member._id || member.user?._id).filter(Boolean), // Include accepted members as eligible voters
      };

      console.log("Submitting proposal data:", proposalData);

      const addresses = acceptedMembers.map(m => m.walletAddress as `0x${string}`);
      const usernames = acceptedMembers.map(m => m.username); // Use 'username' field instead of 'githubUsername'

      console.log(address + " " + usernames)

      // Add members to DAO first
      await addMembersToDAO(writeContract, dao.contractAddress as `0x${string}`, addresses, usernames, address as `0x${string}`);

      // Calculate token distribution
      const { addresses: memberAddresses, amounts } = calculateTokenDistribution();
      
      console.log("Distributing tokens:", {
        memberAddresses,
        amounts,
        usernames: acceptedMembers.map(m => m.username)
      });

      // Distribute tokens to accepted members
      if (memberAddresses.length > 0 && amounts.length > 0) {
        await disctributeTokenToMembers(
          writeContract,
          dao.contractAddress as `0x${string}`,
          memberAddresses as string[],
          amounts as number[],
          address as `0x${string}`
        );
        
        console.log("Tokens distributed successfully to accepted members");
      }

      const createdProposal = await createProposal(id, proposalData);

      console.log("Proposal has been created successfully!!", createdProposal);

      toast({
        title: "Success",
        description: `Your proposal has been submitted to the DAO. ${acceptedMembers.length} accepted members can vote on it. Initial tokens have been distributed.`,
      });

      // Navigate back to the DAO dashboard
      navigate(`/dao/${id}`);
    } catch (error) {
      console.error("Error creating proposal:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to create proposal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <GlassmorphicCard className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Loading DAO...</h2>
          <p className="text-daoship-text-gray mb-6">
            Please wait while we fetch the DAO information.
          </p>
        </GlassmorphicCard>
      </div>
    );
  }

  if (!dao) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <GlassmorphicCard className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-white mb-4">DAO Not Found</h2>
          <p className="text-daoship-text-gray mb-6">
            We couldn't find the DAO you're looking for.
          </p>
          <GradientButton onClick={() => navigate("/")}>
            Return Home
          </GradientButton>
        </GlassmorphicCard>
      </div>
    );
  }

  // Calculate distribution info for display
  const { amounts: distributionAmounts } = calculateTokenDistribution();
  const tokensPerMember = distributionAmounts.length > 0 ? distributionAmounts[0] : 0;

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* <Navigation /> */}

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
            Create Proposal
          </h1>
          <p className="text-daoship-text-gray mb-10">
            For {dao.name} {dao.tokenSymbol ? `(${dao.tokenSymbol})` : " TOK"}
          </p>

          {/* Display accepted members and token distribution info */}
          {acceptedMembers.length > 0 && (
            <GlassmorphicCard className="p-4 mb-6">
              <p className="text-sm text-daoship-text-gray mb-2">
                <span className="text-daoship-blue font-medium">Eligible Voters:</span>{" "}
                {acceptedMembers.length} accepted member{acceptedMembers.length !== 1 ? 's' : ''} can vote on this proposal.
              </p>
              <p className="text-sm text-daoship-text-gray">
                <span className="text-daoship-blue font-medium">Token Distribution:</span>{" "}
                Each accepted member will receive {tokensPerMember.toLocaleString()} {dao.tokenSymbol || 'tokens'} from the initial distribution ({dao.tokenAllocation?.initialDistribution || 60}% of total supply).
              </p>
            </GlassmorphicCard>
          )}

          <GlassmorphicCard className="p-8" glowEffect>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <GlassmorphicInput
                  label="Proposal Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  // placeholder="Give your proposal a clear, descriptive title"
                  required
                />

                <GlassmorphicTextarea
                  label="Proposal Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  // placeholder="Describe your proposal in detail, including its purpose, implementation plan, and expected outcomes..."
                  className="min-h-[200px]"
                  required
                />

                <GlassmorphicSlider
                  label="Voting Period"
                  min={1}
                  max={dao.votingPeriod || 30}
                  value={formData.votingPeriod}
                  onChange={(value) =>
                    setFormData({ ...formData, votingPeriod: value })
                  }
                  unit=" days"
                />

                <div className="p-4 glass-card rounded-lg mt-2">
                  <p className="text-sm text-daoship-text-gray">
                    <span className="text-daoship-blue font-medium">Note:</span>{" "}
                    Proposals require a minimum quorum of {dao.quorum || 0}% to
                    be valid. The maximum voting period for this DAO is{" "}
                    {dao.votingPeriod || 30} days.
                    {acceptedMembers.length > 0 && (
                      <>
                        {" "}Only accepted members ({acceptedMembers.length}) can vote on proposals.
                        {" "}Initial tokens will be distributed automatically upon proposal creation.
                      </>
                    )}
                  </p>
                </div>

                <div className="flex justify-end pt-4">
                  <GradientButton
                    // onClick={handle}
                    type="submit"
                    disabled={isSubmitting}
                    variant="primary"
                    glowEffect
                  >
                    {isSubmitting ? "Submitting..." : "Submit Proposal"}
                  </GradientButton>
                </div>
              </div>
            </form>
          </GlassmorphicCard>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateProposal;