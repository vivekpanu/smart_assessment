import React from 'react';
import { BookOpen, Clock, Trophy, CheckCircle2, XCircle } from 'lucide-react';
import { Assessment, StudentResult } from '../types';

interface StudentDashboardProps {
  availableAssessments: Assessment[];
  completedResults: StudentResult[];
  onStartAssessment: (assessmentId: number) => void;
}

export function StudentDashboard({ 
  availableAssessments, 
  completedResults, 
  onStartAssessment 
}: StudentDashboardProps) {
  // Helper function to get the result for a specific assessment
  const getAssessmentResult = (assessmentId: number) => {
    return completedResults.find(result => result.assessmentId === assessmentId);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Student Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <BookOpen className="w-6 h-6 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold">Available Assessments</h3>
          </div>
          <div className="space-y-4">
            {availableAssessments.map(assessment => {
              const result = getAssessmentResult(assessment.id);
              return (
                <div key={assessment.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">{assessment.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{assessment.description}</p>
                      <div className="flex items-center mt-3 space-x-4">
                        <span className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {assessment.timeLimit} mins
                        </span>
                        {result && (
                          <span className="flex items-center text-sm">
                            {result.score >= 70 ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
                                <span className="text-green-600">Passed ({result.score}%)</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 mr-1 text-red-500" />
                                <span className="text-red-600">Failed ({result.score}%)</span>
                              </>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onStartAssessment(assessment.id)}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        result 
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {result ? 'Retake Assessment' : 'Start Assessment'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Trophy className="w-6 h-6 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold">Your Results</h3>
          </div>
          <div className="space-y-4">
            {completedResults.map(result => (
              <div key={result.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {availableAssessments.find(a => a.id === result.assessmentId)?.title || `Assessment #${result.assessmentId}`}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Completed on {new Date(result.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {result.score >= 70 ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        <span className="text-lg font-bold">{result.score}%</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <XCircle className="w-5 h-5 mr-2" />
                        <span className="text-lg font-bold">{result.score}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}