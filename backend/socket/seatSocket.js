const Seat = require('../models/Seat');

const setupSeatSocket = (io) => {
  io.on('connection', (socket) => {
    // console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join room for a specific show
    socket.on('join_show', ({ showId }) => {
      if (showId) {
        socket.join(`show_${showId}`);
        // console.log(`Socket ${socket.id} joined room: show_${showId}`);
      }
    });

    // Leave room
    socket.on('leave_show', ({ showId }) => {
      if (showId) {
        socket.leave(`show_${showId}`);
      }
    });

    // User is selecting / holding seats (real-time lock preview)
    socket.on('select_seats', async ({ showId, seatNumbers, userId }) => {
      try {
        if (!showId || !seatNumbers) return;

        // Broadcast to other viewers in the same show room
        socket.to(`show_${showId}`).emit('seats_locked_by_other', {
          seatNumbers,
          lockedBy: userId || 'Another User',
        });
      } catch (err) {
        console.error('[Socket Error select_seats]:', err.message);
      }
    });

    // User released / deselected seats
    socket.on('release_seats', async ({ showId, seatNumbers }) => {
      try {
        if (!showId || !seatNumbers) return;

        socket.to(`show_${showId}`).emit('seats_released', {
          seatNumbers,
        });
      } catch (err) {
        console.error('[Socket Error release_seats]:', err.message);
      }
    });

    // Seats successfully booked
    socket.on('seats_booked', ({ showId, seatNumbers }) => {
      if (showId && seatNumbers) {
        io.to(`show_${showId}`).emit('seats_booked_broadcast', {
          seatNumbers,
        });
      }
    });

    socket.on('disconnect', () => {
      // console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSeatSocket;
