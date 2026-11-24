const Booking = require('../models/Booking');
const Show = require('../models/Show');
const Seat = require('../models/Seat');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const QRCode = require('qrcode');
const { sendBookingConfirmationEmail } = require('../services/emailService');

// Helper to generate unique booking ID
const generateBookingId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `IMV-${Date.now().toString().slice(-4)}-${code}`;
};

// @desc    Create new booking and mark seats booked
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const { showId, seatNumbers, paymentMethod, cardLast4, upiId } = req.body;

    if (!showId || !seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one seat' });
    }

    const show = await Show.findById(showId).populate('movie').populate('theatre');
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    // Check if any seat is already booked
    const conflictingSeats = await Seat.find({
      show: showId,
      seatNumber: { $in: seatNumbers },
      status: 'booked',
    });

    if (conflictingSeats.length > 0) {
      const bookedList = conflictingSeats.map((s) => s.seatNumber).join(', ');
      return res.status(400).json({
        success: false,
        message: `Seat(s) ${bookedList} have already been booked by another user. Please choose different seats.`,
      });
    }

    // Retrieve seat documents to compute prices
    const seatsInDb = await Seat.find({
      show: showId,
      seatNumber: { $in: seatNumbers },
    });

    const bookingSeats = seatsInDb.map((s) => ({
      seatNumber: s.seatNumber,
      seatType: s.seatType,
      price: s.price,
    }));

    const totalAmount = bookingSeats.reduce((acc, curr) => acc + curr.price, 0);
    const taxAmount = Math.round(totalAmount * 0.18); // 18% GST / convenience fee
    const grandTotal = totalAmount + taxAmount;

    const bookingId = generateBookingId();

    // Generate QR Code data URL
    const qrData = JSON.stringify({
      bookingId,
      movie: show.movie.title,
      theatre: show.theatre.name,
      date: show.showDate,
      time: show.showTime,
      seats: seatNumbers,
      amount: grandTotal,
    });
    const qrCodeData = await QRCode.toDataURL(qrData);

    // Create Booking record
    const booking = await Booking.create({
      bookingId,
      user: req.user.id,
      show: show._id,
      movie: show.movie._id,
      theatre: show.theatre._id,
      seats: bookingSeats,
      totalAmount,
      taxAmount,
      grandTotal,
      paymentStatus: 'completed',
      bookingStatus: 'confirmed',
      qrCodeData,
    });

    // Mark seats as booked
    await Seat.updateMany(
      { show: showId, seatNumber: { $in: seatNumbers } },
      { $set: { status: 'booked', lockedBy: null, lockedAt: null } }
    );

    // Decrement available seats count on show
    await Show.findByIdAndUpdate(showId, {
      $inc: { availableSeats: -seatNumbers.length },
    });

    // Create payment transaction record
    const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    await Payment.create({
      booking: booking._id,
      user: req.user.id,
      amount: grandTotal,
      paymentMethod: paymentMethod || 'card',
      transactionId,
      status: 'success',
      paymentDetails: {
        cardLast4: cardLast4 || '4242',
        upiId: upiId || '',
      },
    });

    // Create notification for user
    await Notification.create({
      user: req.user.id,
      title: 'Booking Confirmed!',
      message: `Your booking (${bookingId}) for "${show.movie.title}" on ${show.showDate} at ${show.showTime} has been confirmed.`,
      type: 'booking',
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('movie')
      .populate('theatre')
      .populate('show');

    // Trigger confirmation email
    sendBookingConfirmationEmail(populatedBooking, req.user?.email).catch((e) =>
      console.warn('Background email dispatch notice:', e.message)
    );

    return res.status(201).json({
      success: true,
      message: 'Tickets booked successfully!',
      data: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's bookings (upcoming & past)
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('movie')
      .populate('theatre')
      .populate('show')
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking details by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('movie')
      .populate('theatre')
      .populate('show')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Ensure user owns booking or is admin
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    return res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking & process refund
// @route   POST /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('show');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    // Release seats
    const seatNumbers = booking.seats.map((s) => s.seatNumber);
    await Seat.updateMany(
      { show: booking.show._id, seatNumber: { $in: seatNumbers } },
      { $set: { status: 'available', lockedBy: null, lockedAt: null } }
    );

    // Increase availableSeats on show
    await Show.findByIdAndUpdate(booking.show._id, {
      $inc: { availableSeats: seatNumbers.length },
    });

    // Calculate refund (90% refund after minor cancellation fee)
    const refundAmount = Math.round(booking.grandTotal * 0.9);

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.refundAmount = refundAmount;
    booking.cancellationReason = req.body.reason || 'User requested cancellation';
    await booking.save();

    // Update payment record
    await Payment.findOneAndUpdate(
      { booking: booking._id },
      { $set: { status: 'refunded' } }
    );

    // Notification
    await Notification.create({
      user: booking.user,
      title: 'Booking Cancelled',
      message: `Your booking (${booking.bookingId}) has been cancelled. Refund of ₹${refundAmount} has been initiated.`,
      type: 'cancellation',
    });

    return res.json({
      success: true,
      message: `Booking cancelled successfully. Refund of ₹${refundAmount} processed.`,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings/admin/all
// @access  Private/Admin
const getAllBookingsAdmin = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email phone')
      .populate('movie', 'title posterImage')
      .populate('theatre', 'name city')
      .populate('show', 'showDate showTime screenNumber')
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Send or Resend confirmation email for booking
// @route   POST /api/bookings/:id/send-email
// @access  Private
const sendBookingEmail = async (req, res, next) => {
  try {
    let booking = null;
    try {
      booking = await Booking.findById(req.params.id)
        .populate('movie')
        .populate('theatre')
        .populate('show')
        .populate('user', 'name email');
    } catch (_) {}

    const recipient = req.body.email || booking?.user?.email || req.user?.email || 'chokseydev@gmail.com';
    const payloadBooking = booking || req.body.booking || {
      _id: req.params.id,
      bookingId: req.params.id,
      movie: { title: 'Avengers: Doomsday' },
      theatre: { name: 'PVR: Treasure Island Mall, Indore' },
      show: { showDateDisplay: 'Thu, 17 December, 2026', showTime: '11:05 AM' },
      grandTotal: req.body.grandTotal || 800,
    };

    const result = await sendBookingConfirmationEmail(payloadBooking, recipient);

    return res.json({
      success: result.success,
      message: result.success
        ? `Confirmation email dispatched to ${recipient}`
        : result.notice || result.error || 'Email dispatch logged',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookingsAdmin,
  sendBookingEmail,
};
