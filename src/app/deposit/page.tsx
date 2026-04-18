'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DepositPage() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const usdtAddress = 'TFj4rDL2MwisN5XfXKNLFoRie7SVWrhh6H';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          txHash,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to submit deposit');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(usdtAddress);
    alert('Address copied to clipboard!');
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full p-6 sm:p-8 bg-white rounded-lg shadow text-center">
          <div className="text-green-600 text-4xl sm:text-5xl mb-4">✓</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Deposit Submitted!</h2>
          <p className="text-gray-600 text-sm sm:text-base mb-4">
            Your deposit is pending verification. We'll notify you once confirmed.
          </p>
          <p className="text-xs sm:text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Make a Deposit</h1>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded text-sm mb-4">
              {error}
            </div>
          )}

          {/* USDT Address Display */}
          <div className="bg-gray-100 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Send USDT (TRC-20) to:</p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-2 sm:p-3 rounded border gap-2">
              <code className="text-xs sm:text-sm text-gray-900 break-all">{usdtAddress}</code>
              <button
                onClick={copyAddress}
                className="text-green-600 hover:text-green-700 text-xs sm:text-sm font-medium whitespace-nowrap"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Only send USDT on TRC-20 network. Other networks will be lost.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Amount (USDT)
              </label>
              <input
                type="number"
                step="0.01"
                min="500"
                required
                placeholder="Minimum $500"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm sm:text-base"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Minimum deposit: $500</p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Transaction Hash (TXID)
              </label>
              <input
                type="text"
                required
                placeholder="Paste transaction hash here"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm sm:text-base"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Find this in your wallet after sending
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2.5 sm:py-3 rounded-md hover:bg-green-700 disabled:opacity-50 font-medium text-sm sm:text-base"
            >
              {loading ? 'Submitting...' : 'Submit Deposit'}
            </button>
          </form>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full mt-4 text-gray-600 hover:text-gray-900 text-xs sm:text-sm"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}