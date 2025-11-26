const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const attendanceValidator = require('../validators/attendanceValidator');
const validate = require('../middleware/validationMiddleware');

// Employee routes
router.get('/my', authMiddleware, attendanceController.getMyAttendance);
router.post('/time-in', authMiddleware, attendanceController.timeIn);
router.post('/time-out', authMiddleware, attendanceController.timeOut);

// Admin/HR routes
router.get(
  '/',
  authMiddleware,
  roleMiddleware('admin', 'hr'),
  attendanceController.getAll
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('admin', 'hr'),
  attendanceValidator.update,
  validate,
  attendanceController.update
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('admin', 'hr'),
  attendanceController.delete
);

router.get(
  '/report/:userId',
  authMiddleware,
  attendanceValidator.getReport,
  validate,
  attendanceController.getMonthlyReport
);

module.exports = router;