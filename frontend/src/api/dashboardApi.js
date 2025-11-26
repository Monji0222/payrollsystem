import axios from './axios';

export const getDashboardStats = async () => {
  const response = await axios.get('/dashboard/stats');
  return response.data;
};

export const getEmployeeStats = async () => {
  const response = await axios.get('/dashboard/employee-stats');
  return response.data;
};