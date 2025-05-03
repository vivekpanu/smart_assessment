// models/Quiz.js
const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  quizName: { type: String, required: true },
  context: { type: String, required: true },
  questions: { type: Array, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Quiz', quizSchema);
