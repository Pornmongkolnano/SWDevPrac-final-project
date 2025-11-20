const express = require('express');
const { getFavorites, addFavorite, removeFavorite } = require('../controllers/favorites');

// Import 'protect' middleware to ensure user is logged in
const { protect } = require('../middleware/auth'); // Adjust path if your middleware is elsewhere

const router = express.Router();

router.use(protect); // All favorite routes require login

router.route('/')
  .get(protect,getFavorites)
  .post(protect,addFavorite);

router.route('/:spaceId')
  .delete(protect,removeFavorite);

module.exports = router;