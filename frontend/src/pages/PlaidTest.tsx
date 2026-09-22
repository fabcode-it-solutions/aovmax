import { useState } from 'react';
import { PlaidConnectButton } from '@/components/PlaidConnectButton';
import { supabase } from '@/integrations/supabase/client';

export default function PlaidTest() {
  const [logs, setLogs] = useState<string[]>([]);
  const [token, setToken] = useState<string>('');

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  const testAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      addLog('✅ Authenticated');
      setToken(session.access_token.substring(0, 20) + '...');
    } else {
      addLog('❌ Not authenticated');
    }
  };

  const testBackend = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        addLog('✅ Backend is reachable');
      } else {
        addLog(`❌ Backend error: ${response.status}`);
      }
    } catch (error) {
      addLog(`❌ Backend not running: ${error}`);
    }
  };

  const testPlaidEndpoint = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        addLog('❌ Not authenticated');
        return;
      }

      addLog('🔄 Calling /api/plaid/create-link-token...');
      const response = await fetch('http://localhost:3001/api/plaid/create-link-token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.link_token) {
        addLog('✅ Link token created successfully!');
      } else if (data.error) {
        addLog(`❌ Plaid error: ${data.error}`);
      } else {
        addLog(`❌ Unexpected response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      addLog(`❌ Request failed: ${error}`);
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ background: '#F9FAFB' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Plaid Integration Test</h1>

        {/* Test Buttons */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Manual Tests</h2>
          <div className="flex gap-3 mb-4">
            <button
              onClick={testAuth}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              1. Test Auth
            </button>
            <button
              onClick={testBackend}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              2. Test Backend
            </button>
            <button
              onClick={testPlaidEndpoint}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              3. Test Plaid Endpoint
            </button>
          </div>
        </div>

        {/* Plaid Button */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Plaid Connect Button</h2>
          <PlaidConnectButton />
          <p className="text-sm text-gray-600 mt-4">
            Click the button above. If it works, you'll see the Plaid Link UI.
          </p>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Run tests above.</p>
            ) : (
              logs.map((log, i) => <div key={i}>{log}</div>)
            )}
          </div>
          <button
            onClick={() => setLogs([])}
            className="mt-3 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
          >
            Clear Logs
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h3 className="font-semibold mb-2">📋 What to Check:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Make sure you're logged in</li>
            <li>Make sure backend is running on localhost:3001</li>
            <li>Check browser console (F12) for errors</li>
            <li>Run the 3 manual tests in order</li>
            <li>Click "Add Bank Account" button</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
