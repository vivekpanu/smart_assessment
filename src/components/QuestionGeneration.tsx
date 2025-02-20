import React, { useState } from 'react';
import { 
  Upload,
  FileText,
  Type,
  Brain,
  Loader,
  Hash,
  Copy,
  Edit2,
  Save,
  Download,
  X,
  Menu,
  ArrowLeft,
  Folder
} from 'lucide-react';

interface QuestionGenerationProps {
  type: 'mcq' | 'openEnded' | 'bloom';
  taxonomyLevel?: string | null;
  onQuestionsGenerated: (questions: any[]) => void;
  onBack: () => void;
}

export function QuestionGeneration({ 
  type, 
  taxonomyLevel,
  onQuestionsGenerated, 
  onBack 
}: QuestionGenerationProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [numQuestions, setNumQuestions] = useState('5');
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [quizName, setQuizName] = useState('');

  const getPageTitle = () => {
    if (type === 'bloom' && taxonomyLevel) {
      return `${taxonomyLevel} Questions`;
    }
    switch (type) {
      case 'mcq':
        return 'Multiple Choice Questions';
      case 'openEnded':
        return 'Open Ended Questions';
      case 'bloom':
        return "Bloom's Taxonomy Questions";
      default:
        return 'Question Generation';
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setInputText(text);
      };
      reader.readAsText(file);
    }
  };

  const handleGenerate = async () => {
    if (!inputText) return;
    
    setIsGenerating(true);
    try {
      // TODO: Implement AI question generation logic here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated delay
      
      // Mock generated questions
      const mockQuestions = [
        {
          question: "What is the capital of France?",
          options: ["London", "Berlin", "Paris", "Madrid"],
          correctAnswer: 2
        },
        {
          question: "Which planet is known as the Red Planet?",
          options: ["Venus", "Mars", "Jupiter", "Saturn"],
          correctAnswer: 1
        }
      ];
      
      setGeneratedQuestions(mockQuestions);
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    const questionsText = generatedQuestions
      .map((q, i) => `${i + 1}. ${q.question}\n${q.options.map((opt: string, j: number) => `   ${String.fromCharCode(97 + j)}) ${opt}`).join('\n')}`)
      .join('\n\n');
    navigator.clipboard.writeText(questionsText);
  };

  const handleSave = () => {
    if (!quizName.trim()) {
      alert('Please enter a quiz name before saving');
      return;
    }
    onQuestionsGenerated(generatedQuestions);
  };

  const handleDownload = () => {
    const questionsText = generatedQuestions
      .map((q, i) => `${i + 1}. ${q.question}\n${q.options.map((opt: string, j: number) => `   ${String.fromCharCode(97 + j)}) ${opt}`).join('\n')}`)
      .join('\n\n');
    
    const blob = new Blob([questionsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quizName || 'generated-questions'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 mr-3 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <button
                onClick={onBack}
                className="p-2 mr-3 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-800">{getPageTitle()}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
        {/* Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed lg:static inset-y-0 left-0 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } w-80 bg-white shadow-lg transition-transform duration-300 ease-in-out z-50 lg:z-0 overflow-y-auto`}>
          <div className="p-4 space-y-6">
            {/* Number of Questions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter number of questions"
                />
              </div>
            </div>

            {/* Text Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Input Text
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your text here..."
                className="w-full h-48 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload File
              </label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">TXT, PDF, DOC, DOCX (MAX. 10MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                />
              </label>
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected file: {selectedFile.name}
                </p>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !inputText}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5 mr-2" />
                  Generate Questions
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4 lg:p-6 lg:ml-0">
          {/* Quiz Name Input */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
            <div className="flex items-center">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quiz Name
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={quizName}
                    onChange={(e) => setQuizName(e.target.value)}
                    placeholder="Enter quiz name..."
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button className="ml-2 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Folder className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                onClick={handleCopy}
                disabled={!generatedQuestions.length}
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <Copy className="w-5 h-5 mr-2" />
                <span>Copy</span>
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                disabled={!generatedQuestions.length}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                  isEditing 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Edit2 className="w-5 h-5 mr-2" />
                <span>Edit</span>
              </button>
              <button
                onClick={handleSave}
                disabled={!generatedQuestions.length}
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="w-5 h-5 mr-2" />
                <span>Save</span>
              </button>
              <button
                onClick={handleDownload}
                disabled={!generatedQuestions.length}
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <Download className="w-5 h-5 mr-2" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Generated Questions Area */}
          <div className="border-2 border-gray-200 rounded-xl bg-white min-h-[500px] p-4 lg:p-6 overflow-y-auto">
            {generatedQuestions.length > 0 ? (
              <div className="space-y-6">
                {generatedQuestions.map((question, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-lg p-4 lg:p-6 relative border border-gray-100">
                    <div className="absolute -left-3 -top-3 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
                        {question.question}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {question.options.map((option: string, optIndex: number) => (
                          <div
                            key={optIndex}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              question.correctAnswer === optIndex
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center">
                              <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-3 text-sm font-medium">
                                {String.fromCharCode(65 + optIndex)}
                              </span>
                              {option}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[500px]">
                <Brain className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg text-center">
                  Enter text and generate questions to see them here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}