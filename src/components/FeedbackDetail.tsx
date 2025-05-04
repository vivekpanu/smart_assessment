import { Result } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, CheckCircle2, XCircle } from 'lucide-react';

interface FeedbackDetailProps {
  result: Result;
}

export default function FeedbackDetail({ result }: FeedbackDetailProps) {
  const chartData = result.evaluationResults?.map((er, index) => ({
    question: `Q${index + 1}`,
    score: er.feedback?.similarityScore || 0,
  })) || [];

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Trophy className="w-12 h-12 text-yellow-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {result.assessment?.title || 'Assessment Feedback'}
        </h1>
        <div className="flex justify-center items-center gap-4 mb-4">
          <span className="text-lg font-semibold text-gray-600">
            Student ID: {result.studentId}
          </span>
          <span className="text-lg text-blue-500">
            {new Date(result.completedAt).toLocaleDateString()}
          </span>
        </div>
        <div className={`inline-flex items-center px-6 py-2 rounded-lg ${
          result.score >= 70 ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {result.score >= 70 ? (
            <CheckCircle2 className="w-6 h-6 mr-2 text-green-500" />
          ) : (
            <XCircle className="w-6 h-6 mr-2 text-red-500" />
          )}
          <span className="text-2xl font-bold">{result.score}%</span>
        </div>
      </div>

      {/* Chart Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Performance Breakdown</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="question" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar 
                dataKey="score" 
                fill="#3B82F6" 
                name="Similarity Score"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Feedback Section */}
      <div className="space-y-6">
        {result.questions.map((question, index) => (
          <div key={index} className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-medium text-lg mb-2">{question.question}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Your Answer:</p>
                <p className="mt-1">{result.userAnswers[index]}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Model Answer:</p>
                <p className="mt-1">
                  {result.evaluationResults?.[index]?.feedback?.modelAnswer || 'N/A'}
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm font-medium">
                Similarity Score: {(
                  result.evaluationResults?.[index]?.feedback?.similarityScore?.toFixed(1) || 0
                )}%
              </span>
              {result.evaluationResults?.[index]?.feedback?.similarityScore >= 70 ? (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}