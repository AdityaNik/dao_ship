import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { useGitHubAuth } from "@/hooks/useGitHubAuth";
import { useInvitations } from "@/hooks/useInvitations";
import { useWallet } from "@/hooks/use-wallet";
import InvitationCard from "@/components/InvitationCard";

const InvitationsPage = () => {
  const navigate = useNavigate();
  const { user, githubUsername, loading: authLoading } = useGitHubAuth();
  const { walletAddress } = useWallet();
  const { invitations, loading, error, acceptInvitation, declineInvitation } = useInvitations(githubUsername);

  console.log("InvitationsPage Debug:", {
    user: !!user,
    githubUsername,
    loading,
    walletAddress,
    invitations: invitations?.length,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="text-gray-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div>Please login to view invitations</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">DAO Invitations</h1>
            <p className="text-gray-400">Welcome @{githubUsername}!</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="mb-4 p-3 bg-gray-800 rounded-lg text-xs">
            <p className="text-gray-400">
              Debug: Username="{githubUsername}", Loading={loading.toString()}, Count={invitations?.length || 0}
            </p>
            <p className="text-yellow-400 mt-1">
              🔍 Expected: "aniketwarule" | Current: "{githubUsername}" | Match:{" "}
              {githubUsername === "aniketwarule" ? "✅" : "❌"}
            </p>
            <p className="text-green-400 mt-1">
              � Wallet:{" "}
              {walletAddress
                ? `Connected (${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)})`
                : "Not Connected"}
            </p>
            <p className="text-blue-400 mt-1">
              💡 {!walletAddress ? "Connect wallet to accept invitations" : "Ready to accept invitations!"}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading invitations...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400">Error: {error}</p>
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No invitations yet</h3>
              <p className="text-gray-500">You don't have any DAO invitations.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-6">Your Invitations ({invitations.length})</h2>

              {invitations.map((invitation) => (
                <InvitationCard
                  key={invitation._id}
                  invitation={invitation}
                  onAccept={(invitationId, walletAddr) => acceptInvitation(invitationId, walletAddr)}
                  onDecline={() => declineInvitation(invitation._id)}
                  walletAddress={walletAddress}
                  isLoading={loading}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvitationsPage;
