const pool = require('../config/database');

const logActivity = async (data) => {
  try {
    await pool.query(
      `INSERT INTO activity_logs 
       (user_id, action, entity_type, entity_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        data.userId,
        data.action,
        data.entityType || null,
        data.entityId || null,
        data.details ? JSON.stringify(data.details) : null,
        data.ipAddress || null,
        data.userAgent || null
      ]
    );
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

module.exports = { logActivity };