require('dotenv').config();
console.log(process.env.PORT); // 3001
console.log(process.env.MONGO_URL); // mongodb://localhost:27017/mydatabase 
console.log(process.env.JWT_SECRET); // mydatabase
const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const cors = require('cors'); 
const mongoose = require('mongoose');
const path = require('path');
const authRouter = require('./routes/authRoutes');
const recordRouter = require('./routes/recordRoutes');
const consultationRouter = require('./routes/consultationRoutes');
const aiRouter = require('./routes/aiRoutes');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // fallback for development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true // if you're using cookies or sessions
}));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/consultations', consultationRouter);
app.use('/api/ai', aiRouter);
app.use('/api/auth', authRouter);
app.use('/api/records', recordRouter);

// Connect to DB
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to DB");
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.error(err));