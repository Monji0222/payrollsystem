const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let status = err.status || 500;
  let message = err.message || 'Internal server error';

  // PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        status = 409;
        message = 'Resource already exists';
        break;
      case '23503': // Foreign key violation
        status = 400;
        message = 'Referenced resource does not exist';
        break;
      case '23502': // Not null violation
        status = 400;
        message = 'Required field is missing';
        break;
      case '22P02': // Invalid text representation
        status = 400;
        message = 'Invalid data format';
        break;
    }
  }

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err
    })
  });
};

module.exports = errorHandler;