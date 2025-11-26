const { body, param, query } = require('express-validator');

const attendanceValidator = {
  timeIn: [
    body('date')
      .optional()
      .isDate()
      .withMessage('Invalid date format'),
    body('timeIn')
      .notEmpty()
      .withMessage('Time in is required')
      .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .withMessage('Time must be in HH:mm format')
  ],

  timeOut: [
    body('attendanceId')
      .isInt()
      .withMessage('Valid attendance ID is required'),
    body('timeOut')
      .notEmpty()
      .withMessage('Time out is required')
      .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .withMessage('Time must be in HH:mm format')
  ],

  update: [
    param('id').isInt().withMessage('Invalid attendance ID'),
    body('timeIn')
      .optional()
      .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .withMessage('Time must be in HH:mm format'),
    body('timeOut')
      .optional()
      .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .withMessage('Time must be in HH:mm format'),
    body('status')
      .optional()
      .isIn(['present', 'absent', 'late', 'half_day', 'on_leave'])
      .withMessage('Invalid status')
  ],

  getReport: [
    param('userId').isInt().withMessage('Invalid user ID'),
    query('month')
      .isInt({ min: 1, max: 12 })
      .withMessage('Month must be between 1 and 12'),
    query('year')
      .isInt({ min: 2020, max: 2100 })
      .withMessage('Invalid year')
  ]
};

module.exports = attendanceValidator;