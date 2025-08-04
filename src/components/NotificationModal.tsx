import React from 'react';
import { X, Bell, Clock } from 'lucide-react';
import { Notification } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-96 overflow-hidden relative">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-rose-50">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-rose-500" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-rose-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-80">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-rose-50' : ''
                  }`}
                >
                  <p className="text-gray-900 text-sm mb-2">{notification.message}</p>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(notification.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};