const pool = require('../db');

// Get all helpers
exports.getAllHelpers = async (req, res) => {
    try {
        const excludedEmails = ['sunita.d@example.com', 'rajesh.k@example.com', 'meena.k@example.com', 't@g', 'dor@gmail.com'];
        const query = `SELECT helper_id, name, email, contact, age, skill_type, experience, rate_per_hour, availability, about, verified, profile_picture_url FROM helpers WHERE email NOT IN (?)`;
        const [results] = await pool.execute(query, [excludedEmails]);
        res.json(results);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving helpers."
        });
    }
};

// Update helper details
exports.updateHelperDetails = async (req, res) => {
    const helperId = req.params.id;
    const { about } = req.body;

    if (!about) {
        return res.status(400).send({ message: "'About' content cannot be empty." });
    }

    try {
        const query = "UPDATE helpers SET about = ? WHERE helper_id = ?";
        const [result] = await pool.query(query, [about, helperId]);

        if (result.affectedRows === 0) {
            return res.status(404).send({ message: `Helper with ID ${helperId} not found.` });
        }
        res.status(200).send({ message: "Profile updated successfully." });
    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
};
