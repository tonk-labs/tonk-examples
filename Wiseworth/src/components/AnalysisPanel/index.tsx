import React from 'react';
import { Lightbulb, RefreshCw } from 'lucide-react';

export interface AnalysisPanelProps {
  reportId: string | null;
  isGenerating: boolean;
  analysis: string | null;
  onGenerateAnalysis: () => void;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  reportId,
  isGenerating,
  analysis,
  onGenerateAnalysis
}) => {
  if (!reportId) {
    return null;
  }

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <div className="flex items-center">
          <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">Investment Analysis</h2>
        </div>
        <button
          onClick={onGenerateAnalysis}
          disabled={isGenerating}
          className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50 flex items-center"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
              Generating...
            </>
          ) : analysis ? (
            <>
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Refresh Analysis
            </>
          ) : (
            'Generate Analysis'
          )}
        </button>
      </div>

      <div className="p-4">
        {isGenerating ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Analyzing investment data...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
            </div>
          </div>
        ) : analysis ? (
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: analysis }} />
          </div>
        ) : (
          <div className="text-center py-8">
            <Lightbulb className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Generate an AI-powered analysis to help with your investment decision</p>
            <p className="text-sm text-gray-400 mt-2">Analysis will be based on stock data and your research links</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisPanel;