const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Import routes
const helpersRouter = require('./routes/helpers');
const bookingsRouter = require('./routes/bookings');
const authRouter = require('./routes/auth');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// API Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Domestic Help Management System API.' });
});

app.use('/api/helpers', helpersRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api', authRouter);

// Starting the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
