require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const ensureAdmin = require('./config/ensureAdmin');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:4200', 'http://127.0.0.1:4200', process.env.CLIENT_URL].filter(Boolean),
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket.IO event handling
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Client joins specific user room for order tracking
  socket.on('join_user_room', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`[Socket.IO] Client ${socket.id} joined room user_${userId}`);
    }
  });

  // Client joins specific order tracking room
  socket.on('join_order_room', (orderId) => {
    if (orderId) {
      socket.join(`order_${orderId}`);
      console.log(`[Socket.IO] Client ${socket.id} joined order room order_${orderId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Attach io instance to express app so controllers can access via req.app.get('io')
app.set('io', io);

// Start Server after Database Connection
const startServer = async () => {
  try {
    await connectDB();
    await ensureAdmin();

    server.listen(PORT, () => {
      console.log(`[Server] Sweet & Savory API is running on http://localhost:${PORT}`);
      console.log(`[Environment] Mode: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('[Server Start Error]:', error.message);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[Unhandled Rejection]', err.message);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]', err.message);
  process.exit(1);
});
