// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  userRole: 'student' | 'teacher' | null;
  currentUserName: string;
  assessments: any[];
  studentResults: any[];
  handleSignIn: (role: 'student' | 'teacher', email: string, password: string) => Promise<void>;
  handleSignUp: (role: 'student' | 'teacher', name: string, email: string, password: string) => Promise<void>;
  handleSignOut: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Move your existing auth state and functions here from App.tsx
  const [userRole, setUserRole] = useState<'student' | 'teacher' | null>(null);
  const [currentUserName, setCurrentUserName] = useState('');
  const [assessments, setAssessments] = useState<any[]>([]);
  const [studentResults, setStudentResults] = useState<any[]>([]);
  const navigate = useNavigate();

  // Copy your existing handleSignIn, handleSignUp, handleSignOut functions here

  return (
    <AuthContext.Provider value={{
      userRole,
      currentUserName,
      assessments,
      studentResults,
      handleSignIn,
      handleSignUp,
      handleSignOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}