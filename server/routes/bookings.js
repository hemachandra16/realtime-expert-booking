const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  createBooking,
  updateBookingStatus,
  getBookings
} = require('../controllers/bookingController');

// POST /api/bookings - Create booking
router.post(
  '/',
  [
    body('expertId').notEmpty().withMessage('Expert ID is required'),
    body('slotId').notEmpty().withMessage('Slot ID is required'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone')
      .matches(/^\d{10}$/)
      .withMessage('Phone must be exactly 10 digits'),
    body('date').notEmpty().withMessage('Date is required'),
    body('timeSlot').notEmpty().withMessage('Time slot is required')
  ],
  createBooking
);

// PATCH /api/bookings/:id/status - Update status
router.patch(
  '/:id/status',
  [
    body('status')
      .isIn(['Confirmed', 'Completed'])
      .withMessage('Status must be Confirmed or Completed')
  ],
  updateBookingStatus
);

// GET /api/bookings?email= - Get bookings by email
router.get('/', getBookings);

module.exports = router;
