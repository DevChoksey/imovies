const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const Seat = require('../models/Seat');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const QRCode = require('qrcode');
const { sendBookingConfirmationEmail } = require('../services/emailService');

// Normalize populated DB booking vs catalog snapshot booking into a single frontend-ready object
const normalizeBookingOutput = (bookingDoc) => {
  const obj = bookingDoc.toObject ? bookingDoc.toObject() : { ...bookingDoc };
  return {
    ...obj,
    movie: obj.movie || obj.movieDetails || { title: 'Movie Show' },
    theatre: obj.theatre || obj.theatreDetails || { name: 'IMovies Cinema' },
    show: obj.show || obj.showDetails || {},
    seatNumbers: Array.isArray(obj.seats) ? obj.seats.map((s) => s.seatNumber) : [],
  };
};

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
    const {
      showId,
      seatNumbers,
      seats: clientSeats,
      paymentMethod,
      cardLast4,
      upiId,
      movieDetails,
      theatreDetails,
      showDetails,
    } = req.body;

    if (!showId || !seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one seat' });
    }

    const isObjectIdShow = mongoose.Types.ObjectId.isValid(showId);
    let show = null;
    let bookingSeats = [];

    if (isObjectIdShow) {
      show = await Show.findById(showId).populate('movie').populate('theatre');
      if (!show) {
        return res.status(404).json({ success: false, message: 'Show not found' });
      }

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

      const seatsInDb = await Seat.find({
        show: showId,
        seatNumber: { $in: seatNumbers },
      });

      bookingSeats = seatsInDb.map((s) => ({
        seatNumber: s.seatNumber,
        seatType: s.seatType,
        price: s.price,
      }));
    } else {
      // Static catalog show booking (e.g. Indore showtimes)
      bookingSeats = (Array.isArray(clientSeats) && clientSeats.length > 0 ? clientSeats : seatNumbers).map((item) => {
        if (typeof item === 'string') {
          const isPrime = ['J', 'H', 'G', 'F', 'E'].includes(item.charAt(0).toUpperCase());
          return {
            seatNumber: item,
            seatType: isPrime ? 'prime' : 'classic',
            price: isPrime ? 800 : 720,
          };
        }
        return {
          seatNumber: item.seatNumber,
          seatType: ['vip', 'premium', 'normal', 'prime', 'classic'].includes(item.seatType) ? item.seatType : 'prime',
          price: Number(item.price) || 800,
        };
      });
    }

    const totalAmount = bookingSeats.reduce((acc, curr) => acc + curr.price, 0);
    const taxAmount = Math.round(totalAmount * 0.18);
    const grandTotal = totalAmount + taxAmount;

    const bookingId = generateBookingId();
    const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const nowFormatted = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const movieTitle = show?.movie?.title || movieDetails?.title || 'Avengers: Doomsday';
    const theatreName = show?.theatre?.name || theatreDetails?.name || 'PVR: Treasure Island Mall, Indore';
    const showDateLabel = show?.showDate || showDetails?.showDateDisplay || showDetails?.showDate || 'Thu, 17 December, 2026';
    const showTimeLabel = show?.showTime || showDetails?.showTime || '11:05 AM';

    const qrData = JSON.stringify({
      bookingId,
      movie: movieTitle,
      theatre: theatreName,
      date: showDateLabel,
      time: showTimeLabel,
      seats: seatNumbers,
      amount: grandTotal,
    });
    const qrCodeData = await QRCode.toDataURL(qrData);

    const paymentMethodLabel =
      paymentMethod === 'upi' ? 'UPI / QR' : paymentMethod === 'netbanking' ? 'Net Banking' : 'Credit/Debit Card';

    const auditTrail = [
      {
        action: 'SEATS_RESERVED',
        description: `Seats ${seatNumbers.join(', ')} reserved in ${theatreName}`,
        timestamp: nowFormatted,
        operator: 'SYSTEM_BOOKING_ENGINE',
      },
      {
        action: 'PAYMENT_AUTHORIZATION',
        description: `Amount ₹${grandTotal} authorized via ${(paymentMethod || 'card').toUpperCase()} (Ref: ${transactionId})`,
        timestamp: nowFormatted,
        operator: 'PAYMENT_GATEWAY',
      },
      {
        action: 'TICKET_CONFIRMATION',
        description: `Digital M-Ticket generated for ${seatNumbers.length} seat(s). Dispatched to ${req.user?.email || 'user'}`,
        timestamp: nowFormatted,
        operator: 'IMOVIES_DISPATCH',
      },
    ];

    const booking = await Booking.create({
      bookingId,
      user: req.user.id,
      show: isObjectIdShow ? show._id : null,
      movie: isObjectIdShow ? show.movie._id : null,
      theatre: isObjectIdShow ? show.theatre._id : null,
      showDetails: isObjectIdShow ? null : (showDetails || { _id: showId, showTime: showTimeLabel, showDateDisplay: showDateLabel }),
      movieDetails: isObjectIdShow ? null : (movieDetails || { title: movieTitle }),
      theatreDetails: isObjectIdShow ? null : (theatreDetails || { name: theatreName }),
      seats: bookingSeats,
      totalAmount,
      taxAmount,
      grandTotal,
      paymentStatus: 'completed',
      bookingStatus: 'confirmed',
      transactionId,
      paymentMethod: paymentMethodLabel,
      auditTrail,
      qrCodeData,
    });

    if (isObjectIdShow) {
      await Seat.updateMany(
        { show: showId, seatNumber: { $in: seatNumbers } },
        { $set: { status: 'booked', lockedBy: null, lockedAt: null } }
      );
      await Show.findByIdAndUpdate(showId, {
        $inc: { availableSeats: -seatNumbers.length },
      });
    }

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

    await Notification.create({
      user: req.user.id,
      title: 'Booking Confirmed!',
      message: `Your booking (${bookingId}) for "${movieTitle}" at ${showTimeLabel} has been confirmed.`,
      type: 'booking',
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('movie')
      .populate('theatre')
      .populate('show')
      .populate('user', 'name email phone');

    const normalizedBooking = normalizeBookingOutput(populatedBooking);

    sendBookingConfirmationEmail(normalizedBooking, req.user?.email).catch((e) =>
      console.warn('Background email dispatch notice:', e.message)
    );

    return res.status(201).json({
      success: true,
      message: 'Tickets booked successfully!',
      data: normalizedBooking,
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
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    const normalized = bookings.map(normalizeBookingOutput);
    return res.json({ success: true, count: normalized.length, data: normalized });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking details by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const query = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { _id: req.params.id }
      : { bookingId: req.params.id };

    const booking = await Booking.findOne(query)
      .populate('movie')
      .populate('theatre')
      .populate('show')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    return res.json({ success: true, data: normalizeBookingOutput(booking) });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking & process refund
// @route   POST /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const query = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { _id: req.params.id }
      : { bookingId: req.params.id };

    const booking = await Booking.findOne(query).populate('show');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    const seatNumbers = booking.seats.map((s) => s.seatNumber);
    if (booking.show && booking.show._id) {
      await Seat.updateMany(
        { show: booking.show._id, seatNumber: { $in: seatNumbers } },
        { $set: { status: 'available', lockedBy: null, lockedAt: null } }
      );

      await Show.findByIdAndUpdate(booking.show._id, {
        $inc: { availableSeats: seatNumbers.length },
      });
    }

    const refundAmount = Math.round(booking.grandTotal * 0.9);
    const reasonText = req.body.reason || 'User requested cancellation';

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.refundAmount = refundAmount;
    booking.cancellationReason = reasonText;
    booking.auditTrail = [
      ...(booking.auditTrail || []),
      {
        action: 'TICKET_CANCELLED',
        description: `Booking cancelled by user. Reason: "${reasonText}". 90% refund of ₹${refundAmount} processed.`,
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }),
        operator: 'USER_PORTAL',
      },
    ];
    await booking.save();

    await Payment.findOneAndUpdate(
      { booking: booking._id },
      { $set: { status: 'refunded' } }
    );

    await Notification.create({
      user: booking.user,
      title: 'Booking Cancelled',
      message: `Your booking (${booking.bookingId}) has been cancelled. Refund of ₹${refundAmount} has been initiated.`,
      type: 'cancellation',
    });

    return res.json({
      success: true,
      message: `Booking cancelled successfully. Refund of ₹${refundAmount} processed.`,
      data: normalizeBookingOutput(booking),
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
