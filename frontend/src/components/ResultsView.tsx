import React from 'react';
import { Download, Code, FileText, CheckCircle } from 'lucide-react';
import { MortgageRulesSchema } from '../types/api';
import { downloadJSON, downloadTypeScript } from '../services/api';

interface ResultsViewProps {
  data: MortgageRulesSchema;
  typescriptCode: string;
  onDownloadJSON?: () => void;
  onDownloadTypeScript?: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  data,
  typescriptCode,
}) => {
  const [activeTab, setActiveTab] = React.useState<'json' | 'typescript'>('json');

  const handleDownloadJSON = () => {
    downloadJSON(data, `${data.lender}-${data.program}-rules.json`);
  };

  const handleDownloadTypeScript = () => {
    downloadTypeScript(typescriptCode, `${data.lender}-${data.program}-rules.ts`);
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Processing Results</h3>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm text-green-600 font-medium">Success</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Lender</p>
            <p className="font-medium">{data.lender}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Program</p>
            <p className="font-medium">{data.program}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Rules</p>
            <p className="font-medium">{data.metadata.totalRules}</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Rule Categories</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.metadata.categories).map(([category, count]) => (
              <span
                key={category}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {category}: {count}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Download Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={handleDownloadJSON}
          className="btn-primary flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Download JSON Schema</span>
        </button>
        <button
          onClick={handleDownloadTypeScript}
          className="btn-primary flex items-center space-x-2"
        >
          <Code className="h-4 w-4" />
          <span>Download TypeScript Code</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('json')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'json'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            JSON Schema
          </button>
          <button
            onClick={() => setActiveTab('typescript')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'typescript'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Code className="h-4 w-4 inline mr-2" />
            TypeScript Code
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="card">
        {activeTab === 'json' ? (
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">JSON Schema Preview</h4>
            <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-sm">
              <code>{JSON.stringify(data, null, 2)}</code>
            </pre>
          </div>
        ) : (
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">TypeScript Code Preview</h4>
            <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-sm">
              <code>{typescriptCode}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Usage Instructions */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex">
          <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
          <div className="ml-3">
            <h4 className="text-sm font-medium text-green-800">Ready to Use</h4>
            <p className="text-sm text-green-700 mt-1">
              Your mortgage rules have been successfully parsed and converted to structured data. 
              Download the files and integrate them into your mortgage application validation system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 