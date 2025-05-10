import React from 'react';
import { PlusCircle } from 'lucide-react';

export interface Report {
  id: string;
  symbol: string;
  name: string;
  updatedAt: number;
}

export interface ReportsListProps {
  reports: Report[];
  selectedReportId: string | null;
  onSelectReport: (id: string) => void;
  onCreateReport: () => void;
}

const ReportsList: React.FC<ReportsListProps> = ({
  reports,
  selectedReportId,
  onSelectReport,
  onCreateReport
}) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Investment Reports</h2>
        <button 
          onClick={onCreateReport}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <PlusCircle className="w-4 h-4 mr-1" />
          New Report
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="p-4 text-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">No reports yet. Create your first investment report!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reports.map(report => (
            <div 
              key={report.id}
              onClick={() => onSelectReport(report.id)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedReportId === report.id 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'bg-white border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{report.name}</h3>
                  <p className="text-sm text-gray-500">{report.symbol}</p>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(report.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportsList;