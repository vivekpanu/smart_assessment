import React, {useState} from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  selectedAnswer: number | string | null;
  onSelectAnswer: (answer: number | string) => void;
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
  const isLastQuestion = currentQuestion === totalQuestions - 1;
  const [openEndedAnswer, setOpenEndedAnswer] = useState(
    typeof selectedAnswer === 'string' ? selectedAnswer : ''
  );
  const [selectedOption, setSelectedOption] = useState<number | null>(
    typeof selectedAnswer === 'number' ? selectedAnswer : null
  );
  React.useEffect(() => {
    setOpenEndedAnswer(typeof selectedAnswer === 'string' ? selectedAnswer : '');
  }, [currentQuestion, selectedAnswer]);
  React.useEffect(() => {
    if (typeof selectedAnswer === 'number') {
      setSelectedOption(selectedAnswer);
    }
  }, [selectedAnswer]);
  const handleOptionSelect = (index: number) => {
    setSelectedOption(index);
    onSelectAnswer(index);
  };
  const handleTextAnswer = (answer: string) => {
    setOpenEndedAnswer(answer);
    onSelectAnswer(answer);
  };

  // Function to convert number to letter (0 -> A, 1 -> B, etc.)
  const getOptionLetter = (index: number) => {
    return String.fromCharCode(65 + index);
  };

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
          disabled={selectedAnswer === null}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            isLastQuestion 
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {isLastQuestion ? 'Submit Assessment' : 'Next'}
          {!isLastQuestion && <ChevronRight className="w-5 h-5 ml-1" />}
        </button>
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-4">{question.question}</h2>
      {question.questionType?.toLowerCase() === 'mcq' && question.options ? (
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(index)}
              className={`w-full text-left p-4 rounded-lg transition-colors flex items-start ${
                selectedOption === index
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              <span className="font-mono mr-4 min-w-[2rem]">
                {getOptionLetter(index)}.
              </span>
              <span className="flex-1">{option}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <textarea
            value={openEndedAnswer}
            onChange={(e) => handleTextAnswer(e.target.value)}
            className="w-full h-32 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Type your answer here..."
          />
        </div>
      )}
    </div>
  );
}