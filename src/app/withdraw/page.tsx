'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WithdrawPage() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount), walletAddress }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit');
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 3000);
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full p-6 sm:p-8 bg-white rounded-lg shadow text-center">
          <div className="text-green-600 text-4xl sm:text-5xl mb-4">✓</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Withdrawal Requested!</h2>
          <p className="text-gray-700 text-sm sm:text-base">Admin will review and process your request.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Request Withdrawal</h1>
          
          {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-1">Amount (USDT)</label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm sm:text-base"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-1">Your TRC-20 Wallet Address</label>
              <input
                type="text"
                required
                placeholder="T..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm sm:text-base"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base font-medium"
            >
              {loading ? 'Submitting...' : 'Request Withdrawal'}
            </button>
          </form>
          
          <button onClick={() => router.push('/dashboard')} className="w-full mt-4 text-gray-900 hover:text-gray-700 text-xs sm:text-sm font-medium">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}