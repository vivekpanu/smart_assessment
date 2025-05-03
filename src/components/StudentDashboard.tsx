import React from 'react';
import { BookOpen, Clock, Trophy, CheckCircle2, XCircle, Calendar, User } from 'lucide-react';
import { Assessment, StudentResult } from '../types';

interface StudentDashboardProps {
  availableAssessments: Assessment[];
  completedResults: StudentResult[];
  onStartAssessment: (assessmentId: string) => void;
}

export function StudentDashboard({ 
  availableAssessments, 
  completedResults, 
  onStartAssessment 
}: StudentDashboardProps) {
  // console.log('Received Assessments:', availableAssessments);
  // console.log('Received Results:', completedResults);
  // Helper function to get the result for a specific assessment
  const getAssessmentResult = (assessmentId: string) => {
    return completedResults.find(result => result.assessmentId === assessmentId);
  };
  const filteredAssessments = availableAssessments.filter(assessment => {
    const result = completedResults.find(result => result.assessmentId === assessment.id);
    return !result || result.score < 70;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Student Dashboard</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Available Assessments */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold ml-3">Available Assessments</h3>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {filteredAssessments.map(assessment => {
    const result = getAssessmentResult(assessment.id);
    const hasPassed = result ? result.score >= 70 : false;
    const showResult = result && typeof result.score === 'number';
    
    return (
      <div key={assessment.id} className="border-4 bg-gray-50 border-gray-500 rounded-lg p-4 hover:border-blue-700 transition-colors">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h4 className="font-medium text-gray-800">{assessment.title}</h4>
            <div className="flex flex-wrap items-center mt-3 gap-4">
              <span className="flex items-center text-sm text-gray-500">
                <Clock className="text-red-500 w-4 h-4 mr-1" />
                {assessment.timeLimit} mins
              </span>
              <span className="flex items-center text-sm text-blue-500">
                <Calendar className="text-blue-700 w-4 h-4 mr-1" />
                {new Date(assessment.createdAt).toLocaleDateString()}
              </span>
              {showResult && (
                <span className="flex items-center text-sm">
                  {hasPassed ? (
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
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              result
                ? hasPassed
                  ? 'bg-green-100 text-green-700 hover:bg-green-200 cursor-default'
                  : 'bg-red-100 text-red-700 hover:bg-gray-200'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            disabled={hasPassed}
          >
            {result
              ? (hasPassed ? 'Passed' : 'Retake Assessment')
              : 'Start Assessment'}
          </button>
        </div>
      </div>
    );
  })}
</div>
          </div>

          {/* Your Results */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-yellow-500" />
              </div>
              <h3 className="text-lg font-semibold ml-3">Your Results</h3>
            </div>
            {completedResults.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {completedResults.map(result => {
                  const assessment = availableAssessments.find(a => a.id === result.assessmentId);
                  return (
                    <div key={result.id} className="border-4 bg-gray-50 border-gray-500 border rounded-lg p-4 hover:border-blue-500 transition-colors">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <h4 className="font-medium text-gray-800">
                          {assessment?.title || 'Assessment'}
                          </h4>
                          <div className="flex flex-wrap items-center mt-2 gap-4">
                            <span className="flex items-center text-sm text-gray-500">
                              <User className="text-green-700 w-4 h-4 mr-1" />
                              Student ID: {result.studentId}
                            </span>
                            <span className="flex items-center text-sm text-blue-500">
                              <Calendar className="text-blue-700 w-4 h-4 mr-1" />
                              {new Date(result.completedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {result.score >= 70 ? (
                            <div className="flex items-center px-3 py-1 bg-green-50 rounded-lg">
                              <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
                              <span className="text-lg font-bold text-green-600">{result.score}%</span>
                            </div>
                          ) : (
                            <div className="flex items-center px-3 py-1 bg-red-50 rounded-lg">
                              <XCircle className="w-5 h-5 mr-2 text-red-500" />
                              <span className="text-lg font-bold text-red-600">{result.score}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <Trophy className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500">You haven't completed any assessments yet.</p>
                <p className="text-gray-500 text-sm mt-1">Complete an assessment to see your results here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}