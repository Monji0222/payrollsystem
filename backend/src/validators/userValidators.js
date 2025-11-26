const { body, param } = require('express-validator');

const userValidator = {
  create: [
    body('email')
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('firstName')
      .trim()
      .notEmpty()
      .withMessage('First name is required')
      .isLength({ max: 50 }),
    body('lastName')
      .trim()
      .notEmpty()
      .withMessage('Last name is required')
      .isLength({ max: 50 }),
    body('role')
      .isIn(['admin', 'hr', 'employee'])
      .withMessage('Invalid role'),
    body('position')
      .optional()
      .trim()
      .isLength({ max: 100 }),
    body('department')
      .optional()
      .trim()
      .isLength({ max: 100 }),
    body('basicSalary')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Basic salary must be a positive number'),
    body('contactNumber')
      .optional()
      .matches(/^[0-9+\-\s()]+$/)
      .withMessage('Invalid contact number format')
  ],

  update: [
    param('id').isInt().withMessage('Invalid user ID'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),
    body('firstName')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('First name cannot be empty'),
    body('lastName')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Last name cannot be empty'),
    body('role')
      .optional()
      .isIn(['admin', 'hr', 'employee'])
      .withMessage('Invalid role'),
    body('basicSalary')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Basic salary must be a positive number')
  ],

  changeStatus: [
    param('id').isInt().withMessage('Invalid user ID'),
    body('status')
      .isIn(['active', 'inactive', 'resigned', 'terminated'])
      .withMessage('Invalid employment status')
  ]
};

module.exports = userValidator;