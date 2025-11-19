const {
  listUsers,
  findUserById,
  createUser,
  updateUser,
  deleteUser,
} = require('../models/user');

async function getAllUsers(req, res, next) {
  try {
    const users = await listUsers();
    res.json({ data: users });
  } catch (error) {
    next(error);
  }
}

async function getUserById(req, res, next) {
  try {
    const user = await findUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ data: user });
  } catch (error) {
    next(error);
  }
}

async function createUserController(req, res, next) {
  try {
    const { name, email, role, password } = req.body || {};
    const user = await createUser({ name, email, role, password });
    res.status(201).json({ data: user });
  } catch (error) {
    next(error);
  }
}

async function updateUserController(req, res, next) {
  try {
    const updates = req.body || {};
    const updated = await updateUser(req.params.id, updates);

    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
}

async function deleteUserController(req, res, next) {
  try {
    const deleted = await deleteUser(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser: createUserController,
  updateUser: updateUserController,
  deleteUser: deleteUserController,
};
