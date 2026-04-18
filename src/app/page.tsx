'use client';

import { useState } from 'react';

export default function HomePage() {
  const [recentDeposits] = useState([
    { name: 'Michael T.', amount: 2500, time: '2 min ago' },
    { name: 'Sarah K.', amount: 5200, time: '5 min ago' },
    { name: 'David R.', amount: 1750, time: '8 min ago' },
    { name: 'Aisha Bello', amount: 3800, time: '12 min ago' },
  ]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">V</div>
            <h1 className="text-2xl font-bold text-gray-900">Vertex Wealth</h1>
          </div>

          <div className="flex items-center gap-8">
            <a href="#how" className="hidden md:block text-gray-700 hover:text-gray-900 font-medium">How it Works</a>
            <a href="#why" className="hidden md:block text-gray-700 hover:text-gray-900 font-medium">Why Us</a>
            <a href="/login" className="text-gray-700 hover:text-gray-900 font-medium">Login</a>
            <a href="/register" className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition">
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-green-800 via-emerald-800 to-teal-900 text-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Earn <span className="text-green-400">9-13% Daily</span><br />on Your USDT
          </h2>
          <p className="text-xl text-green-100 max-w-2xl mx-auto mb-10">
            Professional crypto investment platform trusted by 200+ local investors. 
            Licensed • Secure • Transparent
          </p>
          <a href="/register" className="inline-block bg-white text-green-800 px-10 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-100 transition">
            Start Investing Now • Min. $500
          </a>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="bg-white py-6 border-b">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold text-green-600">$2.83M</p>
            <p className="text-gray-600 text-sm">ROI Paid to Investors</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-green-600">247</p>
            <p className="text-gray-600 text-sm">Active Investors</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-green-600">98.7%</p>
            <p className="text-gray-600 text-sm">Successful Withdrawals</p>
          </div>
        </div>
      </div>

      {/* Live Deposits */}
      <div className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-green-400 text-center text-sm mb-6">🔴 LIVE DEPOSITS THIS HOUR</p>
          <div className="space-y-4">
            {recentDeposits.map((dep, i) => (
              <div key={i} className="bg-gray-800 rounded-2xl p-5 flex justify-between items-center">
                <span className="text-lg text-white">{dep.name} just deposited</span>
                <div className="text-right">
                  <span className="text-green-400 font-bold text-xl">+${dep.amount.toLocaleString()}</span>
                  <p className="text-xs text-gray-400">{dep.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <section className="py-20 bg-white" id="why">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-4xl font-bold text-center mb-16 text-gray-900">Why Smart Investors Choose Vertex</h3>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="text-6xl mb-6">🔒</div>
              <h4 className="text-2xl font-semibold mb-3 text-gray-900">Bank-Grade Security</h4>
              <p className="text-gray-600">Cold storage, 2FA, and licensed MSB protection.</p>
            </div>
            <div className="text-center">
              <div className="text-6xl mb-6">📈</div>
              <h4 className="text-2xl font-semibold mb-3 text-gray-900">Consistent Daily Returns</h4>
              <p className="text-gray-600">9-13% daily compounded. Paid automatically.</p>
            </div>
            <div className="text-center">
              <div className="text-6xl mb-6">⚡</div>
              <h4 className="text-2xl font-semibold mb-3 text-gray-900">Fast & Easy Withdrawals</h4>
              <p className="text-gray-600">Request anytime. Processed within 24-48 hours.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50" id="how">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h3 className="text-4xl font-bold mb-4 text-gray-900">How It Works</h3>
          <p className="text-gray-600 mb-12">4 simple steps to start earning daily</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num: "1", title: "Create Account", desc: "Takes less than 2 minutes" },
              { num: "2", title: "Deposit USDT", desc: "Minimum $500 (TRC-20)" },
              { num: "3", title: "Earn Daily", desc: "9-13% compounded automatically" },
              { num: "4", title: "Withdraw Anytime", desc: "Fast & reliable payouts" }
            ].map((step, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm">
                <div className="w-16 h-16 mx-auto bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-3xl font-bold mb-6">
                  {step.num}
                </div>
                <h4 className="text-xl font-semibold mb-2 text-gray-900">{step.title}</h4>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <div className="bg-green-700 text-white py-20 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h3 className="text-4xl font-bold mb-6">Ready to Grow Your Wealth?</h3>
          <p className="text-xl mb-10">Join hundreds of investors already earning daily returns</p>
          <a href="/register" className="inline-block bg-white text-green-700 px-12 py-5 rounded-2xl text-xl font-semibold hover:bg-gray-100">
            Create Free Account
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="mb-4">Vertex Wealth Group • Licensed Money Service Business</p>
          <p className="text-sm">© 2025 All Rights Reserved. Crypto investments involve risk.</p>
        </div>
      </footer>
    </div>
  );
}