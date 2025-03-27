import React, { useState } from 'react';
import { X } from 'lucide-react';

export interface CreateReportFormProps {
  onSubmit: (data: { symbol: string; name: string; description: string }) => void;
  onCancel: () => void;
}

const CreateReportForm: React.FC<CreateReportFormProps> = ({ onSubmit, onCancel }) => {
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [symbolError, setSymbolError] = useState('');
  const [nameError, setNameError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    let isValid = true;
    
    if (!symbol) {
      setSymbolError('Stock symbol is required');
      isValid = false;
    } else {
      setSymbolError('');
    }
    
    if (!name) {
      setNameError('Report name is required');
      isValid = false;
    } else {
      setNameError('');
    }
    
    if (isValid) {
      onSubmit({ symbol: symbol.toUpperCase(), name, description });
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Create Investment Report</h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 mb-1">
            Stock Symbol*
          </label>
          <input
            type="text"
            id="symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="AAPL, MSFT, etc."
            className={`w-full px-3 py-2 border rounded-md shadow-sm ${
              symbolError ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
          />
          {symbolError && <p className="mt-1 text-sm text-red-600">{symbolError}</p>}
        </div>
        
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Report Name*
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Apple Investment Analysis"
            className={`w-full px-3 py-2 border rounded-md shadow-sm ${
              nameError ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
          />
          {nameError && <p className="mt-1 text-sm text-red-600">{nameError}</p>}
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why are you interested in this investment?"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Report
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateReportForm;