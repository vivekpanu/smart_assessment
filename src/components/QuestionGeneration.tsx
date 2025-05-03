// components/QuestionGeneration.tsx

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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

// interface for quiz data
interface QuizData {
  userId: string;
  quizName: string;
  questions: any[];
  context: string;
  type: 'mcq' | 'openEnded' | 'bloom';
  taxonomyLevel?: string | null;
  createdAt: Date;
}

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
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [quizName, setQuizName] = useState('');
  const [userId, setUserId] = useState<string>('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  
  // Get user ID when component mounts
  React.useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

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

  const handleNumQuestionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const num = value ? parseInt(value, 10) : 0;
    if (num >= 1 && num <= 50) {
      setNumQuestions(num);
    }
  };
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (file.size > MAX_FILE_SIZE) {
    setFileError('File size exceeds 10MB limit');
    return;
  }
  setFileError(null);
  setSelectedFile(file);
  setIsProcessingFile(true);

  try {
    let text = '';
    
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      try {
        const pdfjs = await import('pdfjs-dist');
        const pdfWorker = await import('pdfjs-dist/build/pdf.worker?url');
        
        // Correctly set the worker source using the imported URL
        pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker.default;

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument(new Uint8Array(arrayBuffer));
        
        const pdf = await loadingTask.promise;
        let extractedText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          extractedText += textContent.items.map((item: any) => item.str).join(' ');
        }
        
        text = extractedText.trim();
        
        if (!text) {
          throw new Error('PDF contains no selectable text. Please upload a text-based PDF.');
        }
      } catch (error) {
        console.error('PDF processing error:', error);
        throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : 'File may be corrupted or non-text based'}`);
      }
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.docx')
    ) {
      // Handle DOCX files
      const mammoth = await import('mammoth');
      const result = await mammoth.default.extractRawText({ 
        arrayBuffer: await file.arrayBuffer() 
      });
      text = result.value;
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      // Handle text files
      text = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      });
    } else {
      throw new Error('Unsupported file format');
    }

    setInputText(text);
  } catch (error) {
    console.error('File processing error:', error);
    setFileError(
      error instanceof Error ? error.message : 'Error processing file. Please ensure it\'s a valid text-based PDF, DOCX, or TXT file.'
    );
    setSelectedFile(null);
  } finally {
    setIsProcessingFile(false);
    // Reset the file input after processing
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }
};

  const generateDisabled = isGenerating || (!inputText && !selectedFile) || isProcessingFile;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      // Create a new FileList using DataTransfer
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      // Update the file input files
      fileInputRef.current.files = dataTransfer.files;
      
      // Trigger the file upload handler
      await handleFileUpload({ 
        target: fileInputRef.current 
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };
  const handleGenerate = async () => {
    try {
      // Validate inputs
      if ((!inputText || !inputText.trim()) && !selectedFile) {
        toast.error('Please provide context text or upload a file');
        return;
      }
      const finalContext = inputText.trim();
    if (!finalContext) {
      toast.error('Please provide valid context text or upload a file');
      return;
    }
      if (isNaN(numQuestions) || numQuestions <= 0 || numQuestions > 50) {
        toast.error('Please enter a valid number of questions (1-50)');
        return;
      }
  
      setIsGenerating(true);
  
      // Prepare payload
      const payload = {
        context: finalContext,
        numQuestions: numQuestions,
        questionType: type,
        ...(taxonomyLevel && { taxonomyLevel: taxonomyLevel })
      };
  
      const res = await fetch('http://localhost:5000/generate-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
  
      const data = await res.json();
      
      // Handle response
      if (type === 'mcq') {
        if (data.mcqs) {
          setGeneratedQuestions(data.mcqs);
          toast.success('MCQs generated successfully!');
        } else {
          throw new Error('No MCQs generated');
        }
      } else {
        if (data.questions) {
          const formattedQuestions = data.questions.map((q: string) => ({ question: q }));
          setGeneratedQuestions(formattedQuestions);
          toast.success(`${data.questions.length} questions generated!`);
        } else {
          throw new Error('No questions generated');
        }
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to generate questions');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    const questionsText = generatedQuestions
      .map((q, i) => `${i + 1}. ${q.question}`)
      .join('\n\n');
    navigator.clipboard.writeText(questionsText);
  };

  const handleSave = async () => {
    if (!quizName.trim()) {
      alert('Please enter a quiz name before saving');
      return;
    }
  
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        alert('User ID not found. Please log in again.');
        return;
      }
  
      // Process questions based on type
      try {
        const questionsToSave = generatedQuestions.map(q => {
          if (type === 'mcq') {
            return {
              question: q.question,
              options: q.options,
              correctAnswer: q.options.indexOf(q.answer)
            };
          } else {
            return { question: q.question };
          }
        });
    
        const response = await fetch('http://localhost:5000/save-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            quizName,
            context: inputText,
            questions: questionsToSave,
            questionType: type
          }),
        });
  
      const result = await response.json();
  
      if (response.ok) {
        alert('Questions saved successfully!');
        onQuestionsGenerated(questionsToSave);
      } else {
        console.error('Save error:', result.error);
        alert('Failed to save questions.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving.');
    }
  }catch (err) {
    console.error(err);
    alert('An error occurred while saving.');
  }
};
  
  

  const handleDownload = () => {
    const questionsText = generatedQuestions
      .map((q, i) => `${i + 1}. ${q.question}`)
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
    <div className="min-h-screen bg-blue-50">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={numQuestions}
                  onChange={handleNumQuestionsChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter number of questions"
                />
              </div>
            </div>

            <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Input Context</label>
        <div className="space-y-4">
          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setSelectedFile(null);
            }}
            placeholder="Paste your text here..."
            className="border-4 w-full h-48 p-3 border rounded-lg focus:border-red resize-none"
          />

          <div className="relative">
            <label 
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {isProcessingFile ? (
                  <Loader className="w-8 h-8 text-gray-400 mb-2 animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                )}
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">TXT, PDF, DOCX (MAX. 10MB)</p>
              </div>
              <input
  ref={fileInputRef}
  type="file"
  className="hidden"
  accept=".txt,.pdf,.docx"
  onChange={handleFileUpload}
/>
            </label>
            {selectedFile && (
              <div className="mt-2 flex items-center text-sm text-gray-600">
                <FileText className="w-4 h-4 mr-2" />
                {selectedFile.name}
                <button 
                  onClick={() => {
                    setSelectedFile(null);
                    setInputText('');
                  }}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {fileError && (
              <p className="mt-2 text-sm text-red-500">{fileError}</p>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={generateDisabled}
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

        {/* Main Area */}
        <div className="flex-1 p-4 lg:p-6 lg:ml-0">
          {/* Quiz Name */}
          <div className="border-2 border-gray-400 bg-white rounded-xl shadow-lg p-4 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Name</label>
            <div className="border-black flex items-center">
              <input
                type="text"
                value={quizName}
                onChange={(e) => setQuizName(e.target.value)}
                placeholder="Enter quiz name..."
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-transparent"
              />
              <button className="ml-2 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Folder className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <div className="flex flex-wrap gap-2 justify-end">
              <button onClick={handleCopy} disabled={!generatedQuestions.length} className="flex items-center px-4 py-2 rounded-lg transition-colors hover:bg-blue-100">
                <Copy className="w-5 h-5 mr-2 text-green-800" /> 
                <span className="text-green-700">Copy</span>
              </button>
              <button onClick={() => setIsEditing(!isEditing)} disabled={!generatedQuestions.length} className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isEditing ? 'bg-blue-50 text-purple-600' : 'text-purple-700 hover:bg-blue-100'
              }`}>
                <Edit2 className="text-purple-800 w-5 h-5 mr-2" /> Edit
              </button>
              <button onClick={handleSave} disabled={!generatedQuestions.length} className="flex items-center px-4 py-2 text-green-700 hover:bg-blue-100 rounded-lg transition-colors">
                <Save className="text-green-800 w-5 h-5 mr-2" /> Save
              </button>
              <button onClick={handleDownload} disabled={!generatedQuestions.length} className="flex items-center px-4 py-2 text-indigo-700 hover:bg-blue-100 rounded-lg transition-colors">
                <Download className="text-indigo-800 w-5 h-5 mr-2" /> Download
              </button>
            </div>
          </div>

          {/* Generated Questions */}
          <div className="border-2 border-gray-400 rounded-xl bg-white min-h-[500px] p-4 lg:p-6 overflow-y-auto">
            {generatedQuestions.length > 0 ? (
              <div className="space-y-6">
                {generatedQuestions.map((q: { question: string; options?: string[] }, i: number) => (
  <div key={i} className="bg-gray rounded-xl shadow p-4 border">
    <h3 className="font-semibold mb-2">
      Q{i + 1}: {isEditing ? (
        <input
          value={q.question}
          onChange={(e) => {
            const updated = [...generatedQuestions];
            updated[i].question = e.target.value;
            setGeneratedQuestions(updated);
          }}
          className="border p-1 rounded w-full"
        />
      ) : q.question}
    </h3>
    {type === 'mcq' && q.options && (
      <div className="ml-4 space-y-2">
        {q.options.map((option: string, optIndex: number) => (
          <div key={optIndex} className="flex items-center">
            <span className="mr-2">{String.fromCharCode(65 + optIndex)}.</span>
            {isEditing ? (
              <input
                value={option}
                onChange={(e) => {
                  const updated = [...generatedQuestions];
                  updated[i].options[optIndex] = e.target.value;
                  setGeneratedQuestions(updated);
                }}
                className="border p-1 rounded w-full"
              />
            ) : (
              <span>{option}</span>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
))}
              </div>
            ) : (
              <p className="text-center text-gray-400 mt-10">No questions generated yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}