const mongoose = require('mongoose');

const bookingSeatSchema = new mongoose.Schema({
  seatNumber: { type: String, required: true },
  seatType: { type: String, enum: ['vip', 'premium', 'normal', 'prime', 'classic'], default: 'normal' },
  price: { type: Number, required: true },
});

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      default: null,
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      default: null,
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      default: null,
    },
    showDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    movieDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    theatreDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    transactionId: {
      type: String,
      default: '',
    },
    paymentMethod: {
      type: String,
      default: 'Card',
    },
    auditTrail: {
      type: Array,
      default: [],
    },
    seats: [bookingSeatSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    bookingStatus: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
      index: true,
    },
    qrCodeData: {
      type: String,
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
