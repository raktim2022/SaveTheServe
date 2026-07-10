import logger from '../utils/logger.js';

/**
 * Handle real-time tracking events for volunteers, donors, and NGOs
 * @param {Socket} socket - Socket.io socket instance
 * @param {Server} io - Socket.io server instance
 */
export function handleTrackingSockets(socket, io) {
  // Join a tracking room for a specific food request
  socket.on('tracking:join', (data) => {
    const { requestId } = data || {};
    if (!requestId) return;

    const roomName = `request:track:${requestId}`;
    socket.join(roomName);
    logger.info(`[Tracking] 🚀 Socket ${socket.id} (user=${socket.userId}, role=${socket.userRole}) joined tracking room: ${roomName}`);
  });

  // Leave a tracking room
  socket.on('tracking:leave', (data) => {
    const { requestId } = data || {};
    if (!requestId) return;

    const roomName = `request:track:${requestId}`;
    socket.leave(roomName);
    logger.info(`[Tracking] 🔌 Socket ${socket.id} (user=${socket.userId}) left tracking room: ${roomName}`);
  });

  // Volunteer emits location updates
  socket.on('tracking:location_update', (data) => {
    const { requestId, lat, lng } = data || {};
    if (!requestId || lat === undefined || lng === undefined) {
      logger.warn(`[Tracking] ⚠️ Invalid location payload from socket ${socket.id}:`, data);
      return;
    }

    const roomName = `request:track:${requestId}`;
    
    // Broadcast coordinate details to everyone else in the request room
    socket.to(roomName).emit('tracking:location_changed', {
      requestId,
      lat,
      lng,
      timestamp: new Date().toISOString()
    });

    logger.debug(`[Tracking] 📡 Location update broadcasted for request ${requestId}: lat=${lat}, lng=${lng}`);
  });
}
