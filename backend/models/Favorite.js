const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  coworkingSpace: {
    type: mongoose.Schema.ObjectId,
    ref: 'CoworkingSpace',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent user from favoriting the same space twice (Unique Compound Index)
FavoriteSchema.index({ user: 1, coworkingSpace: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);