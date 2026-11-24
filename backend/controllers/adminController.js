const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const User = require('../models/User');
const Show = require('../models/Show');

// @desc    Get Admin Dashboard KPIs and Analytics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalMovies = await Movie.countDocuments();
    const totalTheatres = await Theatre.countDocuments();
    const totalShows = await Show.countDocuments();
    const totalBookings = await Booking.countDocuments();

    // Calculate total revenue from confirmed bookings
    const revenueResult = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed', paymentStatus: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$grandTotal' }, totalTickets: { $sum: { $size: '$seats' } } } },
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    const totalTicketsSold = revenueResult.length > 0 ? revenueResult[0].totalTickets : 0;

    // Recent 5 bookings
    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('movie', 'title posterImage')
      .populate('theatre', 'name city')
      .sort({ createdAt: -1 })
      .limit(5);

    // Revenue group by last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyRevenue = await Booking.aggregate([
      {
        $match: {
          bookingStatus: 'confirmed',
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$grandTotal' },
          bookingsCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return res.json({
      success: true,
      stats: {
        totalRevenue,
        totalBookings,
        totalTicketsSold,
        totalUsers,
        totalMovies,
        totalTheatres,
        totalShows,
      },
      recentBookings,
      dailyRevenue,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
};
