const express = require('express');
const userController = require('../controllers/user');
const { readLimiter, writeLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router
  .route('/')
  .get(readLimiter, userController.getAllUsers)
  .post(writeLimiter, userController.createUser);

router
  .route('/:id')
  .get(readLimiter, userController.getUserById)
  .put(writeLimiter, userController.updateUser)
  .delete(writeLimiter, userController.deleteUser);

module.exports = router;
