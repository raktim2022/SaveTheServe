
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.config.js';

let io = null;

/**
 * Initialize Socket.IO server
 */
export function initializeSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: config.ALLOWED_ORIGINS || ['http://localhost:3002', 'http://localhost:3001', 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['polling', 'websocket'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      console.warn('[Socket.IO] ⚠️ No token provided');
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      socket.userId = decoded.userId || decoded.id;
      socket.userRole = decoded.role;
      socket.userEmail = decoded.email;
      
      console.log(`[Socket.IO] ✅ Authenticated user=${socket.userId} role=${socket.userRole}`);
      next();
    } catch (err) {
      console.error('[Socket.IO] ❌ Token verification failed:', err.message);
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] 🔌 Client connected: ${socket.id} (user=${socket.userId})`);

    // Join user-specific room
    socket.join(`user:${socket.userId}`);
    
    // Join role-specific room
    if (socket.userRole) {
      socket.join(`role:${socket.userRole}`);
    }

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] 🔌 Client disconnected: ${socket.id} (reason=${reason})`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`[Socket.IO] ❌ Socket error for ${socket.id}:`, error);
    });
  });

  console.log('[Socket.IO] ✅ Socket.IO server initialized');
  return io;
}

/**
 * Get Socket.IO instance
 */
export function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket first.');
  }
  return io;
}

/**
 * Emit event to specific user
 */
export function emitToUser(userId, event, data) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

/**
 * Emit event to all users with specific role
 */
export function emitToRole(role, event, data) {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
  }
}

export default { initializeSocket, getIO, emitToUser, emitToRole };
