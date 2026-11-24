const Show = require('../models/Show');
const Seat = require('../models/Seat');
const Theatre = require('../models/Theatre');
const mongoose = require('mongoose');

// Helper function to generate seats for a new show
const generateSeatsForShow = async (showId, rowsCount = 8, colsCount = 10, ticketPrices) => {
  const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seats = [];

  for (let r = 0; r < Math.min(rowsCount, rowLetters.length); r++) {
    const rowChar = rowLetters[r];
    // A-B: VIP, C-E: Premium, F-H: Normal
    let type = 'normal';
    let price = ticketPrices?.normal || 180;

    if (r < 2) {
      type = 'vip';
      price = ticketPrices?.vip || 350;
    } else if (r < 5) {
      type = 'premium';
      price = ticketPrices?.premium || 250;
    }

    for (let c = 1; c <= colsCount; c++) {
      seats.push({
        show: showId,
        seatNumber: `${rowChar}${c}`,
        row: rowChar,
        col: c,
        seatType: type,
        price,
        status: 'available',
      });
    }
  }

  await Seat.insertMany(seats);
};

// @desc    Get shows with filters (by movie, theatre, date)
// @route   GET /api/shows
// @access  Public
const getShows = async (req, res, next) => {
  try {
    const { movie, theatre, date } = req.query;
    const query = {};

    if (movie) query.movie = movie;
    if (theatre) query.theatre = theatre;
    if (date) query.showDate = date;

    const shows = await Show.find(query)
      .populate('movie', 'title posterImage duration language rating certificate')
      .populate('theatre', 'name location city address amenities')
      .sort({ showTime: 1 });

    return res.json({ success: true, count: shows.length, data: shows });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single show details and its seats
// @route   GET /api/shows/:id
// @access  Public
const getShowById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }
    const show = await Show.findById(req.params.id)
      .populate('movie')
      .populate('theatre');

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    // Clean up expired locked seats (older than 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    await Seat.updateMany(
      { show: show._id, status: 'locked', lockedAt: { $lt: fiveMinutesAgo } },
      { $set: { status: 'available', lockedBy: null, lockedAt: null } }
    );

    const seats = await Seat.find({ show: show._id }).sort({ row: 1, col: 1 });

    return res.json({
      success: true,
      data: {
        show,
        seats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new show schedule & auto-generate seat layout
// @route   POST /api/shows
// @access  Private/Admin
const createShow = async (req, res, next) => {
  try {
    const { movie, theatre, screenNumber, screenFormat, showDate, showTime, ticketPrices } = req.body;

    if (!movie || !theatre || !showDate || !showTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide movie, theatre, showDate, and showTime',
      });
    }

    const theatreDoc = await Theatre.findById(theatre);
    const screenNum = screenNumber || 1;
    const screenObj = theatreDoc?.screens?.find((s) => s.screenNumber === screenNum);

    const totalSeats = screenObj ? screenObj.totalSeats : 80;
    const rows = screenObj ? screenObj.rows : 8;
    const cols = screenObj ? screenObj.cols : 10;

    const show = await Show.create({
      movie,
      theatre,
      screenNumber: screenNum,
      screenFormat: screenFormat || screenObj?.format || 'Dolby Atmos',
      showDate,
      showTime,
      ticketPrices: ticketPrices || { vip: 350, premium: 250, normal: 180 },
      totalSeats,
      availableSeats: totalSeats,
    });

    // Generate seats
    await generateSeatsForShow(show._id, rows, cols, show.ticketPrices);

    const populatedShow = await Show.findById(show._id).populate('movie').populate('theatre');

    return res.status(201).json({
      success: true,
      message: 'Show created and seat layout generated successfully',
      data: populatedShow,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete show and associated seats
// @route   DELETE /api/shows/:id
// @access  Private/Admin
const deleteShow = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    await Seat.deleteMany({ show: show._id });
    await Show.findByIdAndDelete(req.params.id);

    return res.json({ success: true, message: 'Show and seats deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getShows,
  getShowById,
  createShow,
  deleteShow,
};
