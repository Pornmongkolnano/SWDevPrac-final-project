const Favorite = require('../models/Favorite');
const CoworkingSpace = require('../models/CoworkingSpace');

// @desc    Get all favorites for current user
// @route   GET /api/v1/favorites
// @access  Private
exports.getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id }).populate({
      path: 'coworkingSpace',
      select: 'name address tel openTime closeTime'
    });

    res.status(200).json({
      success: true,
      count: favorites.length,
      data: favorites
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Add a favorite space
// @route   POST /api/v1/favorites
// @access  Private
exports.addFavorite = async (req, res, next) => {
  try {
    const { coworkingSpaceId } = req.body;

    const space = await CoworkingSpace.findById(coworkingSpaceId);
    if (!space) {
      return res.status(404).json({ success: false, message: `No space with the id of ${coworkingSpaceId}` });
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
        user: req.user.id,
        coworkingSpace: coworkingSpaceId
    });

    if (existingFavorite) {
        return res.status(400).json({ success: false, message: 'Space already in favorites' });
    }

    const favorite = await Favorite.create({
      user: req.user.id,
      coworkingSpace: coworkingSpaceId
    });

    res.status(200).json({
      success: true,
      data: favorite
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Remove a favorite (using Space ID)
// @route   DELETE /api/v1/favorites/:spaceId
// @access  Private
exports.removeFavorite = async (req, res, next) => {
  try {
    // We delete by finding the User ID + Space ID combination
    // This is easier for frontend "toggle" logic than finding the Favorite ID first
    const favorite = await Favorite.findOneAndDelete({
        user: req.user.id,
        coworkingSpace: req.params.spaceId
    });

    if (!favorite) {
      return res.status(404).json({ success: false, message: 'Favorite not found or already removed' });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};