const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
  screenNumber: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    default: 'Screen 1',
  },
  format: {
    type: String,
    enum: ['IMAX 2D', 'IMAX 3D', '4DX', 'Dolby Atmos', 'Standard 2D'],
    default: 'Dolby Atmos',
  },
  totalSeats: {
    type: Number,
    default: 80,
  },
  rows: {
    type: Number,
    default: 8,
  },
  cols: {
    type: Number,
    default: 10,
  },
});

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theatre name is required'],
      trim: true,
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Location/Area is required'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      index: true,
    },
    screens: [screenSchema],
    amenities: {
      type: [String],
      default: ['Parking', 'Food Court', 'Wheelchair Accessible', 'Dolby 7.1'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Theatre', theatreSchema);
