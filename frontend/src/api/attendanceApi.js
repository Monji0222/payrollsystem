import axios from './axios';

export const getAttendance = async (params = {}) => {
  const response = await axios.get('/attendance', { params });
  return response.data;
};

export const getMyAttendance = async (params = {}) => {
  const response = await axios.get('/attendance/my', { params });
  return response.data;
};

export const timeIn = async () => {
  const response = await axios.post('/attendance/time-in');
  return response.data;
};

export const timeOut = async () => {
  const response = await axios.post('/attendance/time-out');
  return response.data;
};

export const getMonthlyReport = async (userId, month, year) => {
  const response = await axios.get(`/attendance/report/${userId}`, {
    params: { month, year }
  });
  return response.data;
};