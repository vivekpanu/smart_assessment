import React, { useState } from 'react';
import { Trophy, CheckCircle2, XCircle, RefreshCcw, Eye } from 'lucide-react';
import { Question } from '../types';

interface ResultCardProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  questions: Question[];
  userAnswers: number[];
}

export function ResultCard({ score, totalQuestions, onRestart, questions, userAnswers }: ResultCardProps) {
  const [showReview, setShowReview] = useState(false);
  const percentage = Math.round((score / totalQuestions) * 100);

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
            You scored {score} out of {totalQuestions} questions correctly
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
            {questions.map((question, index) => (
              <div 
                key={index}
                className={`p-6 rounded-lg border-2 ${
                  userAnswers[index] === question.correctAnswer
                    ? 'border-green-100 bg-green-50'
                    : 'border-red-100 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-4">
                      <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold mr-3">
                        {index + 1}
                      </span>
                      <h3 className="text-lg font-medium text-gray-800">{question.question}</h3>
                    </div>
                    <div className="space-y-2 ml-11">
                      {question.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`p-3 rounded-lg ${
                            optIndex === question.correctAnswer
                              ? 'bg-green-100 text-green-800'
                              : optIndex === userAnswers[index]
                              ? 'bg-red-100 text-red-800'
                              : 'bg-white text-gray-600'
                          }`}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="ml-4">
                    {userAnswers[index] === question.correctAnswer ? (
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
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