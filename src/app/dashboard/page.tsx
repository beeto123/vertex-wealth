'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  fullName: string;
  isAdmin: boolean;
}

interface Transaction {
  id?: string;
  amount: string;
  status: string;
  type: string;
  createdAt?: string;
  requestedAt?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState({
    currentBalance: '0',
    totalDeposited: '0',
    totalWithdrawn: '0',
    totalInterestEarned: '0',
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) {
          router.push('/login');
          return;
        }
        const authData = await authRes.json();
        setUser(authData.user);

        const balanceRes = await fetch('/api/balance');
        if (balanceRes.ok) {
          const balanceData = await balanceRes.json();
          setBalance({
            currentBalance: balanceData.currentBalance || '0',
            totalDeposited: balanceData.totalDeposited || '0',
            totalWithdrawn: balanceData.totalWithdrawn || '0',
            totalInterestEarned: balanceData.totalInterestEarned || '0',
          });
        }

        const txRes = await fetch('/api/transactions');
        if (txRes.ok) {
          const txData = await txRes.json();
          setRecentTransactions((txData.transactions || []).slice(0, 5));
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  const getDate = (tx: Transaction) => {
    const dateStr = tx.createdAt || tx.requestedAt;
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB');
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Vertex Wealth</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-900 hidden sm:block">{user.fullName}</span>
              {user.isAdmin && (
                <a href="/admin" className="text-red-600 hover:text-red-500 text-sm">Admin</a>
              )}
              <button
                onClick={() => router.push('/api/auth/logout')}
                className="text-red-600 hover:text-red-500 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Welcome back, {user.fullName}!
          </h2>
          <p className="text-gray-600 mt-1">Your daily interest rate: 9-13% (set by admin)</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 sm:p-6 rounded-xl shadow">
            <p className="text-xs sm:text-sm text-gray-700">Current Balance</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">
              ${balance.currentBalance}
            </p>
          </div>
          <div className="bg-white p-5 sm:p-6 rounded-xl shadow">
            <p className="text-xs sm:text-sm text-gray-700">Total Deposited</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1">
              ${balance.totalDeposited}
            </p>
          </div>
          <div className="bg-white p-5 sm:p-6 rounded-xl shadow">
            <p className="text-xs sm:text-sm text-gray-700">Total Withdrawn</p>
            <p className="text-2xl sm:text-3xl font-bold text-orange-600 mt-1">
              ${balance.totalWithdrawn}
            </p>
          </div>
          <div className="bg-white p-5 sm:p-6 rounded-xl shadow">
            <p className="text-xs sm:text-sm text-gray-700">Interest Earned</p>
            <p className="text-2xl sm:text-3xl font-bold text-purple-600 mt-1">
              ${balance.totalInterestEarned}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          
            href="/deposit"
            className="bg-green-600 text-white py-4 rounded-xl text-center font-medium hover:bg-green-700"
          >
            Make Deposit
          </a>
          
            href="/withdraw"
            className="bg-blue-600 text-white py-4 rounded-xl text-center font-medium hover:bg-blue-700"
          >
            Request Withdrawal
          </a>
          
            href="/history"
            className="bg-gray-700 text-white py-4 rounded-xl text-center font-medium hover:bg-gray-800"
          >
            Full History
          </a>
        </div>

        <div className="bg-white rounded-2xl shadow p-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
            <a href="/history" className="text-sm text-green-600 hover:text-green-700">
              View All →
            </a>
          </div>
          {recentTransactions.length === 0 ? (
            <p className="text-gray-600 py-8 text-center">No transactions yet</p>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((tx, i) => (
                <div key={i} className="flex justify-between items-center border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium capitalize text-gray-900">{tx.type}</p>
                    <p className="text-sm text-gray-500">{getDate(tx)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${tx.amount}</p>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusStyle(tx.status)}`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
