import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  selectedAnswer: number | null;
  onSelectAnswer: (index: number) => void;
  currentQuestion: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function QuestionCard({ 
  question, 
  selectedAnswer, 
  onSelectAnswer,
  currentQuestion,
  totalQuestions,
  onPrevious,
  onNext
}: QuestionCardProps) {
  return (
    <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onPrevious}
          disabled={currentQuestion === 0}
          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Previous
        </button>
        <span className="text-sm font-medium text-gray-600">
          Question {currentQuestion + 1} of {totalQuestions}
        </span>
        <button
          onClick={onNext}
          disabled={currentQuestion === totalQuestions - 1 && selectedAnswer === null}
          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="w-5 h-5 ml-1" />
        </button>
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-4">{question.question}</h2>
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelectAnswer(index)}
            className={`w-full text-left p-4 rounded-lg transition-colors ${
              selectedAnswer === index
                ? 'bg-blue-500 text-white'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}