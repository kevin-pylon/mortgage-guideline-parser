import { useState } from 'react';
import { useMutation } from 'react-query';
import { FileUpload } from './components/FileUpload';
import { ParsingForm } from './components/ParsingForm';
import { ResultsView } from './components/ResultsView';
import { ConstraintNodesView } from './components/ConstraintNodesView';
import { LoadingSpinner } from './components/LoadingSpinner';
import { uploadPDF, parseMortgageRules, generateConstraintNodes } from './services/api';
import { MortgageRulesSchema, ParseRequest, ConstraintNode } from './types/api';
import { AlertCircle, Home, FileText, Settings, Code } from 'lucide-react';

type ProcessingStep = 'upload' | 'processing' | 'results' | 'constraints' | 'error';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lenderName, setLenderName] = useState('');
  const [programName, setProgramName] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('upload');
  const [results, setResults] = useState<{
    data: MortgageRulesSchema;
    typescriptCode: string;
  } | null>(null);
  const [constraintNodes, setConstraintNodes] = useState<{
    constraintNodes: ConstraintNode[];
    totalNodes: number;
    nodeTypes: {
      variables: number;
      values: number;
      comparisonConstraints: number;
      maintainRatioConstraints: number;
      taskConstraints: number;
      conditionalConstraints: number;
      compositeConstraints: number;
    };
  } | null>(null);
  const [error, setError] = useState<string>('');

  // Upload mutation
  const uploadMutation = useMutation(uploadPDF, {
    onSuccess: (data) => {
      if (data.success) {
        setCurrentStep('processing');
      } else {
        setError(data.error || 'Upload failed');
        setCurrentStep('error');
      }
    },
    onError: (error: any) => {
      setError(error.message || 'Upload failed');
      setCurrentStep('error');
    },
  });

  // Parse mutation
  const parseMutation = useMutation(parseMortgageRules, {
    onSuccess: (data) => {
      if (data.success && data.data && data.typescriptCode) {
        setResults({
          data: data.data,
          typescriptCode: data.typescriptCode,
        });
        setCurrentStep('results');
      } else {
        setError(data.error || 'Parsing failed');
        setCurrentStep('error');
      }
    },
    onError: (error: any) => {
      setError(error.message || 'Parsing failed');
      setCurrentStep('error');
    },
  });

  // Constraint generation mutation
  const constraintMutation = useMutation(generateConstraintNodes, {
    onSuccess: (data) => {
      if (data.success && data.constraintNodes && data.nodeTypes) {
        setConstraintNodes({
          constraintNodes: data.constraintNodes,
          totalNodes: data.totalNodes || 0,
          nodeTypes: data.nodeTypes,
        });
        setCurrentStep('constraints');
      } else {
        setError(data.error || 'Constraint generation failed');
        setCurrentStep('error');
      }
    },
    onError: (error: any) => {
      setError(error.message || 'Constraint generation failed');
      setCurrentStep('error');
    },
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError('');
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError('');
  };

  const handleStartProcessing = async () => {
    if (!selectedFile || !lenderName || !programName || !openaiApiKey) {
      setError('Please fill in all required fields');
      return;
    }

    setError('');
    setCurrentStep('upload');

    try {
      // Upload the file
      const uploadResult = await uploadMutation.mutateAsync(selectedFile);
      
      if (uploadResult.success) {
        // Parse the mortgage rules
        const parseRequest: ParseRequest = {
          lenderName,
          programName,
          openaiApiKey,
        };
        
        await parseMutation.mutateAsync(parseRequest);
      }
    } catch (error) {
      console.error('Processing error:', error);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setLenderName('');
    setProgramName('');
    setOpenaiApiKey('');
    setCurrentStep('upload');
    setResults(null);
    setConstraintNodes(null);
    setError('');
  };

  const isProcessing = uploadMutation.isLoading || parseMutation.isLoading || constraintMutation.isLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Home className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Mortgage Rules Parser
              </h1>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <FileText className="h-4 w-4" />
                <span>PDF Processing</span>
              </div>
              <div className="flex items-center space-x-1">
                <Settings className="h-4 w-4" />
                <span>AI-Powered</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center space-x-2 ${
              currentStep === 'upload' || currentStep === 'processing' || currentStep === 'results' 
                ? 'text-primary-600' 
                : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'upload' || currentStep === 'processing' || currentStep === 'results'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <span className="font-medium">Upload PDF</span>
            </div>
            
            <div className="w-8 h-0.5 bg-gray-300"></div>
            
            <div className={`flex items-center space-x-2 ${
              currentStep === 'processing' || currentStep === 'results' 
                ? 'text-primary-600' 
                : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'processing' || currentStep === 'results'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <span className="font-medium">Process</span>
            </div>
            
            <div className="w-8 h-0.5 bg-gray-300"></div>
            
            <div className={`flex items-center space-x-2 ${
              currentStep === 'results' || currentStep === 'constraints'
                ? 'text-primary-600' 
                : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'results' || currentStep === 'constraints'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                3
              </div>
              <span className="font-medium">Results</span>
            </div>
            
            <div className="w-8 h-0.5 bg-gray-300"></div>
            
            <div className={`flex items-center space-x-2 ${
              currentStep === 'constraints' 
                ? 'text-primary-600' 
                : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'constraints'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                4
              </div>
              <span className="font-medium">Constraints</span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {currentStep === 'upload' && (
          <div className="space-y-8">
            {/* File Upload */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Step 1: Upload PDF File
              </h2>
              <FileUpload
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                onRemoveFile={handleRemoveFile}
                isUploading={isProcessing}
              />
            </div>

            {/* Parsing Form */}
            {selectedFile && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Step 2: Configure Processing
                </h2>
                <ParsingForm
                  lenderName={lenderName}
                  programName={programName}
                  openaiApiKey={openaiApiKey}
                  onLenderNameChange={setLenderName}
                  onProgramNameChange={setProgramName}
                  onOpenaiApiKeyChange={setOpenaiApiKey}
                  isProcessing={isProcessing}
                />
                
                <div className="mt-6 flex space-x-4">
                  <button
                    onClick={handleStartProcessing}
                    disabled={isProcessing || !selectedFile || !lenderName || !programName || !openaiApiKey}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Processing...' : 'Start Processing'}
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={isProcessing}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Processing State */}
        {currentStep === 'processing' && (
          <div className="card">
            <div className="py-12">
              <LoadingSpinner 
                message="Analyzing your PDF and extracting mortgage rules..." 
                size="lg" 
              />
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  This may take a few minutes depending on the size and complexity of your PDF.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {currentStep === 'results' && results && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Processing Complete
              </h2>
              <div className="flex space-x-4">
                <button
                  onClick={async () => {
                    if (results.data) {
                      await constraintMutation.mutateAsync(results.data);
                    }
                  }}
                  disabled={constraintMutation.isLoading}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Code className="h-4 w-4" />
                  <span>{constraintMutation.isLoading ? 'Generating...' : 'Generate Constraint Nodes'}</span>
                </button>
                <button
                  onClick={handleReset}
                  className="btn-secondary"
                >
                  Process Another File
                </button>
              </div>
            </div>
            <ResultsView
              data={results.data}
              typescriptCode={results.typescriptCode}
              onDownloadJSON={() => {}}
              onDownloadTypeScript={() => {}}
            />
          </div>
        )}

        {/* Constraint Nodes */}
        {currentStep === 'constraints' && constraintNodes && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Constraint Nodes Generated
              </h2>
              <button
                onClick={handleReset}
                className="btn-secondary"
              >
                Process Another File
              </button>
            </div>
            <ConstraintNodesView
              constraintNodes={constraintNodes.constraintNodes}
              nodeTypes={constraintNodes.nodeTypes}
              totalNodes={constraintNodes.totalNodes}
              onDownloadNodes={() => {}}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>
              Mortgage Rules Parser - Convert PDF mortgage guidelines into structured data and TypeScript code
            </p>
            <p className="mt-2">
              Powered by OpenAI's structured output technology
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App; 