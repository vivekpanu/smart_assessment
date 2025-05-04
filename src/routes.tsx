// src/routes.tsx
import { Navigate, RouteObject } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import SignInPage from './components/SignInPage';
import SignUpPage from './components/SignUpPage';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import QuestionGeneration from './components/QuestionGeneration';
import Layout from './components/Layout'; // We'll create this next

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/signin',
    element: <SignInPage />,
  },
  {
    path: '/signup',
    element: <SignUpPage />,
  },
  {
    element: <Layout />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardRouter />,
      },
      {
        path: '/generate-questions',
        element: <TeacherRoute />,
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  }
];

// Add these components in your existing files
function DashboardRouter() {
  const { userRole } = useAuth(); // We'll create auth context next
  return userRole === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />;
}

function TeacherRoute() {
  const { userRole } = useAuth();
  return userRole === 'teacher' ? <QuestionGeneration /> : <Navigate to="/dashboard" replace />;
}