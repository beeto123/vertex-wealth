'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid credentials');
        return;
      }

      if (!data.user.isAdmin) {
        setError('Access denied. Admin only.');
        return;
      }

      router.push('/admin');
    } catch (err) {
      setError('Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
      <div className="max-w-md w-full space-y-6 p-6 sm:p-8 bg-white rounded-lg shadow border-2 border-red-200">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-red-700">Admin Access</h2>
          <p className="mt-2 text-gray-700 text-sm sm:text-base">Vertex Wealth Group - Authorized Personnel Only</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded text-sm border border-red-200">{error}</div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-900">Admin Email</label>
            <input
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm sm:text-base"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">Password</label>
            <input
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm sm:text-base"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 sm:py-3 px-4 border border-transparent rounded-md shadow-sm text-sm sm:text-base font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Access Admin Panel'}
          </button>
        </form>

        <a href="/" className="block text-center text-sm text-gray-600 hover:text-gray-900">
          ← Back to Website
        </a>
      </div>
    </div>
  );
}