import React from 'react';
import { Download, Code, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { ConstraintNode } from '../types/api';
import { downloadConstraintNodes } from '../services/api';

interface ConstraintNodesViewProps {
  constraintNodes: ConstraintNode[];
  nodeTypes: {
    variables: number;
    values: number;
    comparisonConstraints: number;
    maintainRatioConstraints: number;
    taskConstraints: number;
    conditionalConstraints: number;
    compositeConstraints: number;
  };
  totalNodes: number;
  onDownloadNodes: () => void;
}

export const ConstraintNodesView: React.FC<ConstraintNodesViewProps> = ({
  constraintNodes,
  nodeTypes,
  totalNodes,
  onDownloadNodes,
}) => {
  const [activeTab, setActiveTab] = React.useState<'summary' | 'nodes' | 'types'>('summary');

  const handleDownloadNodes = () => {
    downloadConstraintNodes(constraintNodes, 'constraint-nodes.json');
  };

  const getNodeTypeColor = (typename: string) => {
    switch (typename) {
      case 'Variable':
        return 'bg-blue-100 text-blue-800';
      case 'Value':
        return 'bg-green-100 text-green-800';
      case 'ComparisonConstraint':
        return 'bg-purple-100 text-purple-800';
      case 'MaintainRatioConstraint':
        return 'bg-orange-100 text-orange-800';
      case 'TaskConstraint':
        return 'bg-red-100 text-red-800';
      case 'If':
        return 'bg-yellow-100 text-yellow-800';
      case 'AllOf':
      case 'OneOf':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Constraint Nodes Generated</h3>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm text-green-600 font-medium">Success</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total Nodes</p>
            <p className="font-medium text-2xl">{totalNodes}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Node Types</p>
            <p className="font-medium">{Object.keys(nodeTypes).length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Constraints</p>
            <p className="font-medium">
              {nodeTypes.comparisonConstraints + 
               nodeTypes.maintainRatioConstraints + 
               nodeTypes.taskConstraints + 
               nodeTypes.conditionalConstraints + 
               nodeTypes.compositeConstraints}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Node Type Breakdown</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(nodeTypes).map(([type, count]) => (
              <span
                key={type}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {type}: {count}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Download Button */}
      <div className="flex space-x-4">
        <button
          onClick={handleDownloadNodes}
          className="btn-primary flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Download Constraint Nodes</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'summary'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CheckCircle className="h-4 w-4 inline mr-2" />
            Summary
          </button>
          <button
            onClick={() => setActiveTab('nodes')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'nodes'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Code className="h-4 w-4 inline mr-2" />
            All Nodes
          </button>
          <button
            onClick={() => setActiveTab('types')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'types'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            By Type
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="card">
        {activeTab === 'summary' && (
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Node Generation Summary</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{nodeTypes.variables}</div>
                  <div className="text-sm text-blue-600">Variables</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{nodeTypes.values}</div>
                  <div className="text-sm text-green-600">Values</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{nodeTypes.comparisonConstraints}</div>
                  <div className="text-sm text-purple-600">Comparisons</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{nodeTypes.maintainRatioConstraints}</div>
                  <div className="text-sm text-orange-600">Ratios</div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{nodeTypes.taskConstraints}</div>
                  <div className="text-sm text-red-600">Tasks</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{nodeTypes.conditionalConstraints}</div>
                  <div className="text-sm text-yellow-600">Conditionals</div>
                </div>
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">{nodeTypes.compositeConstraints}</div>
                  <div className="text-sm text-indigo-600">Composite</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'nodes' && (
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">All Constraint Nodes</h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {constraintNodes.map((node, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getNodeTypeColor(node.typename)}`}>
                      {node.typename}
                    </span>
                    <span className="text-xs text-gray-500">#{index + 1}</span>
                  </div>
                  <pre className="text-xs bg-gray-50 rounded p-2 overflow-x-auto">
                    <code>{JSON.stringify(node, null, 2)}</code>
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'types' && (
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Nodes by Type</h4>
            <div className="space-y-4">
              {Object.entries(nodeTypes).map(([type, count]) => {
                const nodesOfType = constraintNodes.filter(n => n.typename === type);
                return (
                  <div key={type} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-900">{type}</h5>
                      <span className="text-sm text-gray-500">{count} nodes</span>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {nodesOfType.map((node, index) => (
                        <div key={index} className="text-xs bg-gray-50 rounded p-2">
                          <code>{JSON.stringify(node, null, 1)}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Usage Instructions */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex">
          <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
          <div className="ml-3">
            <h4 className="text-sm font-medium text-green-800">Constraint Nodes Ready</h4>
            <p className="text-sm text-green-700 mt-1">
              Your mortgage rules have been converted to constraint nodes that can be used with the guideline builder system. 
              Download the JSON file to integrate with your constraint processing pipeline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 