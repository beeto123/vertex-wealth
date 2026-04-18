'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [investors, setInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'deposits' | 'withdrawals' | 'investors' | 'interest'>('deposits');

  // Interest calculation states
  const [calculatingInterest, setCalculatingInterest] = useState(false);
  const [interestResult, setInterestResult] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      if (!data.user?.isAdmin) {
        router.push('/admin/login');
        return;
      }
      fetchAllData();
    } catch {
      router.push('/admin/login');
    }
  };

  const fetchAllData = async () => {
    try {
      const [res1, res2, res3] = await Promise.all([
        fetch('/api/admin/deposits'),
        fetch('/api/admin/withdrawals'),
        fetch('/api/admin/investors')
      ]);

      const [data1, data2, data3] = await Promise.all([
        res1.json(),
        res2.json(),
        res3.json()
      ]);

      setDeposits(data1.deposits || []);
      setWithdrawals(data2.withdrawals || []);
      setInvestors(data3.investors || []);
      setError('');
    } catch (err) {
      setError('Failed to load data. Check API endpoints.');
    } finally {
      setLoading(false);
    }
  };

  // === HANDLERS ===
  const handleApproveDeposit = async (id: string) => {
    await fetch('/api/admin/deposits/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ depositId: id })
    });
    fetchAllData();
  };

  const handleRejectDeposit = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    await fetch('/api/admin/deposits/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ depositId: id, reason })
    });
    fetchAllData();
  };

  const handleApproveWithdrawal = async (id: string) => {
    await fetch('/api/admin/withdrawals/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ withdrawalId: id })
    });
    fetchAllData();
  };

  const handleRejectWithdrawal = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    await fetch('/api/admin/withdrawals/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ withdrawalId: id, reason })
    });
    fetchAllData();
  };

  const handleFreezeAccount = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'frozen' : 'active';
    await fetch('/api/admin/investors/freeze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, status: newStatus })
    });
    fetchAllData();
  };

  const handleChangeInterestRate = async (userId: string) => {
    const newRate = prompt('Enter new daily interest rate (9-13):');
    if (!newRate || parseFloat(newRate) < 9 || parseFloat(newRate) > 13) {
      alert('Rate must be between 9 and 13');
      return;
    }
    await fetch('/api/admin/investors/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, rate: newRate })
    });
    fetchAllData();
  };

  const handleCalculateInterest = async () => {
    if (!confirm('Run daily interest for ALL active investors?')) return;

    setCalculatingInterest(true);
    setInterestResult('');

    try {
      const res = await fetch('/api/cron/interest');
      const data = await res.json();

      if (data.success) {
        setInterestResult(`✅ Interest credited to ${data.processed} investors`);
      } else {
        setInterestResult('❌ Failed to calculate interest');
      }
    } catch {
      setInterestResult('❌ Error occurred');
    } finally {
      setCalculatingInterest(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-900 text-lg">Loading Admin Panel...</p>
      </div>
    );
  }

  const pendingDeposits = deposits.filter(d => d.status === 'pending');
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAV */}
      <nav className="bg-red-600 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold">Admin Panel - Vertex Wealth</h1>
            <div className="flex items-center gap-6">
              <a href="/dashboard" className="text-sm hover:underline">My Dashboard</a>
              <button onClick={() => router.push('/api/auth/logout')} className="text-sm hover:underline">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* TABS */}
        <div className="flex gap-2 mb-8 border-b overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('deposits')}
            className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap ${activeTab === 'deposits' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            Deposits ({pendingDeposits.length})
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap ${activeTab === 'withdrawals' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            Withdrawals ({pendingWithdrawals.length})
          </button>
          <button
            onClick={() => setActiveTab('investors')}
            className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap ${activeTab === 'investors' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            All Investors ({investors.length})
          </button>
          <button
            onClick={() => setActiveTab('interest')}
            className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap ${activeTab === 'interest' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            Run Daily Interest
          </button>
        </div>

        {/* DEPOSITS TAB */}
        {activeTab === 'deposits' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Pending Deposits</h2>
            {pendingDeposits.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl text-center text-gray-500">No pending deposits</div>
            ) : (
              pendingDeposits.map((d) => (
                <div key={d.id} className="bg-white p-6 rounded-2xl shadow mb-4 flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{d.user?.fullName} ({d.user?.email})</p>
                    <p className="text-3xl font-bold text-green-600">${d.amount}</p>
                    <p className="text-xs text-gray-500 mt-1">TX: {d.txHash}</p>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button onClick={() => handleApproveDeposit(d.id)} className="flex-1 sm:flex-none bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700">Approve</button>
                    <button onClick={() => handleRejectDeposit(d.id)} className="flex-1 sm:flex-none bg-red-100 text-red-700 px-8 py-3 rounded-xl hover:bg-red-200">Reject</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* WITHDRAWALS TAB */}
        {activeTab === 'withdrawals' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Pending Withdrawals</h2>
            {pendingWithdrawals.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl text-center text-gray-500">No pending withdrawals</div>
            ) : (
              pendingWithdrawals.map((w) => (
                <div key={w.id} className="bg-white p-6 rounded-2xl shadow mb-4 flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{w.user?.fullName} ({w.user?.email})</p>
                    <p className="text-3xl font-bold text-blue-600">${w.amount}</p>
                    <p className="text-xs text-gray-500 mt-1">To: {w.walletAddress}</p>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button onClick={() => handleApproveWithdrawal(w.id)} className="flex-1 sm:flex-none bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700">Approve</button>
                    <button onClick={() => handleRejectWithdrawal(w.id)} className="flex-1 sm:flex-none bg-red-100 text-red-700 px-8 py-3 rounded-xl hover:bg-red-200">Reject</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* INVESTORS TAB */}
        {activeTab === 'investors' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">All Investors</h2>
            <div className="bg-white rounded-2xl shadow overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-4 text-left">Name</th>
                    <th className="p-4 text-left">Email</th>
                    <th className="p-4 text-left">Balance</th>
                    <th className="p-4 text-left">Rate</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {investors.map((inv) => (
                    <tr key={inv.id} className="border-t">
                      <td className="p-4 font-medium text-gray-900">{inv.fullName}</td>
                      <td className="p-4 text-gray-600">{inv.email}</td>
                      <td className="p-4 font-semibold">${inv.balance?.currentBalance || '0.00'}</td>
                      <td className="p-4">{inv.interestRate}%</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs ${inv.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleFreezeAccount(inv.id, inv.status)}
                          className="text-xs px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 mr-2"
                        >
                          {inv.status === 'active' ? 'Freeze' : 'Unfreeze'}
                        </button>
                        <button
                          onClick={() => handleChangeInterestRate(inv.id)}
                          className="text-xs px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200"
                        >
                          Change Rate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* INTEREST TAB */}
        {activeTab === 'interest' && (
          <div className="bg-white rounded-3xl shadow p-10 text-center max-w-xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Daily Interest Engine</h2>
            <p className="text-gray-600 mb-8">Click below to credit today’s interest to every active investor with $500+ balance.</p>

            <button
              onClick={handleCalculateInterest}
              disabled={calculatingInterest}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold text-xl px-12 py-6 rounded-2xl transition"
            >
              {calculatingInterest ? 'Calculating...' : '🚀 Run Daily Interest Now'}
            </button>

            {interestResult && (
              <p className={`mt-6 text-lg font-medium ${interestResult.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                {interestResult}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}