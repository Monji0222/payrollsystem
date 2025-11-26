const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const leaveValidator = require('../validators/leaveValidator');
const validate = require('../middleware/validationMiddleware');

// Public authenticated routes
router.get('/types', authMiddleware, leaveController.getLeaveTypes);
router.get('/my', authMiddleware, leaveController.getMyLeaves);
router.get('/credits/:userId', authMiddleware, leaveController.getLeaveCredits);

// Employee routes
router.post(
  '/',
  authMiddleware,
  leaveValidator.create,
  validate,
  leaveController.create
);

router.put(
  '/:id',
  authMiddleware,
  leaveValidator.update,
  validate,
  leaveController.update
);

router.delete('/:id', authMiddleware, leaveController.cancel);

// Admin/HR routes
router.get(
  '/',
  authMiddleware,
  roleMiddleware('admin', 'hr'),
  leaveController.getAll
);

router.get('/:id', authMiddleware, leaveController.getById);

router.put(
  '/:id/approve',
  authMiddleware,
  roleMiddleware('admin', 'hr'),
  leaveValidator.review,
  validate,
  leaveController.approve
);

router.put(
  '/:id/decline',
  authMiddleware,
  roleMiddleware('admin', 'hr'),
  leaveValidator.review,
  validate,
  leaveController.decline
);

module.exports = router;