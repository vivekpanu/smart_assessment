import React, { useState } from 'react';
import { Trophy, RefreshCcw, Eye } from 'lucide-react';
import { Question } from '../types';

interface ResultCardProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  questions: Question[];
  userAnswers: (number | string)[];
  evaluationResults?: Array<{
    feedback?: {
      similarityScore?: number;
      modelAnswer?: string;
      feedbackMessage?: string;
    }
  }>;
}

export function ResultCard({ 
  score, 
  totalQuestions, 
  onRestart, 
  questions, 
  userAnswers,
  evaluationResults = []
}: ResultCardProps) {
  const [showReview, setShowReview] = useState(false);
  
  const percentage = Math.round(score);
  const displayScore = (score / 100 * totalQuestions).toFixed(1);

  return (
    <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-8">
      {!showReview ? (
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Trophy className="w-16 h-16 text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Assessment Complete!</h2>
          <p className="text-4xl font-bold text-blue-500 mb-4">{percentage}%</p>
          <p className="text-gray-600 mb-6">
            You scored {displayScore} out of {totalQuestions} questions correctly
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowReview(true)}
              className="flex items-center bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Eye className="w-5 h-5 mr-2" />
              Review Answers
            </button>
            <button
              onClick={onRestart}
              className="flex items-center bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCcw className="w-5 h-5 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Answer Review</h2>
            <button
              onClick={() => setShowReview(false)}
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              Back to Summary
            </button>
          </div>
          <div className="space-y-6">
            {questions.map((question, index) => {
              const userAnswer = userAnswers[index];
              const correctAnswer = question.correctAnswer;
              const feedback = evaluationResults[index]?.feedback;

              return (
                <div 
                  key={index}
                  className="p-6 rounded-lg border-2 border-gray-100 bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-800">
                          {question.question}
                        </h3>
                      </div>
                      
                      {question.questionType === 'mcq' ? (
                        <div className="space-y-2">
                          {question.options?.map((option, optIndex) => {
                            const isSelected = optIndex === userAnswer;
                            const isCorrect = optIndex === correctAnswer;

                            return (
                              <div
                                key={optIndex}
                                className={`p-3 rounded-lg ${
                                  isSelected
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-white text-gray-600'
                                } ${
                                  isCorrect ? 'border-2 border-green-500' : ''
                                }`}
                              >
                                {option}
                                {isSelected && (
                                  <span className="ml-2 text-sm text-blue-600">
                                    (Your selection)
                                  </span>
                                )}
                                {isCorrect && (
                                  <span className="ml-2 text-sm text-green-600">
                                    (Correct Answer)
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-white p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-700">Your Answer:</p>
                            <p className="text-gray-600 mt-1">{userAnswer}</p>
                          </div>
                          {feedback?.modelAnswer && (
                            <div className="bg-green-50 p-4 rounded-lg">
                              <p className="text-sm font-medium text-gray-700">Correct Answer:</p>
                              <p className="text-gray-600 mt-1">
                                {feedback.modelAnswer}
                              </p>
                            </div>
                          )}
                          {feedback && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <p className="text-sm font-medium text-gray-700">Feedback:</p>
                              <div className="mt-2 grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm">
                                    Similarity Score: {(feedback.similarityScore?.toFixed(1) || 0)}%
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    {feedback.feedbackMessage}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 text-center">
            <button
              onClick={onRestart}
              className="flex items-center justify-center mx-auto bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <RefreshCcw className="w-5 h-5 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}