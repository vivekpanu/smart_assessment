import mongoose from 'mongoose';
const resultSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  assessmentId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true 
  },
  score: {
    type: Number,
    required: true,
    default: 0
  },
  completedAt: { type: Date, default: Date.now },
  details: [{
    question: String,
    userAnswer: String,
    feedback: {
      similarityScore: Number,
      modelAnswer: String,
      feedbackMessage: String
    }
  }]
});
export default mongoose.model('Result', resultSchema);