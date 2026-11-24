const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Movie description is required'],
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      index: true,
    },
    industry: {
      type: String,
      enum: ['Hollywood', 'Bollywood', 'Tollywood', 'Other'],
      default: 'Hollywood',
      index: true,
    },
    genre: {
      type: [String],
      required: [true, 'At least one genre is required'],
      index: true,
    },
    duration: {
      type: Number, // in minutes
      required: [true, 'Duration in minutes is required'],
    },
    releaseDate: {
      type: Date,
      required: [true, 'Release date is required'],
    },
    posterImage: {
      type: String,
      required: [true, 'Poster image URL is required'],
    },
    bannerImage: {
      type: String,
      default: '',
    },
    trailerUrl: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 8.5,
      min: 0,
      max: 10,
    },
    status: {
      type: String,
      enum: ['now_showing', 'coming_soon'],
      default: 'now_showing',
      index: true,
    },
    director: {
      type: String,
      default: 'Director',
    },
    cast: {
      type: [String],
      default: [],
    },
    certificate: {
      type: String,
      default: 'UA',
    },
  },
  {
    timestamps: true,
  }
);

// Compound text search index on title and description
movieSchema.index({ title: 'text', description: 'text' });
movieSchema.index({ industry: 1, status: 1 });

module.exports = mongoose.model('Movie', movieSchema);
