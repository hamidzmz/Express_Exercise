require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');

const logger = require('./middleware/logger');
const auth = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const { connectToDatabase } = require('./config/database');
const { initializeUserStore } = require('./models/user');

const app = express();
const PORT = process.env.PORT || 3443;
const SSL_KEY_PATH = process.env.SSL_KEY_PATH || path.join(__dirname, 'key.pem');
const SSL_CERT_PATH = process.env.SSL_CERT_PATH || path.join(__dirname, 'cert.pem');

app.set('trust proxy', 1);
app.use(logger);
app.use(express.json());
app.use(rateLimiter.globalLimiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', auth, userRoutes);

app.use((req, res, next) => {
  const error = new Error('Route not found');
  error.status = 404;
  next(error);
});

app.use(errorHandler);

function loadCredentials() {
  try {
    return {
      key: fs.readFileSync(SSL_KEY_PATH),
      cert: fs.readFileSync(SSL_CERT_PATH),
    };
  } catch (error) {
    console.error('Failed to read TLS certificates.');
    throw error;
  }
}

async function start() {
  await connectToDatabase();
  await initializeUserStore();

  const credentials = loadCredentials();
  const server = https.createServer(credentials, app);

  server.listen(PORT, () => {
    console.log(`Secure server listening on https://localhost:${PORT}`);
  });

  return server;
}

start().catch((error) => {
  console.error('Unable to start server:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});
