import axios from './axios';

export const getUsers = async (params = {}) => {
  const response = await axios.get('/users', { params });
  return response.data;
};

export const getUserById = async (id) => {
  const response = await axios.get(`/users/${id}`);
  return response.data;
};

export const getProfile = async () => {
  const response = await axios.get('/users/profile/me');
  return response.data;
};

export const createUser = async (userData) => {
  const response = await axios.post('/users', userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await axios.put(`/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await axios.delete(`/users/${id}`);
  return response.data;
};

export const changeUserStatus = async (id, status) => {
  const response = await axios.put(`/users/${id}/status`, { status });
  return response.data;
};