import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// DAO endpoints
export const createDAO = async (daoData: any) => {
  const response = await api.post("/dao", daoData);
  return response.data;
};

export const getAllDAOs = async () => {
  const response = await api.get("/dao");
  return response.data;
};

export const getDAO = async (id: string) => {
  try {
    console.log(`Fetching DAO from: ${API_URL}/dao/${id}`);
    const response = await api.get(`/dao/${id}`);
    console.log("getDAO called, response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error in getDAO for ID ${id}:`, error.response?.data || error.message);
    throw error; // Re-throw to be caught by the calling component (DAODashboard)
  }
};

export const getDAOProposals = async (daoId: string) => {
  try {
    // THIS IS THE CRUCIAL CHANGE: Correcting the endpoint path
    console.log(`[API] Fetching DAO proposals from: ${API_URL}/proposal/dao/${daoId}`);
    const response = await api.get(`/proposal/dao/${daoId}`);
    console.log("[API] getDAOProposals in process, response:", response.data); // Keep original log text
    return response.data;
  } catch (error) {
    console.error(`[API ERROR] Error in getDAOProposals for DAO ID ${daoId}:`, error.response?.data || error.message);
    if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
      console.warn(`[API WARN] No proposals found (404) for DAO ID ${daoId}. Returning empty array.`);
      return []; // Return empty array if proposals are not found
    }
    throw error;
  }
};

// Proposal endpoints
export const createProposal = async (daoId: string, proposalData: any) => {
  const response = await api.post(`/dao/${daoId}/proposals`, proposalData);
  return response.data;
};

export const getProposal = async (daoId: string, proposalId: string) => {
  const response = await api.get(`/proposal/${proposalId}`);
  return response.data;
};

export const voteOnProposal = async (
  daoId: string,
  proposalId: string,
  voteData: { vote: "yes" | "no" | "abstain" }
) => {
  const response = await api.post(
    `/dao/${daoId}/proposals/${proposalId}/vote`,
    voteData
  );
  return response.data;
};

// User endpoints
export const joinDAO = async (daoId: string) => {
  const response = await api.post(`/dao/${daoId}/join`);
  return response.data;
};

export const leaveDAO = async (daoId: string) => {
  const response = await api.post(`/dao/${daoId}/leave`);
  return response.data;
};

// User API calls
export const createUser = async (userData: any) => {
  const response = await api.post("/user", userData);
  return response.data;
};

export const getUserByWallet = async (walletAddress: string) => {
  const response = await api.get(`/user/wallet/${walletAddress}`);
  return response.data;
};

export const updateUser = async (userId: string, userData: any) => {
  const response = await api.put(`/user/${userId}`, userData);
  return response.data;
};

export const getUserDAOs = async (userId: string) => {
  const response = await api.get(`/user/${userId}/dao`);
  return response.data;
};

// You might also want to export the api instance if you use it directly elsewhere

export default api;
