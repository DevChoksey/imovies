const Theatre = require('../models/Theatre');

// @desc    Get all theatres with optional city filter
// @route   GET /api/theatres
// @access  Public
const getTheatres = async (req, res, next) => {
  try {
    const { city } = req.query;
    const query = {};
    if (city && city !== 'All') {
      query.city = { $regex: new RegExp(city, 'i') };
    }

    const theatres = await Theatre.find(query).sort({ name: 1 });
    return res.json({ success: true, count: theatres.length, data: theatres });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single theatre by ID
// @route   GET /api/theatres/:id
// @access  Public
const getTheatreById = async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) {
      return res.status(404).json({ success: false, message: 'Theatre not found' });
    }
    return res.json({ success: true, data: theatre });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new theatre
// @route   POST /api/theatres
// @access  Private/Admin
const createTheatre = async (req, res, next) => {
  try {
    const { name, location, address, city, screens, amenities } = req.body;

    if (!name || !location || !address || !city) {
      return res.status(400).json({ success: false, message: 'Please provide name, location, address, and city' });
    }

    const theatre = await Theatre.create({
      name,
      location,
      address,
      city,
      screens: screens && screens.length > 0 ? screens : [
        { screenNumber: 1, name: 'Audi 1 - Dolby Atmos', format: 'Dolby Atmos', totalSeats: 80, rows: 8, cols: 10 },
        { screenNumber: 2, name: 'Audi 2 - IMAX 3D', format: 'IMAX 3D', totalSeats: 80, rows: 8, cols: 10 },
      ],
      amenities: amenities || ['Dolby Atmos', '4K Projection', 'Food & Snacks', 'Recliner Seats', 'Valet Parking'],
    });

    return res.status(201).json({ success: true, message: 'Theatre added successfully', data: theatre });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete theatre
// @route   DELETE /api/theatres/:id
// @access  Private/Admin
const deleteTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) {
      return res.status(404).json({ success: false, message: 'Theatre not found' });
    }
    await Theatre.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Theatre deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTheatres,
  getTheatreById,
  createTheatre,
  deleteTheatre,
};
