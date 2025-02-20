import React, { useState } from 'react';
import { Brain, GraduationCap, UserCog, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface SignInPageProps {
  onSignIn: (role: 'student' | 'teacher', email: string, password: string) => void;
  onSignUp: () => void;
  errorMessage: string;
}

export function SignInPage({ onSignIn, onSignUp, errorMessage }: SignInPageProps) {
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({
    role: false,
    email: false,
    password: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ role: true, email: true, password: true });
    
    if (selectedRole && email && password) {
      onSignIn(selectedRole, email, password);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Brain className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to continue to Smart Assessment</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errorMessage}
              </p>
            </div>
          )}

          <h2 className="text-lg font-semibold text-gray-900 mb-6">I am a...</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('student');
                setTouched({ ...touched, role: true });
              }}
              className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                selectedRole === 'student'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
              }`}
            >
              <GraduationCap className={`h-8 w-8 mb-2 ${
                selectedRole === 'student' ? 'text-blue-500' : 'text-gray-400'
              }`} />
              <span className={`font-medium ${
                selectedRole === 'student' ? 'text-blue-500' : 'text-gray-600'
              }`}>Student</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole('teacher');
                setTouched({ ...touched, role: true });
              }}
              className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                selectedRole === 'teacher'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
              }`}
            >
              <UserCog className={`h-8 w-8 mb-2 ${
                selectedRole === 'teacher' ? 'text-blue-500' : 'text-gray-400'
              }`} />
              <span className={`font-medium ${
                selectedRole === 'teacher' ? 'text-blue-500' : 'text-gray-600'
              }`}>Teacher</span>
            </button>
          </div>
          {touched.role && !selectedRole && (
            <p className="text-red-500 text-sm flex items-center mt-1 mb-4">
              <AlertCircle className="w-4 h-4 mr-1" />
              Please select your role
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched({ ...touched, email: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              {touched.email && !email && (
                <p className="text-red-500 text-sm flex items-center mt-1">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Email is required
                </p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched({ ...touched, password: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {touched.password && !password && (
                <p className="text-red-500 text-sm flex items-center mt-1">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Password is required
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={onSignUp}
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}