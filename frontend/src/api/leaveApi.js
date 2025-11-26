import axios from './axios';

export const getLeaves = async (params = {}) => {
  const response = await axios.get('/leaves', { params });
  return response.data;
};

export const getMyLeaves = async (params = {}) => {
  const response = await axios.get('/leaves/my', { params });
  return response.data;
};

export const getLeaveTypes = async () => {
  const response = await axios.get('/leaves/types');
  return response.data;
};

export const getLeaveCredits = async (userId) => {
  const response = await axios.get(`/leaves/credits/${userId}`);
  return response.data;
};

export const createLeave = async (leaveData) => {
  const response = await axios.post('/leaves', leaveData);
  return response.data;
};

export const updateLeave = async (id, leaveData) => {
  const response = await axios.put(`/leaves/${id}`, leaveData);
  return response.data;
};

export const approveLeave = async (id, remarks = '') => {
  const response = await axios.put(`/leaves/${id}/approve`, { reviewRemarks: remarks });
  return response.data;
};

export const declineLeave = async (id, remarks = '') => {
  const response = await axios.put(`/leaves/${id}/decline`, { reviewRemarks: remarks });
  return response.data;
};

export const cancelLeave = async (id) => {
  const response = await axios.delete(`/leaves/${id}`);
  return response.data;
};