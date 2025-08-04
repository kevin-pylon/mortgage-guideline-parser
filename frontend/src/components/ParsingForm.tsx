import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface ParsingFormProps {
  lenderName: string;
  programName: string;
  openaiApiKey: string;
  onLenderNameChange: (value: string) => void;
  onProgramNameChange: (value: string) => void;
  onOpenaiApiKeyChange: (value: string) => void;
  isProcessing: boolean;
}

export const ParsingForm: React.FC<ParsingFormProps> = ({
  lenderName,
  programName,
  openaiApiKey,
  onLenderNameChange,
  onProgramNameChange,
  onOpenaiApiKeyChange,
  isProcessing,
}) => {
  const [showApiKey, setShowApiKey] = React.useState(false);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="lenderName" className="block text-sm font-medium text-gray-700 mb-1">
          Lender Name *
        </label>
        <input
          id="lenderName"
          type="text"
          value={lenderName}
          onChange={(e) => onLenderNameChange(e.target.value)}
          disabled={isProcessing}
          className="input-field"
          placeholder="e.g., ABC Bank"
          required
        />
      </div>

      <div>
        <label htmlFor="programName" className="block text-sm font-medium text-gray-700 mb-1">
          Program Name *
        </label>
        <input
          id="programName"
          type="text"
          value={programName}
          onChange={(e) => onProgramNameChange(e.target.value)}
          disabled={isProcessing}
          className="input-field"
          placeholder="e.g., Conventional Loan"
          required
        />
      </div>

      <div>
        <label htmlFor="openaiApiKey" className="block text-sm font-medium text-gray-700 mb-1">
          OpenAI API Key *
        </label>
        <div className="relative">
          <input
            id="openaiApiKey"
            type={showApiKey ? 'text' : 'password'}
            value={openaiApiKey}
            onChange={(e) => onOpenaiApiKeyChange(e.target.value)}
            disabled={isProcessing}
            className="input-field pr-10"
            placeholder="sk-..."
            required
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            disabled={isProcessing}
          >
            {showApiKey ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Your API key is used only for processing and is not stored
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">About OpenAI API Key</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">OpenAI Platform</a></li>
          <li>• The API key is used to analyze your PDF and extract mortgage rules</li>
          <li>• Processing costs depend on the size and complexity of your PDF</li>
          <li>• Your API key is not stored and is only used for processing</li>
        </ul>
      </div>
    </div>
  );
}; 