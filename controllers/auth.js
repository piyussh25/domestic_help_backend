const db = require('../db');
const multer = require('multer');
const path = require('path');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Files will be stored in the 'uploads/' directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Register a new user or helper
exports.register = (req, res) => {
    const { role, name, email, password, age, address, contact, skill_type, experience, rate_per_hour } = req.body;

    if (!role || !name || !email || !password || !age) {
        return res.status(400).send({ message: "Core fields (role, name, email, password, age) cannot be empty!" });
    }

    if (role === 'household') {
        // Register a household user
        if (!address) {
            return res.status(400).send({ message: "Address is required for household users." });
        }
        const query = "INSERT INTO users (name, email, password, age, address) VALUES (?, ?, ?, ?, ?)";
        // Note: In a real app, you MUST hash the password. For simplicity, we are storing it as plain text.
        db.query(query, [name, email, password, age, address], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).send({ message: "Email already exists." });
                }
                return res.status(500).send({ message: err.message });
            }
            // Return the newly created user's data
            db.query('SELECT *, \'household\' as role, profile_picture_url FROM users WHERE user_id = ?', [result.insertId], (err, rows) => {
                if (err) return res.status(500).send({ message: err.message });
                res.status(201).send(rows[0]);
            });
        });

    } else if (role === 'helper') {
        // Register a helper
        if (!contact || !skill_type || !experience || !rate_per_hour) {
            return res.status(400).send({ message: "Contact, skill, experience, and rate are required for helpers." });
        }
        const query = "INSERT INTO helpers (name, email, password, age, contact, skill_type, experience, rate_per_hour) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        // Note: In a real app, you MUST hash the password.
        db.query(query, [name, email, password, age, contact, skill_type, experience, rate_per_hour], (err, result) => {
            if (err) {
                 if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).send({ message: "Email already exists." });
                }
                return res.status(500).send({ message: err.message });
            }
            // Return the newly created helper's data
            db.query('SELECT *, \'helper\' as role, profile_picture_url FROM helpers WHERE helper_id = ?', [result.insertId], (err, rows) => {
                if (err) return res.status(500).send({ message: err.message });
                res.status(201).send(rows[0]);
            });
        });

    } else {
        res.status(400).send({ message: "Invalid role specified." });
    }
};

// Login an existing user or helper
exports.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ message: "Email and password are required." });
    }

    const findUserQuery = "SELECT *, 'household' as role, profile_picture_url FROM users WHERE email = ?";
    db.query(findUserQuery, [email], (err, users) => {
        if (err) return res.status(500).send({ message: err.message });

        if (users.length > 0) {
            // User found in users table
            const user = users[0];
            if (user.password === password) {
                // Password matches
                delete user.password; // Do not send password back to client
                res.status(200).send(user);
            } else {
                // Password does not match
                res.status(401).send({ message: "Invalid email or password." });
            }
        } else {
            // User not in users table, check helpers table
            const findHelperQuery = "SELECT *, 'helper' as role, profile_picture_url FROM helpers WHERE email = ?";
            db.query(findHelperQuery, [email], (err, helpers) => {
                if (err) return res.status(500).send({ message: err.message });

                if (helpers.length > 0) {
                    // User found in helpers table
                    const helper = helpers[0];
                    if (helper.password === password) {
                        // Password matches
                        delete helper.password; // Do not send password back to client
                        res.status(200).send(helper);
                    } else {
                        // Password does not match
                        res.status(401).send({ message: "Invalid email or password." });
                    }
                } else {
                    // Email not found in either table
                    res.status(404).send({ message: "User not found." });
                }
            });
        }
    });
};
// Upload profile picture
exports.uploadProfilePicture = (req, res) => {
    upload.single('profile_picture')(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const { role, id } = req.body;
        const base_url = "http://localhost:3000"; // Assuming your backend runs on this URL
        const profile_picture_url = `${base_url}/uploads/${req.file.filename}`;

        let query;
        if (role === 'household') {
            query = "UPDATE users SET profile_picture_url = ? WHERE user_id = ?";
        } else if (role === 'helper') {
            query = "UPDATE helpers SET profile_picture_url = ? WHERE helper_id = ?";
        } else {
            return res.status(400).json({ message: 'Invalid role.' });
        }

        db.query(query, [profile_picture_url, id], (err, result) => {
            if (err) {
                return res.status(500).json({ message: err.message });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: `${role} with ID ${id} not found.` });
            }
            res.status(200).json({ message: 'Profile picture updated successfully!', profile_picture_url });
        });
    });
};