const { validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const Expert = require('../models/Expert');

// POST /api/bookings - Create a booking with atomic slot lock
exports.createBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { expertId, slotId, name, email, phone, date, timeSlot, notes } = req.body;

    // Atomic findOneAndUpdate to prevent race conditions
    const slot = await Slot.findOneAndUpdate(
      { _id: slotId, isBooked: false },
      { $set: { isBooked: true, bookedBy: email } },
      { returnDocument: 'after' }
    );

    if (!slot) {
      return res.status(409).json({ error: 'Slot already booked' });
    }

    const booking = await Booking.create({
      expertId,
      slotId,
      name,
      email,
      phone,
      date,
      timeSlot,
      notes: notes || ''
    });

    // Increment totalSessions on the expert
    await Expert.findByIdAndUpdate(expertId, { $inc: { totalSessions: 1 } });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`expert-${expertId}`).emit('slot-booked', {
        slotId: slot._id,
        expertId,
        date: slot.date,
        time: slot.time
      });
    }

    const populatedBooking = await Booking.findById(booking._id).populate('expertId', 'name category');

    res.status(201).json(populatedBooking);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/bookings/:id/status - Update booking status
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: 'after' }
    ).populate('expertId', 'name category');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings?email= - Get bookings by email
exports.getBookings = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email query parameter is required' });
    }

    const bookings = await Booking.find({ email })
      .populate('expertId', 'name category')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    next(err);
  }
};
