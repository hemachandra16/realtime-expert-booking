const mongoose = require('mongoose');

const expertSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  experience: { type: Number, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  totalSessions: { type: Number, default: 0 },
  bio: { type: String, required: true },
  languages: [{ type: String }],
  pricePerSession: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Expert', expertSchema);
