const pool = require('../db');
const multer = require('multer');
const path = require('path');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Register a new user or helper
exports.register = async (req, res) => {
    const { role, name, email, password, age, address, contact, skill_type, experience, rate_per_hour } = req.body;

    if (!role || !name || !email || !password || !age) {
        return res.status(400).send({ message: "Core fields (role, name, email, password, age) cannot be empty!" });
    }

    try {
        if (role === 'household') {
            if (!address) {
                return res.status(400).send({ message: "Address is required for household users." });
            }
            const query = "INSERT INTO users (name, email, password, age, address) VALUES (?, ?, ?, ?, ?)";
            const [result] = await pool.execute(query, [name, email, password, age, address]);

            const [rows] = await pool.execute('SELECT *, \'household\' as role, profile_picture_url FROM users WHERE user_id = ?', [result.insertId]);
            res.status(201).send(rows[0]);

        } else if (role === 'helper') {
            if (!contact || !skill_type || !experience || !rate_per_hour) {
                return res.status(400).send({ message: "Contact, skill, experience, and rate are required for helpers." });
            }
            const query = "INSERT INTO helpers (name, email, password, age, contact, skill_type, experience, rate_per_hour) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            const [result] = await pool.execute(query, [name, email, password, age, contact, skill_type, experience, rate_per_hour]);

            const [rows] = await pool.execute('SELECT *, \'helper\' as role, profile_picture_url FROM helpers WHERE helper_id = ?', [result.insertId]);
            res.status(201).send(rows[0]);

        } else {
            res.status(400).send({ message: "Invalid role specified." });
        }
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).send({ message: "Email already exists." });
        }
        return res.status(500).send({ message: err.message });
    }
};

// Login an existing user or helper
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ message: "Email and password are required." });
    }

    try {
        const findUserQuery = "SELECT *, 'household' as role, profile_picture_url FROM users WHERE email = ?";
        const [users] = await pool.execute(findUserQuery, [email]);

        if (users.length > 0) {
            const user = users[0];
            if (user.password === password) {
                delete user.password;
                res.status(200).send(user);
            } else {
                res.status(401).send({ message: "Invalid email or password." });
            }
        } else {
            const findHelperQuery = "SELECT *, 'helper' as role, profile_picture_url FROM helpers WHERE email = ?";
            const [helpers] = await pool.execute(findHelperQuery, [email]);

            if (helpers.length > 0) {
                const helper = helpers[0];
                if (helper.password === password) {
                    delete helper.password;
                    res.status(200).send(helper);
                } else {
                    res.status(401).send({ message: "Invalid email or password." });
                }
            } else {
                res.status(404).send({ message: "User not found." });
            }
        }
    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
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
        // IMPORTANT: Use a dynamic URL for production
        const profile_picture_url = `${process.env.BACKEND_URL || 'http://localhost:3000'}/uploads/${req.file.filename}`;

        let query;
        if (role === 'household') {
            query = "UPDATE users SET profile_picture_url = ? WHERE user_id = ?";
        } else if (role === 'helper') {
            query = "UPDATE helpers SET profile_picture_url = ? WHERE helper_id = ?";
        } else {
            return res.status(400).json({ message: 'Invalid role.' });
        }

        try {
            const [result] = await pool.execute(query, [profile_picture_url, id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: `${role} with ID ${id} not found.` });
            }
            res.status(200).json({ message: 'Profile picture updated successfully!', profile_picture_url });
        } catch (dbErr) {
            return res.status(500).json({ message: dbErr.message });
        }
    });
};
