const db = require('../db');

// Get all helpers
exports.getAllHelpers = (req, res) => {
    const excludedEmails = ['sunita.d@example.com', 'rajesh.k@example.com', 'meena.k@example.com', 't@g', 'dor@gmail.com'];
    const query = `SELECT helper_id, name, email, contact, age, skill_type, experience, rate_per_hour, availability, about, verified, profile_picture_url FROM helpers WHERE email NOT IN (?)`;
    db.query(query, [excludedEmails], (err, results) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving helpers."
            });
            return;
        }
        res.json(results);
    });
};

// Update helper details
exports.updateHelperDetails = (req, res) => {
    const helperId = req.params.id;
    const { about } = req.body;

    if (!about) {
        return res.status(400).send({ message: "'About' content cannot be empty." });
    }

    const query = "UPDATE helpers SET about = ? WHERE helper_id = ?";

    db.query(query, [about, helperId], (err, result) => {
        if (err) {
            return res.status(500).send({ message: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: `Helper with ID ${helperId} not found.` });
        }
        res.status(200).send({ message: "Profile updated successfully." });
    });
};
