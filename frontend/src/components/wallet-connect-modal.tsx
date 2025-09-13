import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, Wallet, QrCode, X, ArrowRight, Shield, Zap, Globe } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Connector, useConnect } from "wagmi";

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (walletType: Connector) => void;
}

const WalletConnectModal = ({
  isOpen,
  onClose,
  onConnect,
}: WalletConnectModalProps) => {
  const [connecting, setConnecting] = useState<string | null>(null);
  const { toast } = useToast();
  const { connectors, connect } = useConnect();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-gray-900/98 to-black/98 backdrop-blur-2xl border border-white/30 text-white shadow-2xl">
        <div className="flex flex-col space-y-8 p-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-blue-400/50 shadow-lg shadow-blue-500/20">
                  <Wallet className="h-8 w-8 text-blue-300" />
                </div>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                Connect Your Wallet
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-xl hover:bg-white/10 transition-all duration-200 ml-6 border border-white/20 hover:border-white/40"
            >
              <X className="h-6 w-6 text-gray-300" />
            </button>
          </div>

          {/* Wallet Options */}
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-2">Available Wallets</h3>
              <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full" />
            </div>
            {connectors.map((connector) => (
              <WalletOption
                key={connector.uid}
                name={connector.name}
                icon={connector.icon}
                connector={connector}
                onClick={() => {
                  onConnect(connector)
                }}
                isLoading={connecting === connector.name}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-white/20">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-4">
                By connecting your wallet, you agree to our Terms of Service and Privacy Policy
              </p>
              <button
                onClick={onClose}
                className="px-8 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 font-medium border border-white/20 hover:border-white/40"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface WalletOptionProps {
  name: string;
  icon: React.ReactNode;
  onClick: () => void;
  connector: Connector
  isLoading: boolean;
}

const WalletOption = ({
  name,
  icon,
  onClick,
  isLoading,
  connector,
}: WalletOptionProps) => {
  const [ready, setReady] = React.useState(false)
  React.useEffect(() => {
    ; (async () => {
      const provider = await connector.getProvider()
      setReady(!!provider)
    })()
  }, [connector])

  // Get appropriate icon based on connector name
  const getWalletIcon = (connectorName: string) => {
    const name = connectorName.toLowerCase();
    if (name.includes('metamask')) return <Shield className="h-6 w-6 text-orange-400" />;
    if (name.includes('walletconnect')) return <QrCode className="h-6 w-6 text-blue-400" />;
    if (name.includes('injected')) return <Zap className="h-6 w-6 text-green-400" />;
    return <Wallet className="h-6 w-6 text-gray-400" />;
  };

  return (
    <button
      onClick={onClick}
      disabled={isLoading || !ready}
      className="w-full p-3 rounded-xl bg-gradient-to-r from-white/5 to-white/10 hover:from-white/10 hover:to-white/15 
             border border-white/20 hover:border-white/40 transition-all duration-300 flex items-center 
             justify-between group disabled:opacity-50 disabled:cursor-not-allowed transform 
             hover:scale-[1.01] hover:shadow-md hover:shadow-blue-500/15 relative overflow-hidden"
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-center gap-3 relative z-10">
        <div className="p-3 rounded-lg bg-gradient-to-br from-white/15 to-white/5 
                    border border-white/30 group-hover:border-white/50 transition-all 
                    duration-300 group-hover:shadow-md group-hover:shadow-blue-500/20">
          {getWalletIcon(connector.name)}
        </div>
        <div className="text-left">
          <p className="font-semibold text-white group-hover:text-blue-100 transition-colors duration-200 text-base">
            {name}
          </p>
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${ready ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
            {ready ? "Ready to connect" : "Checking availability..."}
          </p>
        </div>
      </div>

      <div className="flex items-center relative z-10">
        {isLoading ? (
          <div className="flex items-center gap-2 bg-blue-500/20 px-3 py-1.5 rounded-full">
            <Loader2 className="h-3 w-3 animate-spin text-blue-400" />
            <span className="text-xs text-blue-400 font-medium">Connecting...</span>
          </div>
        ) : (
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 
                      text-blue-400 flex items-center justify-center opacity-0 group-hover:opacity-100 
                      transition-all duration-300 border border-blue-400/40 group-hover:border-blue-400/60 
                      group-hover:shadow-md group-hover:shadow-blue-500/25">
            <ArrowRight className="h-4 w-4" />
          </div>
        )}
      </div>
    </button>
  );
};

export default WalletConnectModal;
