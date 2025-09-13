import { PeraWalletConnect } from "@perawallet/connect";
import algosdk from "algosdk";

// Initialize PeraWallet
let peraWallet: PeraWalletConnect | null = null;

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

// Initialize the wallet connection
export const initializeWallet = async () => {
  if (!isBrowser) return null;

  try {
    if (!peraWallet) {
      peraWallet = new PeraWalletConnect();
    }

    // Check if already connected
    const accounts = await peraWallet.reconnectSession();
    if (accounts && accounts.length > 0) {
      return accounts[0];
    }
    return null;
  } catch (error) {
    console.error("Error initializing wallet:", error);
    return null;
  }
};

// Connect to Pera Wallet
export const connectWallet = async () => {
  if (!isBrowser) throw new Error("Not in browser environment");

  try {
    if (!peraWallet) {
      peraWallet = new PeraWalletConnect();
    }

    const accounts = await peraWallet.connect();
    if (accounts && accounts.length > 0) {
      return accounts[0];
    }
    throw new Error("No accounts found");
  } catch (error) {
    console.error("Error connecting wallet:", error);
    throw error;
  }
};

// Disconnect from Pera Wallet
export const disconnectWallet = async () => {
  if (!isBrowser || !peraWallet) return;

  try {
    await peraWallet.disconnect();
  } catch (error) {
    console.error("Error disconnecting wallet:", error);
    throw error;
  }
};

// Get wallet address
export const getWalletAddress = async () => {
  if (!isBrowser || !peraWallet) return null;

  try {
    const accounts = await peraWallet.reconnectSession();
    return accounts && accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error("Error getting wallet address:", error);
    return null;
  }
};
