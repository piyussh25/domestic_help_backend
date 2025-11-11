const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookings');

// POST a new booking
router.post('/', bookingsController.createBooking);

// GET all bookings for a specific household user
router.get('/users/:id', bookingsController.getHouseholdBookings);

// GET all 'Requested' bookings for a specific helper
router.get('/helpers/:id/requests', bookingsController.getHelperRequests);

// PUT update the status of a booking
router.put('/:id/status', bookingsController.updateBookingStatus);

module.exports = router;