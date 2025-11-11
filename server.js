const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// ✅ Configure CORS properly
const allowedOrigins = [
  'https://homely-lemon-ten.vercel.app',  // your frontend (Vercel)
  'http://localhost:5173'                 // for local testing
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `CORS policy: Origin ${origin} not allowed`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Import routes
const helpersRouter = require('./routes/helpers');
const bookingsRouter = require('./routes/bookings');
const authRouter = require('./routes/auth');

// API Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Domestic Help Management System API.' });
});

app.use('/api/helpers', helpersRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api', authRouter);

// Starting the server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
