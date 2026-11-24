const mongoose = require('mongoose');

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
      index: true,
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true,
      index: true,
    },
    screenNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    screenFormat: {
      type: String,
      default: 'Dolby Atmos',
    },
    showDate: {
      type: String, // format: YYYY-MM-DD
      required: true,
      index: true,
    },
    showTime: {
      type: String, // format: '10:00 AM', '01:30 PM', '06:45 PM'
      required: true,
    },
    ticketPrices: {
      vip: {
        type: Number,
        default: 350,
      },
      premium: {
        type: Number,
        default: 250,
      },
      normal: {
        type: Number,
        default: 180,
      },
    },
    totalSeats: {
      type: Number,
      default: 80,
    },
    availableSeats: {
      type: Number,
      default: 80,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying shows by movie, theatre, and date
showSchema.index({ movie: 1, showDate: 1 });
showSchema.index({ theatre: 1, showDate: 1 });

module.exports = mongoose.model('Show', showSchema);
