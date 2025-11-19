const mongoose = require('mongoose');

let isConnected = false;

async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/express_secure_api';

  try {
    await mongoose.connect(uri, {
      autoIndex: true,
    });
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    throw error;
  }
}

module.exports = {
  connectToDatabase,
};
