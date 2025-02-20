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
import { questions } from './data/questions';
import { assessments, studentResults } from './data/mockData';
import { auth } from './services/api';
import type { AssessmentState } from './types';

type QuestionType = 'mcq' | 'openEnded' | 'bloom';

function App() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [questionGenerationType, setQuestionGenerationType] = useState<QuestionType | null>(null);
  const [selectedTaxonomyLevel, setSelectedTaxonomyLevel] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'student' | 'teacher' | null>(null);
  const [currentUserName, setCurrentUserName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [state, setState] = useState<AssessmentState>({
    currentQuestion: 0,
    score: 0,
    answers: [],
    isComplete: false,
  });
  const [activeAssessment, setActiveAssessment] = useState<number | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignIn = async (role: 'student' | 'teacher', email: string, password: string) => {
    try {
      const { token, user } = await auth.login(email, password, role);
      localStorage.setItem('token', token);
      setUserRole(user.role);
      setCurrentUserName(user.name);
      setShowSignIn(false);
      setShowDashboard(true);
      setErrorMessage('');
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'An error occurred during sign in');
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

  const handleAnswer = (answerIndex: number) => {
    if (state.answers[state.currentQuestion] !== undefined) return;

    const newAnswers = [...state.answers];
    newAnswers[state.currentQuestion] = answerIndex;

    const newScore = questions[state.currentQuestion].correctAnswer === answerIndex 
      ? state.score + 1 
      : state.score;

    setState({
      ...state,
      answers: newAnswers,
      score: newScore,
    });
  };

  const handlePreviousQuestion = () => {
    if (state.currentQuestion > 0) {
      setState({
        ...state,
        currentQuestion: state.currentQuestion - 1,
      });
    }
  };

  const handleNextQuestion = () => {
    if (state.currentQuestion < questions.length - 1) {
      setState({
        ...state,
        currentQuestion: state.currentQuestion + 1,
      });
    } else if (state.answers[state.currentQuestion] !== undefined) {
      setState({
        ...state,
        isComplete: true,
      });
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

  const handleStartAssessment = (assessmentId: number) => {
    setActiveAssessment(assessmentId);
    setState({
      currentQuestion: 0,
      score: 0,
      answers: [],
      isComplete: false,
    });
  };

  const handleQuestionTypeSelect = (type: QuestionType, taxonomyLevel?: string) => {
    setQuestionGenerationType(type);
    if (taxonomyLevel) {
      setSelectedTaxonomyLevel(taxonomyLevel);
    }
  };

  const handleQuestionsGenerated = (generatedQuestions: any[]) => {
    console.log('Generated questions:', generatedQuestions);
    setQuestionGenerationType(null);
    setSelectedTaxonomyLevel(null);
  };

  const handleViewResults = (assessmentId: number) => {
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
                <ProgressBar 
                  current={state.currentQuestion + 1} 
                  total={questions.length} 
                />
                <QuestionCard
                  question={questions[state.currentQuestion]}
                  selectedAnswer={state.answers[state.currentQuestion] ?? null}
                  onSelectAnswer={handleAnswer}
                  currentQuestion={state.currentQuestion}
                  totalQuestions={questions.length}
                  onPrevious={handlePreviousQuestion}
                  onNext={handleNextQuestion}
                />
              </>
            ) : (
              <ResultCard
                score={state.score}
                totalQuestions={questions.length}
                onRestart={handleRestart}
                questions={questions}
                userAnswers={state.answers}
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