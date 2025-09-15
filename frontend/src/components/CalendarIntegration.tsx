import React, { useState } from 'react';
import { calendarService } from '../services/api';

export const CalendarIntegration: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState('');

  const handleConnectCalendar = async () => {
    setIsConnecting(true);
    try {
      const { authUrl } = await calendarService.getAuthUrl();
      window.open(authUrl, '_blank', 'width=500,height=600');
      setMessage('Please complete the authentication in the popup window and then sync your calendar.');
    } catch (error) {
      setMessage('Failed to get authentication URL');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSyncCalendar = async () => {
    setIsSyncing(true);
    try {
      await calendarService.syncCalendar();
      setMessage('Calendar synced successfully!');
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to sync calendar');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Google Calendar Integration</h3>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.includes('successfully') || message.includes('complete')
            ? 'bg-green-100 text-green-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={handleConnectCalendar}
          disabled={isConnecting}
          className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md ${
            isConnecting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isConnecting ? 'Connecting...' : 'Connect Google Calendar'}
        </button>

        <button
          onClick={handleSyncCalendar}
          disabled={isSyncing}
          className={`bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md ml-3 ${
            isSyncing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSyncing ? 'Syncing...' : 'Sync Calendar'}
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>Connect your Google Calendar to automatically create events when appointments are confirmed.</p>
      </div>
    </div>
  );
};