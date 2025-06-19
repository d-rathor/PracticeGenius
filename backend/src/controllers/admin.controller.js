const User = require('../models/user.model');
const Worksheet = require('../models/worksheet.model');
const asyncHandler = require('../utils/async-handler');

/**
 * @route   GET /api/admin/stats
 * @desc    Get admin dashboard stats
 * @access  Private/Admin
 */
exports.getStats = asyncHandler(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const totalWorksheets = await Worksheet.countDocuments();

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalWorksheets,
    },
  });
});
