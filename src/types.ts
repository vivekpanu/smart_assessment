export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface AssessmentState {
  currentQuestion: number;
  score: number;
  answers: number[];
  isComplete: boolean;
}

export interface User {
  id: number;
  name: string;
  role: 'student' | 'teacher';
  email: string;
}

export interface Assessment {
  id: number;
  title: string;
  description: string;
  questions: Question[];
  timeLimit?: number; // in minutes
  createdAt: string;
}

export interface StudentResult {
  id: number;
  studentId: number;
  assessmentId: number;
  score: number;
  completedAt: string;
}