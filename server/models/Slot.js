const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  expertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expert', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  isBooked: { type: Boolean, default: false },
  bookedBy: { type: String, default: null }
}, { timestamps: true });

slotSchema.index({ expertId: 1, date: 1 });

module.exports = mongoose.model('Slot', slotSchema);
