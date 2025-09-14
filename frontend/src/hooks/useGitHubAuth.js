import { useState, useEffect } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  linkWithPopup,
  getAdditionalUserInfo
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, githubProvider, db } from './firebase.js';

export const useGitHubAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to extract and clean GitHub username
  const getGitHubUsername = (user) => {
    if (!user) return null;
    
    // console.log('Extracting GitHub username from user:', {
    //   displayName: user.displayName,
    //   email: user.email,
    //   providerData: user.providerData
    // });
    
    // Try to get the GitHub username from provider data
    const githubProvider = user.providerData.find(provider => provider.providerId === 'github.com');
    if (githubProvider) {
      // console.log('GitHub provider data:', githubProvider);
      
      // Check if email is GitHub noreply format which contains the username
      if (githubProvider.email && githubProvider.email.includes('@users.noreply.github.com')) {
        const username = githubProvider.email.split('@')[0];
        // console.log('Extracted username from noreply email:', username);
        // Remove any trailing numbers that might be appended
        const cleanedUsername = username.replace(/\d+$/, '');
        // console.log('Cleaned username (removed trailing numbers):', cleanedUsername);
        return cleanedUsername;
      }
    }
    
    // Fallback to display name with cleaning
    if (user.displayName) {
      // Remove spaces and trailing numbers
      const cleaned = user.displayName.replace(/\s+/g, '').replace(/\d+$/, '');
      // console.log('Cleaned display name:', { original: user.displayName, cleaned });
      return cleaned;
    }
    
    // Final fallback to email prefix
    if (user.email) {
      const emailUsername = user.email.split('@')[0].replace(/\d+$/, '');
      // console.log('Email-based username (cleaned):', emailUsername);
      return emailUsername;
    }
    
    return null;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const connectGitHub = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user;
      const additionalInfo = getAdditionalUserInfo(result);

      // Get GitHub access token
      const credential = GithubAuthProvider.credentialFromResult(result);
      const accessToken = credential.accessToken;

      // Extract GitHub username from provider data
      const githubUsername = user.providerData[0]?.displayName ||
                           additionalInfo?.username ||
                           user.reloadUserInfo?.screenName;

      // Store user data in Firestore
      const userDoc = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        githubUsername: githubUsername, // Store the extracted GitHub username
        githubAccessToken: accessToken, // Store securely - consider encryption
        githubProfile: additionalInfo.profile,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };

      await setDoc(doc(db, 'users', user.uid), userDoc, { merge: true });

      console.log('GitHub connected successfully:', user);
      return { success: true, user };
    } catch (error) {
      console.error('GitHub connection error:', error);
      setError(error.message);

      // Handle specific errors
      if (error.code === 'auth/account-exists-with-different-credential') {
        setError('Account exists with different credential. Please use your original sign-in method.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        setError('Sign-in cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Popup blocked. Please allow popups for this site.');
      }

      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const disconnectGitHub = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      console.log('GitHub disconnected successfully');
      return { success: true };
    } catch (error) {
      console.error('GitHub disconnection error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const getUserData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  return {
    user,
    loading,
    error,
    connectGitHub,
    disconnectGitHub,
    getUserData,
    isConnected: !!user,
    githubUsername: getGitHubUsername(user)
  };
};
