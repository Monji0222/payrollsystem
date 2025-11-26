const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const payrollValidator = require('../validators/payrollValidator');
const validate = require('../middleware/validationMiddleware');

// Employee routes
router.get('/my', authMiddleware, payrollController.getMyPayroll);

// Admin/HR routes
router.get(
  '/',
  authMiddleware,
  roleMiddleware('admin', 'hr'),
  payrollController.getAll
);

router.get(
  '/:id',
  authMiddleware,
  payrollController.getById
);

router.post(
  '/generate',
  authMiddleware,
  roleMiddleware('admin', 'hr'),
  payrollValidator.generate,
  validate,
  payrollController.generatePayroll
);

router.put(
  '/:id/approve',
  authMiddleware,
  roleMiddleware('admin'),
  payrollValidator.approve,
  validate,
  payrollController.approve
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  payrollController.delete
);

module.exports = router;