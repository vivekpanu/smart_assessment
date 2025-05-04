export interface Question {
  id: string;
  question: string;
  questionType: 'mcq' | 'openEnded';
  options?: string[];         // For MCQs
  correctAnswer?: number;     // For MCQs
  context?: string;           // Additional context for questions
}

export interface Assessment {
  userId:string,
  id: string;
  title: string;
  description: string;
  questions: Question[];
  questionType: 'mcq' | 'openEnded';
  timeLimit?: number;
  createdAt: string;
}

export interface User {
  id: number;
  name: string;
  role: 'student' | 'teacher';
  email: string;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit?: number;
  createdAt: string;
}

export interface StudentResult {
  id: string;
  studentId: string;
  assessmentId: string;
  score: number;
  completedAt: string;
  userAnswers: (number | string)[];
  evaluationResults?: Array<{
    feedback?: {
      similarityScore?: number;
      modelAnswer?: string;
      feedbackMessage?: string;
    }
  }>;
  assessmentTitle?: string;
}
export interface AssessmentState {
  currentQuestion: number;
  score: number;
  answers: (number | string)[];
  isComplete: boolean;
  evaluationResults?: any[];
}