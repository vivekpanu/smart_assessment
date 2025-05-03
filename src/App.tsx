// App.tsx
import React, { useState } from 'react';
import { Brain, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';
import { QuestionCard } from './components/QuestionCard';
import { ProgressBar } from './components/ProgressBar';
import { ResultCard } from './components/ResultCard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { LandingPage } from './components/LandingPage';
import { SignInPage } from './components/SignInPage';
import { SignUpPage } from './components/SignUpPage';
import { QuestionGeneration } from './components/QuestionGeneration';
import { auth } from './services/api';
import type { Question, Assessment, StudentResult } from './types';
import { ChevronLeft } from 'lucide-react';

type QuestionType = 'mcq' | 'openEnded' | 'bloom';
interface AssessmentState {
  currentQuestion: number;
  score: number;
  answers: (number | string)[];
  isComplete: boolean;
  evaluationResults?: any[]; // For open-ended evaluations
}
function App() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [questionGenerationType, setQuestionGenerationType] = useState<QuestionType | null>(null);
  const [selectedTaxonomyLevel, setSelectedTaxonomyLevel] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'student' | 'teacher' | null>(null);
  const [currentUserName, setCurrentUserName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeAssessmentQuestions, setActiveAssessmentQuestions] = useState<Question[]>([]);
  const [state, setState] = useState<AssessmentState>({
    currentQuestion: 0,
    score: 0,
    answers: [],
    isComplete: false,
  });
  const [activeAssessment, setActiveAssessment] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [studentResults, setStudentResults] = useState<StudentResult[]>([]);

  const handleSignIn = async (role: 'student' | 'teacher', email: string, password: string) => {
    try {
      const { token, user } = await auth.login(email, password, role);
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user.id || user._id);
  
      // Verify user ID
      const userId = user.id || user._id;
      if (!userId) throw new Error('Missing user ID in login response');
  
      // Fetch endpoints configuration
      const API_BASE =  'http://localhost:5000';
      
      const [assessmentsRes, resultsRes] = await Promise.all([
        fetch(`${API_BASE}/api/assessments`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_BASE}/api/results?studentId=${userId}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);
  
      // Handle non-JSON responses
      const parseResponse = async (response: Response) => {
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          const text = await response.text();
          throw new Error(`Invalid response: ${text.slice(0, 100)}`);
        }
        return response.json();
      };
  
      // Process responses
      const assessmentsData = await parseResponse(assessmentsRes);
      const resultsData = await parseResponse(resultsRes);
  
      // Debug logging
      // console.log('Fetched Assessments:', assessmentsData);
      // console.log('Fetched Results:', resultsData);
  
      // Transform assessments data
// Update the question mapping in assessmentsData.map()
const mappedAssessments: Assessment[] = assessmentsData.map((quiz: any) => ({
  id: quiz._id,
  title: quiz.quizName,
  description: quiz.description || '', // Use quiz-level description
  questionType: quiz.questionType,
  questions: quiz.questions.map((q: any) => ({
    id: q._id?.toString() || crypto.randomUUID(),
    question: q.question,
    context: q.context || quiz.context || '', // Fallback to assessment context
    options: q.options,
    correctAnswer: q.correctAnswer,
    questionType: q.questionType || (q.options ? 'mcq' : 'openEnded')
  })),
  timeLimit: quiz.timeLimit || 10,
  createdAt: new Date(quiz.createdAt).toISOString()
}));
  
      // Transform results data
      const mappedResults: StudentResult[] = resultsData.map((result: any) => ({
        id: result._id,
        studentId: result.studentId,
        assessmentId: result.assessmentId,
        score: result.score,
        completedAt: result.completedAt
      }));
  
      // Update state
      setAssessments(mappedAssessments);
      setStudentResults(mappedResults);
      setUserRole(user.role);
      setCurrentUserName(user.name);
      setShowSignIn(false);
      setShowDashboard(true);
      setErrorMessage('');
  
    } catch (error: any) {
      console.error('SignIn error:', error);
      const errorMessage = error.message.includes('Invalid response') 
        ? 'Server returned unexpected format'
        : error.message;
      setErrorMessage(errorMessage);
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleSignUp = async (role: 'student' | 'teacher', name: string, email: string, password: string) => {
    try {
      const { token, user } = await auth.register(name, email, password, role);
      localStorage.setItem('token', token);
      setUserRole(user.role);
      setCurrentUserName(user.name);
      setShowSignUp(false);
      setShowDashboard(true);
      setErrorMessage('');
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'An error occurred during sign up');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    setUserRole(null);
    setShowDashboard(false);
    setShowSignIn(false);
    setShowSignUp(false);
    setQuestionGenerationType(null);
    setActiveAssessment(null);
    setSelectedTaxonomyLevel(null);
    setCurrentUserName('');
    setState({
      currentQuestion: 0,
      score: 0,
      answers: [],
      isComplete: false,
    });
  };

  const handleAnswer = (answer: number | string) => {
    // if (state.answers[state.currentQuestion] !== undefined) return;
    
    const newAnswers = [...state.answers];
    newAnswers[state.currentQuestion] = answer;
    
    // For MCQs only
    if (activeAssessmentQuestions[state.currentQuestion].questionType === 'mcq') {
      const isCorrect = activeAssessmentQuestions[state.currentQuestion].correctAnswer === answer;
      const newScore = isCorrect ? state.score + 1 : state.score;
      setState(prev => ({ ...prev, answers: newAnswers, score: newScore }));
    } else {
      setState(prev => ({ ...prev, answers: newAnswers }));
    }
  };

  const handlePreviousQuestion = () => {
    if (state.currentQuestion > 0) {
      setState({
        ...state,
        currentQuestion: state.currentQuestion - 1,
      });
    }
  };

  const handleNextQuestion = async () => {
    if (state.currentQuestion < activeAssessmentQuestions.length - 1) {
      setState(prev => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }));
    } else {  
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        const API_BASE = 'http://localhost:5000';
        
        if (!userId || !activeAssessment) {
          throw new Error('Missing required user or assessment information');
        }
  
        let details = [];
        let finalScore = state.score;
  
        if (activeAssessmentQuestions[0].questionType === 'openEnded') {
          const evaluationRequests = activeAssessmentQuestions.map((question, index) => {
            return fetch(`${API_BASE}/evaluate-answer`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                context: question.context,
                question: question.question,
                userAnswer: state.answers[index] || ""
              })
            }).catch(error => ({
              ok: false,
              statusText: `Request failed: ${error.message}`,
              text: async () => '',
              json: async () => ({ error: error.message })
          }) as Response);
          });
  
          const evaluationResponses = await Promise.allSettled(evaluationRequests);
          
          const evaluationResults = await Promise.all(
            evaluationResponses.map(async (response) => {
              if (response.status === 'rejected') {
                return { error: 'Evaluation request failed' };
              }
              
              const res = response.value;
              try {
                if (!res.ok) {
                  const errorText = await res.text();
                  return { error: `Server error: ${errorText.slice(0, 100)}` };
                }
                const data = await res.json();
                return data.evaluation; // Access the evaluation property
              } catch (error) {
                return { error: 'Failed to parse response' };
              }
            })
          );
  
          // Fix final score calculation
const validResults = evaluationResults.filter(
  (result): result is { score: number } => 
    !('error' in result) && typeof result?.score === 'number'
);

finalScore = validResults.length > 0 
  ? validResults.reduce((acc, curr) => acc + curr.score, 0) / validResults.length
  : 0;

  if (typeof finalScore !== 'number' || isNaN(finalScore)) {
    finalScore = 0; // Default to 0 if invalid
  }
  
          // Update details mapping
details = activeAssessmentQuestions.map((q, index) => ({
  question: q.question,
  userAnswer: state.answers[index],
  feedback: {
    similarityScore: evaluationResults[index]?.score || 0,
    modelAnswer: evaluationResults[index]?.modelAnswer || '',
    feedbackMessage: evaluationResults[index]?.feedback || 'No feedback'
  }
}));

  
        } else {
          finalScore = Math.round((state.score / activeAssessmentQuestions.length) * 100);
          
          // Updated MCQ details structure with number conversion
          details = activeAssessmentQuestions.map((q, index) => ({
            question: q.question,
            userAnswer: state.answers[index],
            correctAnswer: Number(q.correctAnswer) // Convert to number
          }));
        }
  
        const response = await fetch(`${API_BASE}/api/results`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            studentId: userId,
            assessmentId: activeAssessment,
            score: finalScore,
            details: details,
            questionType: activeAssessmentQuestions[0]?.questionType || 'mcq' 
          })
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error: ${errorText.slice(0, 100)}`);
        }
  
        const result = await response.json();
  
        setState(prev => ({
          ...prev,
          isComplete: true,
          score: finalScore,
          evaluationResults: activeAssessmentQuestions[0].questionType === 'openEnded' 
            ? details 
            : undefined
        }));
  
        setStudentResults(prev => [...prev, {
          id: result.id,
          studentId: userId,
          assessmentId: activeAssessment,
          score: finalScore,
          completedAt: new Date().toISOString(),
          assessmentTitle: result.assessmentTitle
        }]);
  
      } catch (error) {
        console.error('Submission error:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to save results');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    }
  };

  const handleRestart = () => {
    setState({
      currentQuestion: 0,
      score: 0,
      answers: [],
      isComplete: false,
    });
    setActiveAssessment(null);
  };

  const handleStartAssessment = (assessmentId: string) => {
    const assessment = assessments.find(a => a.id === assessmentId);
    if (assessment) {
      setActiveAssessment(assessmentId);
      setActiveAssessmentQuestions(assessment.questions);
      setState({
        currentQuestion: 0,
        score: 0,
        answers: [],
        isComplete: false,
      });
    }
  };

  const handleQuestionTypeSelect = (type: QuestionType, taxonomyLevel?: string) => {
    setQuestionGenerationType(type);
    if (taxonomyLevel) {
      setSelectedTaxonomyLevel(taxonomyLevel);
    }
  };

  const handleQuestionsGenerated = (generatedQuestions: any[]) => {
    // console.log('Generated questions:', generatedQuestions);
    setQuestionGenerationType(null);
    setSelectedTaxonomyLevel(null);
  };

  const handleViewResults = (assessmentId: string) => {
    console.log('View results for assessment', assessmentId);
  };

  if (!showDashboard) {
    if (showSignUp) {
      return (
        <SignUpPage 
          onSignUp={handleSignUp} 
          onBackToSignIn={() => {
            setShowSignUp(false);
            setShowSignIn(true);
          }}
          errorMessage={errorMessage}
        />
      );
    }
    if (showSignIn) {
      return (
        <SignInPage 
          onSignIn={handleSignIn} 
          onSignUp={() => {
            setShowSignIn(false);
            setShowSignUp(true);
          }}
          errorMessage={errorMessage}
        />
      );
    }
    return (
      <LandingPage 
        onGetStarted={() => setShowSignIn(true)} 
        onSignUp={() => setShowSignUp(true)}
      />
    );
  }

  if (questionGenerationType) {
    return (
      <QuestionGeneration 
        type={questionGenerationType}
        taxonomyLevel={selectedTaxonomyLevel}
        onQuestionsGenerated={handleQuestionsGenerated}
        onBack={() => {
          setQuestionGenerationType(null);
          setSelectedTaxonomyLevel(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-blue-500 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Smart Assessment</h1>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-gray-700">{currentUserName}</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setQuestionGenerationType(null);
                      setSelectedTaxonomyLevel(null);
                      setShowDashboard(true);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    My Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      handleSignOut();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 pt-16">
  {activeAssessment ? (
    <div className="flex flex-col items-center">
      {!state.isComplete ? (
        <>
          <div className="w-full max-w-2xl mt-8 mb-4">
            <button 
              onClick={handleRestart}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Dashboard
            </button>
          </div>
          <ProgressBar 
            current={state.currentQuestion + 1} 
            total={activeAssessmentQuestions.length} 
          />
          <QuestionCard
            question={activeAssessmentQuestions[state.currentQuestion]}
            selectedAnswer={state.answers[state.currentQuestion] ?? null}
            onSelectAnswer={handleAnswer}
            currentQuestion={state.currentQuestion}
            totalQuestions={activeAssessmentQuestions.length}
            onPrevious={handlePreviousQuestion}
            onNext={handleNextQuestion}
          />
        </>
      ) : (
        <ResultCard
          score={state.score}
          totalQuestions={activeAssessmentQuestions.length}
          onRestart={handleRestart}
          questions={activeAssessmentQuestions}
          userAnswers={state.answers}
          evaluationResults={state.evaluationResults}
        />
      )}
    </div>
  ) : userRole === 'teacher' ? (
    <TeacherDashboard
      assessments={assessments}
      results={studentResults}
      onQuestionTypeSelect={handleQuestionTypeSelect}
      onViewResults={handleViewResults}
    />
  ) : (
    <StudentDashboard
      availableAssessments={assessments}
      completedResults={studentResults}
      onStartAssessment={handleStartAssessment}
    />
  )}
</main>
    </div>
  );
}

export default App;