const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const userValidator = require('../validators/userValidators');
const validate = require('../middleware/validationMiddleware');

// Public routes
router.get('/profile/me', authMiddleware, userController.getProfile);

// Admin and HR routes
router.get(
  '/',
  authMiddleware,
  roleMiddleware('admin', 'hr'),
  userController.getAll
);

router.get(
  '/:id',
  authMiddleware,
  userController.getById
);

router.post(
  '/',
  authMiddleware,
  roleMiddleware('admin', 'hr'),
  userValidator.create,
  validate,
  userController.create
);

router.put(
  '/:id',
  authMiddleware,
  userValidator.update,
  validate,
  userController.update
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  userController.delete
);

router.put(
  '/:id/status',
  authMiddleware,
  roleMiddleware('admin', 'hr'),
  userValidator.changeStatus,
  validate,
  userController.changeStatus
);

module.exports = router;