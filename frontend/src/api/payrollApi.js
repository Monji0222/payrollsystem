import axios from './axios';

export const getPayroll = async (params = {}) => {
  const response = await axios.get('/payroll', { params });
  return response.data;
};

export const getMyPayroll = async (params = {}) => {
  const response = await axios.get('/payroll/my', { params });
  return response.data;
};

export const getPayrollById = async (id) => {
  const response = await axios.get(`/payroll/${id}`);
  return response.data;
};

export const generatePayroll = async (data) => {
  const response = await axios.post('/payroll/generate', data);
  return response.data;
};

export const approvePayroll = async (id) => {
  const response = await axios.put(`/payroll/${id}/approve`);
  return response.data;
};
