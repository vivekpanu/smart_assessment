import dotenv from 'dotenv';
dotenv.config();  // <-- Ensure this is here at the very top

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
