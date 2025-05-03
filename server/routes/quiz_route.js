// routes/quiz.js
const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');

router.post('/save-questions', async (req, res) => {
  const { userId, quizName, context, questions } = req.body;

  if (!userId || !quizName || !context || !questions) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const newQuiz = new Quiz({
      userId,
      quizName,
      context,
      questions,
    });

    await newQuiz.save();
    res.status(200).json({ message: 'Quiz saved successfully' });
  } catch (error) {
    console.error('Error saving quiz:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
