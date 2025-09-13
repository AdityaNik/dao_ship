import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Users } from 'lucide-react';
import { useGitHubAuth } from '@/hooks/useGitHubAuth';
import { useInvitations } from '@/hooks/useInvitations';
import InvitationCard from '@/components/InvitationCard';

const InvitationsPage = () => {
  const navigate = useNavigate();
  const { user, githubUsername, loading: authLoading } = useGitHubAuth();
  const { 
    invitations, 
    loading, 
    error,
    acceptInvitation, 
    declineInvitation 
  } = useInvitations(githubUsername);

  // Debug logging
  console.log('InvitationsPage Debug:', {
    user: !!user,
    githubUsername,
    invitations: invitations?.length || 0,
    loading,
    authLoading
  });

  // Redirect if not logged in (but wait for auth to load first)
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  // Show loading while checking authentication
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

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">DAO Invitations</h1>
                <p className="text-gray-400">
                  Welcome @{githubUsername || 'user'}! Manage your DAO membership invitations.
                </p>
                
                {/* Debug info */}
                <div className="mt-2 text-xs text-gray-500">
                  Debug: Username="{githubUsername}", Loading={loading.toString()}, Count={invitations?.length || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Test buttons for known usernames */}
          <div className="mb-4 p-4 bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">Test with known usernames:</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {['vgnv', 'bnvn', 'vedan', 'vedantbanaitkar', 'JayeshPatil163', 'Aniketwarule'].map(username => (
                <button
                  key={username}
                  onClick={() => {
                    console.log(`Testing invitations for: ${username}`);
                    fetch(`http://localhost:3000/api/invitations/github/${username}`)
                      .then(r => r.json())
                      .then(data => {
                        console.log(`Results for ${username}:`, data);
                        if (data.length > 0) {
                          alert(`Found ${data.length} invitations for ${username}`);
                        } else {
                          alert(`No invitations found for ${username}`);
                        }
                      });
                  }}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                >
                  {username}
                </button>
              ))}
            </div>
            
            {/* Manual username override */}
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Enter username to test"
                className="px-3 py-1 bg-gray-700 text-white text-xs rounded border border-gray-600"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const username = (e.target as HTMLInputElement).value;
                    if (username) {
                      console.log(`Testing invitations for: ${username}`);
                      fetch(`http://localhost:3000/api/invitations/github/${username}`)
                        .then(r => r.json())
                        .then(data => {
                          console.log(`Results for ${username}:`, data);
                          alert(`Found ${data.length} invitations for ${username}`);
                        });
                    }
                  }
                }}
              />
              <span className="text-xs text-gray-400">Press Enter to test</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          {/* Debug info - keeping this temporarily */}
          <div className="mb-4 p-3 bg-gray-800 rounded-lg text-xs">
            <p className="text-gray-400">Debug: Username="{githubUsername}", Loading={loading.toString()}, Count={invitations?.length || 0}</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-400">Loading invitations...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-4 mb-4">
                <p className="text-red-400">Error: {error}</p>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Retry
              </button>
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No invitations yet</h3>
              <p className="text-gray-500">
                You don't have any DAO invitations at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Your Invitations ({invitations.length})
                </h2>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-blue-900/30 border border-blue-600/50 text-blue-400 text-sm rounded-full">
                    {invitations.filter(inv => inv.status === 'pending').length} Pending
                  </span>
                  <span className="px-3 py-1 bg-green-900/30 border border-green-600/50 text-green-400 text-sm rounded-full">
                    {invitations.filter(inv => inv.status === 'accepted').length} Accepted
                  </span>
                </div>
              </div>
              
              {invitations.map((invitation) => (
                <InvitationCard
                  key={invitation._id}
                  invitation={invitation}
                  onAccept={(walletAddress) => acceptInvitation(invitation._id, walletAddress)}
                  onDecline={() => declineInvitation(invitation._id)}
                  walletAddress={null} // We'll add wallet integration later
                  isLoading={false}
                />
              ))}
            </div>
          )}
          ) : invitations.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Invitations</h3>
              <p className="text-gray-400">
                You don't have any DAO invitations at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  Your Invitations ({invitations.length})
                </h2>
              </div>
              
              <div className="space-y-4">
                {invitations.map((invitation) => (
                  <InvitationCard
                    key={invitation._id}
                    invitation={invitation}
                    onAccept={acceptInvitation}
                    onDecline={declineInvitation}
                    walletAddress={null} // Will be set when wallet connects
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvitationsPage;