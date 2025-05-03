import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileSpreadsheet, 
  Menu,
  CheckSquare,
  AlignLeft,
  Brain,
  X,
  ChevronDown,
  FileText,
  Download,
  Trash2,
  User,
  ChevronRight,
  FileQuestion,
  FileCheck,
  BrainCircuit
} from 'lucide-react';
import { Assessment, StudentResult } from '../types';

interface TeacherDashboardProps {
  assessments: Assessment[];
  results: StudentResult[];
  onQuestionTypeSelect: (type: 'mcq' | 'openEnded' | 'bloom', taxonomyLevel?: string) => void;
  onViewResults: (assessmentId: string) => void;
}

export function TeacherDashboard({ 
  assessments, 
  results, 
  onQuestionTypeSelect, 
  onViewResults 
}: TeacherDashboardProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showBloomLevels, setShowBloomLevels] = useState(false);
  const [expandedAssessment, setExpandedAssessment] = useState<string | null>(null);
  const [savedQuestionFiles, setSavedQuestionFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentResultsByAssessment, setStudentResultsByAssessment] = useState<{ [key: string]: any[] }>({});
  
  const isValidObjectId = (id: string) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };
  // Fetch questions when component mounts
  useEffect(() => {
    const fetchUserQuestions = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          throw new Error('User not authenticated');
        }
    
        // Add user ID validation
        if (!isValidObjectId(userId)) { // Replace with your ID validation logic
          throw new Error('Invalid user ID format');
        }
    
        const response = await fetch(`http://localhost:5000/api/user-questions?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }
  
        const data = await response.json();
        
        // Transform the data to match the expected format
        const formattedQuestions = data.map((quiz: any) => ({
          id: quiz._id,
          name: quiz.quizName,
          type: quiz.questions[0]?.options ? 'Multiple Choice' : 'Open Ended',
          questionsCount: quiz.questions.length,
          createdAt: quiz.createdAt,
          questions: quiz.questions
        }));
  
        setSavedQuestionFiles(formattedQuestions);
      } catch (err) {
        // Type guard to check if it's an Error
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        console.error('Error fetching questions:', err);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchUserQuestions();
  }, []);


  // // Mock student results for assessments
  // const studentResultsByAssessment: Record<string, { id: number; studentName: string; score: number; completedAt: string; }[]> = {
  //   1: [
  //     { id: 1, studentName: 'Alice Johnson', score: 85, completedAt: '2024-03-15T11:30:00Z' },
  //     { id: 2, studentName: 'Bob Smith', score: 92, completedAt: '2024-03-15T12:15:00Z' },
  //     { id: 3, studentName: 'Charlie Brown', score: 78, completedAt: '2024-03-15T13:00:00Z' }
  //   ],
  //   2: [
  //     { id: 4, studentName: 'Diana Prince', score: 95, completedAt: '2024-03-14T10:30:00Z' },
  //     { id: 5, studentName: 'Edward Clark', score: 88, completedAt: '2024-03-14T11:45:00Z' }
  //   ]
  // };
  

  const bloomTaxonomyLevels = [
    'Remembering',
    'Understanding',
    'Applying',
    'Analyzing',
    'Evaluating',
    'Creating'
  ];

  const handleBloomSelect = (level: string) => {
    onQuestionTypeSelect('bloom', level);
    setShowBloomLevels(false);
  };

  // Function to handle file deletion
  const handleDeleteFile = async (fileId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/user-questions/${fileId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete question file');
      }

      // Remove the deleted file from state
      setSavedQuestionFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (err) {
      console.error('Error deleting file:', err);
      alert('Failed to delete file');
    }
  };

  const handleDownloadFile = (file: any) => {
    const content = file.questions
      .map((q: any, i: number) => {
        let questionText = `${i + 1}. ${q.question}`;
        
        // Only add options if they exist (for MCQ)
        if (q.options && q.options.length > 0) {
          questionText += '\n' + q.options
            .map((opt: string, j: number) => `   ${String.fromCharCode(97 + j)}. ${opt}`)
            .join('\n');
          
          // Add correct answer if available
          if (q.correctAnswer !== undefined) {
            questionText += `\n   Correct answer: ${String.fromCharCode(97 + q.correctAnswer)}`;
          }
        }
        
        return questionText;
      })
      .join('\n\n');
  
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name || 'questions'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const toggleAssessmentResults = async (assessmentId: string) => {
    if (expandedAssessment === assessmentId) {
      setExpandedAssessment(null);
    } else {
      setExpandedAssessment(assessmentId);
  
      // Only fetch if not already fetched
      if (!studentResultsByAssessment[assessmentId]) {
        try {
          const response = await fetch(`http://localhost:5000/api/results/by-assessment?assessmentId=${assessmentId}`);
        
          if (!response.ok) {
            const errorText = await response.text(); // Try to read the error body
            throw new Error(`HTTP error ${response.status}: ${errorText}`);
          }
        
          const data = await response.json();
          setStudentResultsByAssessment(prev => ({ ...prev, [assessmentId]: data }));
        } catch (error) {
          console.error("Error fetching student results:", error);
        }
        
      }
    }
  };
  

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'Multiple Choice':
        return <FileQuestion className="w-6 h-6 text-blue-500" />;
      case 'Open Ended':
        return <FileCheck className="w-6 h-6 text-green-500" />;
      case "Bloom's Taxonomy":
        return <BrainCircuit className="w-6 h-6 text-purple-500" />;
      default:
        return <FileText className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-16 left-0 h-full bg-white shadow-lg z-30 transition-all duration-300 ${
        isSidebarOpen ? 'w-64' : 'w-0 lg:w-64'
      } overflow-hidden`}>
        <div className="flex justify-between items-center p-4">
          <h2 className="font-semibold text-gray-800">Question Types</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="px-4 py-2">
          <div className="space-y-2">
            <button 
              onClick={() => onQuestionTypeSelect('mcq')}
              className=" bg-blue-50 flex items-center w-full p-2 hover:bg-blue-100 rounded-lg transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-blue-500" />
              </div>
              <span className="ml-3 text-gray-700">Multiple Choice</span>
            </button>
            
            <button 
              onClick={() => onQuestionTypeSelect('openEnded')}
              className="bg-blue-50 flex items-center w-full p-2 hover:bg-green-100 rounded-lg transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <AlignLeft className="w-5 h-5 text-green-500" />
              </div>
              <span className="ml-3 text-gray-700">Open Ended</span>
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowBloomLevels(!showBloomLevels)}
                className="bg-blue-50 flex items-center justify-between w-full p-2 hover:bg-purple-100 rounded-lg transition-colors group"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-purple-500" />
                  </div>
                  <span className="ml-3 text-gray-700">Bloom's Taxonomy</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showBloomLevels ? 'transform rotate-180' : ''}`} />
              </button>
              
              {showBloomLevels && (
                <div className="ml-7 mt-1 space-y-1">
                  {bloomTaxonomyLevels.map((level) => (
                    <button
                      key={level}
                      onClick={() => handleBloomSelect(level)}
                      className="w-full p-2 text-sm text-gray-600 hover:bg-blue-50 rounded-lg transition-colors text-left"
                    >
                      {level}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        isSidebarOpen ? 'lg:ml-64' : 'lg:ml-64'
      }`}>
        <div className="p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 mr-3 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Teacher Dashboard</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Saved Question Files */}
            <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold ml-3">Saved Question Files</h3>
              </div>
              {isLoading ? (
  <div className="flex justify-center items-center h-40">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
) : error ? (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
    {error}
  </div>
) : savedQuestionFiles.length === 0 ? (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-600">
    No saved question files found. Generate some questions to see them here.
  </div>
) : (
  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
    {savedQuestionFiles.map(file => (
      <div key={file.id} className=" bg-gray-50 border border-gray-500 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-start">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              {getFileIcon(file.type)}
            </div>
            <div>
              <h4 className="font-medium text-gray-800">{file.name}</h4>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {file.type}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {file.questionsCount} questions
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Created on {new Date(file.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownloadFile(file)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleDeleteFile(file.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
)}
            </div>

            {/* Recent Assessments */}
            <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold ml-3">Recent Assessments</h3>
              </div>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {assessments.map(assessment => (
                  <div key={assessment.id} className="bg-gray-50 rounded-lg p-4 border border-gray-500">
                    <div className="flex flex-col space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <FileQuestion className="w-6 h-6 text-blue-500" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">{assessment.title}</h4>
                            {/* <p className="text-sm text-gray-600 mt-1">{assessment.description}</p> */}
                            <span className="text-sm text-gray-500 block mt-2">
                              Time: {assessment.timeLimit} mins
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleAssessmentResults(assessment.id)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <ChevronRight className={`w-5 h-5 transform transition-transform ${
                            expandedAssessment === assessment.id ? 'rotate-90' : ''
                          }`} />
                        </button>
                      </div>

                      {/* Student Results */}
                      {expandedAssessment === assessment.id && studentResultsByAssessment[assessment.id] && (
  <div className="pl-4 border-l-2 border-blue-100 mt-2">
    <h5 className="text-sm font-medium text-gray-700 mb-2">Student Results</h5>
    <div className="space-y-2">
      {studentResultsByAssessment[assessment.id].map((result) => (
        <div key={result.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <span className="text-sm text-gray-700 ml-2">{result.studentName}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-blue-500">
              {new Date(result.completedAt).toLocaleDateString()}
            </span>
            <span className="font-medium text-green-600">{result.score}%</span>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}