import React, { useState } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';
import { Report } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: { type: Report['type']; description: string }) => Promise<void>;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [type, setType] = useState<Report['type']>('maintenance');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit({ type, description });
      setType('maintenance');
      setDescription('');
      onClose();
    } catch (error: any) {
      console.error('Failed to submit report:', error);
      setError(error.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-rose-50">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-rose-500" />
            <h2 className="text-lg font-semibold text-gray-900">Report Issue</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-rose-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Issue Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as Report['type'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              <option value="maintenance">Maintenance</option>
              <option value="traffic">Traffic</option>
              <option value="passenger">Passenger Issue</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
              placeholder="Describe the issue in detail..."
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !description.trim()}
              className="flex-1 bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>{loading ? 'Submitting...' : 'Submit'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};