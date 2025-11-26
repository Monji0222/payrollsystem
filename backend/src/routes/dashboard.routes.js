const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get(
  '/stats',
  authMiddleware,
  roleMiddleware('admin', 'hr'),
  dashboardController.getStats
);

router.get(
  '/employee-stats',
  authMiddleware,
  dashboardController.getEmployeeStats
);

module.exports = router;
