const { body, param } = require('express-validator');

const leaveValidator = {
  create: [
    body('leaveTypeId')
      .isInt()
      .withMessage('Valid leave type ID is required'),
    body('startDate')
      .isDate()
      .withMessage('Valid start date is required'),
    body('endDate')
      .isDate()
      .withMessage('Valid end date is required')
      .custom((value, { req }) => {
        if (new Date(value) < new Date(req.body.startDate)) {
          throw new Error('End date must be after start date');
        }
        return true;
      }),
    body('reason')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Reason must not exceed 500 characters')
  ],

  update: [
    param('id').isInt().withMessage('Invalid leave request ID'),
    body('startDate')
      .optional()
      .isDate()
      .withMessage('Valid start date is required'),
    body('endDate')
      .optional()
      .isDate()
      .withMessage('Valid end date is required'),
    body('reason')
      .optional()
      .trim()
      .isLength({ max: 500 })
  ],

  review: [
    param('id').isInt().withMessage('Invalid leave request ID'),
    body('status')
      .isIn(['approved', 'declined'])
      .withMessage('Status must be either approved or declined'),
    body('reviewRemarks')
      .optional()
      .trim()
      .isLength({ max: 500 })
  ]
};

module.exports = leaveValidator;