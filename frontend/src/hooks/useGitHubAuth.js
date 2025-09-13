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
    isConnected: !!user
  };
};
