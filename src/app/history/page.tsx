'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HistoryPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/transactions')  // or /api/withdrawals if you have separate endpoint
      .then(res => res.json())
      .then(data => {
        setTransactions(data.transactions || data.withdrawals || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-8 text-gray-900">Loading history...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">Transaction History</h1>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left text-gray-900">Type</th>
                  <th className="p-4 text-left text-gray-900">Amount</th>
                  <th className="p-4 text-left text-gray-900">Status</th>
                  <th className="p-4 text-left text-gray-900">Date</th>
                  <th className="p-4 text-left text-gray-900">Details</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t: any, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">
                      {t.type || (t.walletAddress ? 'Withdrawal' : 'Deposit')}
                    </td>
                    <td className="p-4 font-semibold text-gray-900">
                      ${t.amount}
                    </td>
                    <td className="p-4">
                      <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                        t.status === 'confirmed' || t.status === 'approved' 
                          ? 'bg-green-100 text-green-700' 
                          : t.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">
                      {new Date(t.createdAt || t.requestedAt || t.date).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm text-gray-600 max-w-xs">
                      {t.rejectionReason || t.adminMessage || t.reason ? (
                        <span className="text-red-600 font-medium">
                          Rejected: {t.rejectionReason || t.adminMessage || t.reason}
                        </span>
                      ) : t.walletAddress ? (
                        `To: ${t.walletAddress}`
                      ) : t.txHash ? (
                        `TX: ${t.txHash}`
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <button 
          onClick={() => router.push('/dashboard')}
          className="mt-6 text-gray-600 hover:text-gray-900 font-medium"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}