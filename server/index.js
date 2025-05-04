import dotenv from 'dotenv';
dotenv.config();

// Import dependencies
import express from 'express';
import cors from 'cors';
import axios from 'axios'; 
import mongoose from 'mongoose';
import { spawn } from 'child_process';
import authRoutes from './routes/auth.js';
import Quiz from './models/Quiz.js';
import Result from './models/Result.js';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import jwt from 'jsonwebtoken';

// ES module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize express app
const app = express();
app.use((req, res, next) => {
  let responded = false;
  const originalSend = res.send;
  res.send = function (...args) {
    if (responded) return;
    responded = true;
    originalSend.apply(res, args);
  };
  next();
});

app.use(cors());  
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

app.use('/api/auth', authRoutes);
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});
const authenticateUser = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      _id: decoded.userId,
      role: decoded.role
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Add this error handling middleware at the end
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});
// Question Generation Endpoint
app.post('/generate-question', async (req, res) => {
  try {
    const { context, numQuestions, questionType } = req.body;
    
    if (!context || !numQuestions) {
      return res.status(400).json({ error: 'Missing context or number of questions' });
    }

    // Create temp file
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempFilePath = path.join(tempDir, `${uuidv4()}.txt`);
    fs.writeFileSync(tempFilePath, context);

    const pythonProcess = spawn('python', [
      'scripts/generate_question.py',
      tempFilePath,
      numQuestions.toString(),
      questionType || 'open'
    ]);

    let result = '';
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      // Cleanup temp file
      fs.unlink(tempFilePath, () => {});
      
      if (code !== 0) {
        return res.status(500).json({ error: 'Question generation failed' });
      }
      
      try {
        const parsedResult = JSON.parse(result);
        res.json(parsedResult);
      } catch (err) {
        res.status(500).json({ error: 'Invalid response from Python script' });
      }
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/save-quiz', async (req, res) => {
  try {
    const newQuiz = new Quiz(req.body);
    await newQuiz.save();
    res.status(201).json({ message: 'Quiz saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error saving quiz' });
  }
});

app.post('/save-questions', async (req, res) => {
  const { userId, quizName, context, questions, questionType } = req.body;

  if (!userId || !quizName || !context || !questions || !questionType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const processedQuestions = questions.map((question) => ({
      question: question.question,
      options: questionType === 'mcq' ? 
        (question.options || ['Option A', 'Option B', 'Option C', 'Option D']) : 
        undefined,
      correctAnswer: questionType === 'mcq' ? 
        (question.correctAnswer || 0) : 
        undefined,
      questionType: questionType // Add questionType to each question
    }));

    const newQuiz = new Quiz({
      userId,
      quizName,
      context,
      questions: processedQuestions,
      questionType // Store at quiz level
    });

    await newQuiz.save();
    res.status(200).json({ message: 'Quiz saved successfully' });
  } catch (error) {
    console.error('Error saving quiz:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/assessments', authenticateUser, async (req, res) => {
  try {
    // Get user from authentication middleware
    const user = req.user;

    // Student logic
    if (user.role === 'student') {
      const assessments = await Quiz.find({
        // Add any student-specific filters here
      }).lean();
      return res.json(assessments);
    }

    // Teacher logic
    if (user.role === 'teacher') {
      const assessments = await Quiz.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .lean();
      return res.json(assessments);
    }

    // Handle invalid roles
    return res.status(403).json({ error: 'Unauthorized role' });

  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({ 
      error: 'Server error while fetching assessments',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

// app.get('/api/assessments', async (req, res) => {
//   try {
//     const assessments = await Quiz.find().lean();
//     res.json(assessments);
//   } catch (error) {
//     res.status(500).json({ error: 'Error fetching assessments' });
//   }
// });


// app.get('/api/assessments', async (req, res) => {
//   try {
//     const { userId } = req.query;

//     // Validate user ID
//     if (!userId) {
//       return res.status(400).json({ error: 'User ID is required' });
//     }

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ error: 'Invalid user ID format' });
//     }

//     // Find assessments with matching userId
//     const assessments = await Quiz.find({ userId })
//       .sort({ createdAt: -1 }) // Sort by newest first
//       .lean();

//     res.json(assessments);
//   } catch (error) {
//     console.error('Error fetching assessments:', error);
//     res.status(500).json({ 
//       error: 'Server error while fetching assessments',
//       details: error.message 
//     });
//   }
// });

app.post('/api/results', async (req, res) => {
  // console.log("POST RESULTS CALLED")
  try {
    const { studentId, assessmentId, details, questionType } = req.body;
    
    // Fix: Create a new score variable instead of modifying the destructured const
    let score = typeof req.body.score === 'number' ? req.body.score : 0;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ error: 'Invalid studentId format' });
    }
    // console.log("STUDENT ID OKAY")
    if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
      return res.status(400).json({ error: 'Invalid assessmentId format' });
    }
    // console.log("ASSESSMENT ID OKAY")
// Validate and transform details for openEnded questions
const transformedDetails = details.map(detail => {
  if (questionType === 'openEnded') {
    return {
      question: detail.question,
      userAnswer: detail.userAnswer,
      feedback: {
        similarityScore: detail.feedback.similarityScore,
        modelAnswer: detail.feedback.modelAnswer,
        feedbackMessage: detail.feedback.feedbackMessage
      }
    };
  }
  return detail; // For MCQ, keep existing structure
});

const newResult = new Result({
  studentId,
  assessmentId,
  score: typeof score === 'number' ? score : 0,
  details: transformedDetails,
  questionType,
  completedAt: new Date()
});
// console.log("RESULT ", newResult)
    await newResult.save();
    
    const populatedResult = await Result.findById(newResult._id)
      .populate('assessmentId', 'quizName');

    res.status(201).json({
      id: populatedResult._id,
      studentId: populatedResult.studentId,
      assessmentId: populatedResult.assessmentId._id,
      score: populatedResult.score,
      completedAt: populatedResult.completedAt,
      assessmentTitle: populatedResult.assessmentId.quizName,
      details: populatedResult.details
    });
    
  } catch (error) {
    console.error('Error saving result:', error);
    res.status(500).json({ 
      error: 'Error saving result',
      systemError: error.message 
    });
  }
});

app.get('/api/results', async (req, res) => {
  try {
    const { studentId } = req.query;
    
    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId.toString())) {
      return res.status(400).json({ error: 'Valid studentId required' });
    }

    const results = await Result.find({ studentId })
      .populate('assessmentId', 'quizName')
      .lean();

    res.json(results.map(result => ({
      id: result._id,
      studentId: result.studentId,
      assessmentId: result.assessmentId._id,
      score: result.score,
      completedAt: result.completedAt,
      assessmentTitle: result.assessmentId.quizName,
      details: result.details // Include details in the response
    })));
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Error fetching results' });
  }
});

app.get('/api/results/by-assessment', async (req, res) => {
  try {
    const { assessmentId } = req.query;

    if (!assessmentId || !mongoose.Types.ObjectId.isValid(assessmentId)) {
      return res.status(400).json({ error: 'Invalid assessmentId' });
    }

    const results = await Result.find({ assessmentId })
      .populate('studentId', 'name') // Make sure studentId is a ref to a user model with 'name' field
      .lean();
    // console.log("result: ", results)
    res.json(results.map(result => ({
      id: result._id,
      studentName: result.studentId || 'Anonymous',
      completedAt: result.completedAt,
      score: result.score
    })));
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Error fetching results' });
  }
});

app.get('/api/user-questions', async (req, res) => {
  const { userId } = req.query;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid or missing userId' });
  }

  try {
    const quizzes = await Quiz.find({ userId });

    if (!quizzes || quizzes.length === 0) {
      return res.status(404).json({ message: 'No questions found for this user' });
    }

    res.json(quizzes);
  } catch (err) {
    console.error('Error fetching user questions:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/user-questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId; // Optional: add user verification
    
    const deletedQuiz = await Quiz.findByIdAndDelete(id);
    
    if (!deletedQuiz) {
      return res.status(404).json({ error: 'Question file not found' });
    }
    
    res.json({ message: 'Question file deleted successfully' });
  } catch (error) {
    console.error('Error deleting question file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/evaluate-answer', async (req, res) => {
  const { context, question, userAnswer } = req.body;
  // console.log("POST EVALUATE ANSWER CALLED")

  if (!context?.trim() || !question?.trim() || !userAnswer?.trim()) {
      return res.status(400).json({ error: 'All fields are required' });
  }

  try {
      const response = await axios.post('http://localhost:5001/evaluate', {
          context,
          question,
          userAnswer
      });
      console.log("response.data ",response.data)
      res.json({
          success: true,
          evaluation: response.data
      });
      
  } catch (error) {
      console.error('Evaluation error:', error);
      res.status(500).json({ 
          error: 'Answer evaluation failed',
          details: error.response?.data?.error || error.message
      });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
