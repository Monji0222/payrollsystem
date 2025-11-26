const { body, param, query } = require('express-validator');

const payrollValidator = {
  generate: [
    body('periodStart')
      .isDate()
      .withMessage('Valid period start date is required'),
    body('periodEnd')
      .isDate()
      .withMessage('Valid period end date is required')
      .custom((value, { req }) => {
        if (new Date(value) < new Date(req.body.periodStart)) {
          throw new Error('Period end must be after period start');
        }
        return true;
      }),
    body('employeeIds')
      .isArray({ min: 1 })
      .withMessage('At least one employee ID is required'),
    body('employeeIds.*')
      .isInt()
      .withMessage('All employee IDs must be valid integers')
  ],

  approve: [
    param('id').isInt().withMessage('Invalid payroll ID')
  ],

  getByPeriod: [
    param('start').isDate().withMessage('Valid start date is required'),
    param('end').isDate().withMessage('Valid end date is required')
  ]
};

module.exports = payrollValidator;