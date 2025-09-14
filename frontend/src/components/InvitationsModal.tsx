import React, { useState } from 'react';
import { X, Mail, CheckCircle2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import InvitationCard from '@/components/InvitationCard';

const InvitationsModal = ({ 
  isOpen, 
  onClose, 
  invitations, 
  onAcceptInvitation, 
  onDeclineInvitation,
  walletAddress,
  githubUsername 
}) => {
  const [actionLoading, setActionLoading] = useState({});
  const { toast } = useToast();

  if (!isOpen) return null;

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');
  const respondedInvitations = invitations.filter(inv => inv.status !== 'pending');

  const handleAccept = async (invitationId, walletAddr) => {
    if (!walletAddr) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to accept this invitation.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(prev => ({ ...prev, [invitationId]: true }));
    
    try {
      const result = await onAcceptInvitation(invitationId, walletAddr);
      
      if (result.success) {
        toast({
          title: "Invitation Accepted!",
          description: "You've successfully joined the DAO. Welcome aboard!",
        });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [invitationId]: false }));
    }
  };

  const handleDecline = async (invitationId) => {
    setActionLoading(prev => ({ ...prev, [invitationId]: true }));
    
    try {
      const result = await onDeclineInvitation(invitationId);
      
      if (result.success) {
        toast({
          title: "Invitation Declined",
          description: "You've declined the DAO invitation.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decline invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [invitationId]: false }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl my-8 mx-auto">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-xl max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">DAO Invitations</h2>
                <p className="text-gray-400">
                  Welcome back, @{githubUsername}! You have {pendingInvitations.length} pending invitation{pendingInvitations.length !== 1 ? 's' : ''}.
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
            {invitations.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Invitations</h3>
                <p className="text-gray-400">
                  You don't have any DAO invitations at the moment.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {invitations.map((invitation) => (
                  <InvitationCard
                    key={invitation._id}
                    invitation={invitation}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    walletAddress={walletAddress}
                    isLoading={actionLoading[invitation._id]}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-600 flex-shrink-0">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                {pendingInvitations.length > 0 
                  ? "Accept invitations to join DAOs and start participating in governance."
                  : "All caught up! No pending invitations."
                }
              </p>
              
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationsModal;