import React from 'react';
import { ExternalLink, Trash2, Plus } from 'lucide-react';

export interface InvestmentLink {
  id: string;
  url: string;
  title: string;
  notes?: string;
  addedAt: number;
}

export interface LinksListProps {
  links: InvestmentLink[];
  onAddLink: () => void;
  onDeleteLink: (id: string) => void;
}

const LinksList: React.FC<LinksListProps> = ({
  links,
  onAddLink,
  onDeleteLink
}) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Research Links</h2>
        <button 
          onClick={onAddLink}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Link
        </button>
      </div>

      {links.length === 0 ? (
        <div className="p-4 text-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">No links added yet. Add research links to help with your investment decision.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map(link => (
            <div 
              key={link.id}
              className="p-3 rounded-lg bg-white border border-gray-200"
            >
              <div className="flex justify-between">
                <h3 className="font-medium text-gray-900 truncate">{link.title}</h3>
                <div className="flex space-x-2">
                  <a 
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button 
                    onClick={() => onDeleteLink(link.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline truncate block mt-1"
              >
                {link.url}
              </a>

              {link.notes && (
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{link.notes}</p>
              )}

              <p className="mt-1 text-xs text-gray-400">
                Added: {new Date(link.addedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LinksList;