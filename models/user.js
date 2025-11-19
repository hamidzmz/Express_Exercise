const mongoose = require('mongoose');
const { hashPassword } = require('../utils/password');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, default: 'member', trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

function serializeUser(user, { includePassword = false } = {}) {
  if (!user) {
    return null;
  }

  const doc = typeof user.toObject === 'function' ? user.toObject() : user;
  const normalizeDate = (value) =>
    value instanceof Date ? value.toISOString() : value;

  const payload = {
    id: doc._id ? doc._id.toString() : doc.id,
    name: doc.name,
    email: doc.email,
    role: doc.role,
    createdAt: normalizeDate(doc.createdAt),
    updatedAt: normalizeDate(doc.updatedAt),
  };

  if (includePassword) {
    payload.passwordHash = doc.passwordHash;
  }

  return payload;
}

async function handleDuplicateError(error) {
  if (error && error.code === 11000) {
    const conflict = new Error('Email already exists');
    conflict.status = 409;
    throw conflict;
  }

  throw error;
}

async function initializeUserStore() {
  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const existing = await User.findOne({ email }).lean();

  if (!existing) {
    const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
    const admin = new User({
      name: 'Admin User',
      email,
      role: 'admin',
      passwordHash: hashPassword(password),
    });

    await admin.save();

    console.log(
      `Seeded admin user (${email}). Update the seed password/env before production.`
    );
  }
}

async function listUsers() {
  const users = await User.find().sort({ createdAt: -1 }).lean();
  return users.map((user) => serializeUser(user));
}

async function findUserById(id) {
  const user = await User.findById(id).lean();
  return serializeUser(user);
}

async function findUserByEmail(email, { includePassword = false } = {}) {
  if (!email) {
    return null;
  }

  const query = User.findOne({ email: email.toLowerCase() }).lean();
  const user = await query;
  return serializeUser(user, { includePassword });
}

async function createUser(data) {
  if (!data.name || !data.email || !data.password) {
    const error = new Error('name, email, and password are required');
    error.status = 400;
    throw error;
  }

  try {
    const user = new User({
      name: data.name,
      email: data.email.toLowerCase(),
      role: data.role || 'member',
      passwordHash: hashPassword(data.password),
    });

    await user.save();
    return serializeUser(user);
  } catch (error) {
    await handleDuplicateError(error);
  }
}

async function updateUser(id, updates = {}) {
  const user = await User.findById(id);

  if (!user) {
    return null;
  }

  if (updates.name) {
    user.name = updates.name;
  }

  if (updates.email) {
    user.email = updates.email.toLowerCase();
  }

  if (updates.role) {
    user.role = updates.role;
  }

  if (updates.password) {
    user.passwordHash = hashPassword(updates.password);
  }

  try {
    await user.save();
    return serializeUser(user);
  } catch (error) {
    await handleDuplicateError(error);
  }
}

async function deleteUser(id) {
  const result = await User.findByIdAndDelete(id);
  return Boolean(result);
}

module.exports = {
  initializeUserStore,
  listUsers,
  findUserById,
  findUserByEmail,
  createUser,
  updateUser,
  deleteUser,
};
