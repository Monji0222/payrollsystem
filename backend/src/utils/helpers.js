const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  }).format(amount);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatTime = (time) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const generateEmployeeId = async (pool) => {
  const result = await pool.query(
    "SELECT employee_id FROM users ORDER BY employee_id DESC LIMIT 1"
  );
  
  if (result.rows.length === 0) {
    return 'EMP001';
  }
  
  const lastId = result.rows[0].employee_id;
  const number = parseInt(lastId.replace('EMP', '')) + 1;
  return `EMP${number.toString().padStart(3, '0')}`;
};

const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

module.exports = {
  formatCurrency,
  formatDate,
  formatTime,
  generateEmployeeId,
  calculateAge
};
