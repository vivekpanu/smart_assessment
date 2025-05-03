import React, { useState } from 'react';
import { Brain, Lightbulb, Target, Zap, LogIn, Mail, Phone, UserCircle2, UserCircle, UserCircle as UserCirclePlus } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignUp: () => void;
}

export function LandingPage({ onGetStarted, onSignUp }: LandingPageProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const teamMembers = [
    {
      name: 'Vivek Kumar',
      role: 'Team Lead',
      description: 'Specializes in AI and machine learning, driving innovation in educational technology',
      icon: <UserCircle2 className="w-8 h-8 text-blue-500" />,
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Muskan Kukreja',
      role: 'Frontend Developer',
      description: 'Expert in creating intuitive and responsive user interfaces',
      icon: <UserCircle className="w-8 h-8 text-pink-500" />,
      bgColor: 'bg-pink-100'
    },
    {
      name: 'Muskan Chughani',
      role: 'Backend Developer',
      description: 'Specializes in building robust and scalable server-side solutions',
      icon: <UserCirclePlus className="w-8 h-8 text-purple-500" />,
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Navigation Bar */}
<nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-md transition-all duration-300">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      <div className="flex items-center">
        <Brain className="h-8 w-8 text-blue-500" />
        <span className="ml-2 text-xl font-bold text-gray-900">Smart Assessment</span>
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={onGetStarted}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 hover:text-blue-500 transition-colors"
        >
          <LogIn className="h-4 w-4 mr-2" />
          Sign In
        </button>
      </div>
    </div>
  </div>
</nav>

      {/* Add padding to account for fixed navbar */}
      <div className="pt-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center">
                  <Brain className="h-12 w-12 text-blue-500" />
                </div>
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Empower Learning Through
                <span className="text-blue-500"> Smart Assessment</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Transform the way you teach and learn with our intelligent assessment platform.
                Create, manage, and analyze assessments with ease.
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <Lightbulb className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">Intelligent Analytics</h3>
                <p className="text-gray-600">
                  Get detailed insights into student performance and learning patterns
                </p>
              </div>
              <div className="text-center p-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <Target className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">Targeted Learning</h3>
                <p className="text-gray-600">
                  Personalized assessments that adapt to individual learning needs
                </p>
              </div>
              <div className="text-center p-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <Zap className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">Instant Feedback</h3>
                <p className="text-gray-600">
                  Real-time results and comprehensive performance analysis
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="py-20 bg-gray-50 flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-blue-50 rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 hover:bg-rose-100 transition-transform duration-300">
                  <div className="p-8">
                    <div className="flex justify-center mb-6">
                      <div className={`w-20 h-20 rounded-full ${member.bgColor} flex items-center justify-center`}>
                        {member.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-center">{member.name}</h3>
                    <p className="text-blue-600 font-medium mb-2 text-center">{member.role}</p>
                    <p className="text-gray-600 text-sm text-center">
                      {member.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <Brain className="h-8 w-8 text-blue-500 mr-3" />
                <span className="text-xl font-bold text-gray-900">Smart Assessment</span>
              </div>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center text-gray-600">
                  <Phone className="h-5 w-5 mr-2 text-blue-500" />
                  <a href="tel:+923193023619" className="hover:text-blue-500 transition-colors">
                    +92 319 0000000
                  </a>
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail className="h-5 w-5 mr-2 text-blue-500" />
                  <a href="mailto:vivekpanu178@gmail.com" className="hover:text-blue-500 transition-colors">
                    xyz@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}