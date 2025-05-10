import React, { useState } from 'react';
import { X } from 'lucide-react';

export interface AddLinkFormProps {
  onSubmit: (data: { url: string; title: string; notes?: string }) => void;
  onCancel: () => void;
}

const AddLinkForm: React.FC<AddLinkFormProps> = ({ onSubmit, onCancel }) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [urlError, setUrlError] = useState('');
  const [titleError, setTitleError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    let isValid = true;
    
    if (!url) {
      setUrlError('URL is required');
      isValid = false;
    } else if (!isValidUrl(url)) {
      setUrlError('Please enter a valid URL');
      isValid = false;
    } else {
      setUrlError('');
    }
    
    if (!title) {
      setTitleError('Title is required');
      isValid = false;
    } else {
      setTitleError('');
    }
    
    if (isValid) {
      onSubmit({ url, title, notes: notes || undefined });
    }
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Add Research Link</h3>
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
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            URL*
          </label>
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className={`w-full px-3 py-2 border rounded-md shadow-sm ${
              urlError ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
          />
          {urlError && <p className="mt-1 text-sm text-red-600">{urlError}</p>}
        </div>
        
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title*
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Link title or description"
            className={`w-full px-3 py-2 border rounded-md shadow-sm ${
              titleError ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
          />
          {titleError && <p className="mt-1 text-sm text-red-600">{titleError}</p>}
        </div>
        
        <div className="mb-4">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes about this link"
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
            Add Link
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddLinkForm;