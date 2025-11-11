const db = require('../db');

// Create a new booking
exports.createBooking = (req, res) => {
    const { user_id, helper_id, booking_date, start_time, end_time } = req.body;

    if (!user_id || !helper_id || !booking_date || !start_time || !end_time) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }

    const query = "INSERT INTO bookings (user_id, helper_id, booking_date, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, 'Requested')";

    db.query(query, [user_id, helper_id, booking_date, start_time, end_time], (err, result) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Booking."
            });
            return;
        }
        res.status(201).send({ 
            message: "Booking was created successfully!", 
            bookingId: result.insertId 
        });
    });
};

// Get all bookings for a specific household user
exports.getHouseholdBookings = (req, res) => {
    const userId = req.params.id;
    const query = `
        SELECT 
            b.booking_id, b.booking_date, b.start_time, b.end_time, b.status,
            h.name AS helper_name, h.skill_type, h.rate_per_hour
        FROM bookings b
        JOIN helpers h ON b.helper_id = h.helper_id
        WHERE b.user_id = ?
        ORDER BY b.booking_date DESC, b.start_time DESC;
    `;
    db.query(query, [userId], (err, results) => {
        if (err) {
            res.status(500).send({ message: err.message || "Error retrieving household bookings." });
            return;
        }
        res.json(results);
    });
};

// Get all 'Requested' bookings for a specific helper
exports.getHelperRequests = (req, res) => {
    const helperId = req.params.id;
    const query = `
        SELECT 
            b.booking_id, b.booking_date, b.start_time, b.end_time, b.status,
            u.name AS user_name, u.address
        FROM bookings b
        JOIN users u ON b.user_id = u.user_id
        WHERE b.helper_id = ? AND b.status = 'Requested'
        ORDER BY b.booking_date ASC, b.start_time ASC;
    `;
    db.query(query, [helperId], (err, results) => {
        if (err) {
            res.status(500).send({ message: err.message || "Error retrieving helper requests." });
            return;
        }
        res.json(results);
    });
};

// Update the status of a booking (Accept/Decline)
exports.updateBookingStatus = (req, res) => {
    const bookingId = req.params.id;
    const { status } = req.body;

    if (!status || !['Confirmed', 'Declined'].includes(status)) {
        return res.status(400).send({ message: "Invalid status provided. Must be 'Confirmed' or 'Declined'." });
    }

    const query = "UPDATE bookings SET status = ? WHERE booking_id = ?";
    db.query(query, [status, bookingId], (err, result) => {
        if (err) {
            res.status(500).send({ message: err.message || "Error updating booking status." });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send({ message: `Booking with ID ${bookingId} not found.` });
            return;
        }
        res.status(200).send({ message: `Booking ${bookingId} status updated to ${status}.` });
    });
};