const Movie = require('../models/Movie');
const mongoose = require('mongoose');

// @desc    Get all movies with search, filters & pagination
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res, next) => {
  try {
    const { search, genre, language, industry, status, page = 1, limit = 50, sort } = req.query;

    const query = {};

    // Search by title or description
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by genre
    if (genre && genre !== 'All') {
      query.genre = { $in: [new RegExp(genre, 'i')] };
    }

    // Filter by language
    if (language && language !== 'All') {
      query.language = { $regex: new RegExp(language, 'i') };
    }

    // Filter by industry (Hollywood, Bollywood) with smart fallback
    if (industry && industry !== 'All') {
      if (industry.toLowerCase() === 'hollywood') {
        query.$or = [
          { industry: 'Hollywood' },
          { language: { $regex: /english/i } },
        ];
      } else if (industry.toLowerCase() === 'bollywood') {
        query.$or = [
          { industry: 'Bollywood' },
          { language: { $regex: /hindi/i } },
        ];
      } else {
        query.industry = industry;
      }
    }

    // Filter by status (now_showing, coming_soon)
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    let sortBy = { releaseDate: -1 };
    if (sort === 'rating') sortBy = { rating: -1 };
    if (sort === 'title') sortBy = { title: 1 };
    if (sort === 'newest') sortBy = { releaseDate: -1 };

    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit));

    return res.json({
      success: true,
      count: movies.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: movies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single movie by ID
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res, next) => {
  try {
    let movie = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      movie = await Movie.findById(req.params.id);
    }
    
    // Also try finding by slug or title match if not found by ObjectId
    if (!movie) {
      movie = await Movie.findOne({
        $or: [
          { _id: req.params.id },
          { title: { $regex: new RegExp(`^${req.params.id.replace(/[-_]/g, ' ')}`, 'i') } }
        ]
      }).catch(() => null);
    }

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    return res.json({ success: true, data: movie });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new movie
// @route   POST /api/movies
// @access  Private/Admin
const createMovie = async (req, res, next) => {
  try {
    const {
      title,
      description,
      language,
      industry,
      genre,
      duration,
      releaseDate,
      posterImage,
      bannerImage,
      trailerUrl,
      rating,
      status,
      director,
      cast,
      certificate,
    } = req.body;

    if (!title || !description || !language || !genre || !duration || !releaseDate || !posterImage) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, language, genre, duration, releaseDate, and posterImage',
      });
    }

    const movie = await Movie.create({
      title,
      description,
      language,
      industry: industry || 'Hollywood',
      genre: Array.isArray(genre) ? genre : genre.split(',').map((g) => g.trim()),
      duration: Number(duration),
      releaseDate,
      posterImage,
      bannerImage: bannerImage || posterImage,
      trailerUrl: trailerUrl || '',
      rating: rating ? Number(rating) : 8.0,
      status: status || 'now_showing',
      director: director || 'Director',
      cast: Array.isArray(cast) ? cast : cast ? cast.split(',').map((c) => c.trim()) : [],
      certificate: certificate || 'UA',
    });

    return res.status(201).json({ success: true, message: 'Movie added successfully', data: movie });
  } catch (error) {
    next(error);
  }
};

// @desc    Update movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res, next) => {
  try {
    let movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    if (req.body.genre && !Array.isArray(req.body.genre)) {
      req.body.genre = req.body.genre.split(',').map((g) => g.trim());
    }
    if (req.body.cast && !Array.isArray(req.body.cast)) {
      req.body.cast = req.body.cast.split(',').map((c) => c.trim());
    }

    movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.json({ success: true, message: 'Movie updated successfully', data: movie });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    await Movie.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Movie removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
};
