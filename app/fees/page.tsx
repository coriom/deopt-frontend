'use client';

import BackgroundImages from "../components/BackgroundImages";

export default function FeesPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      <BackgroundImages />

      <main className="flex-grow px-4 py-10 z-10 relative">
        <div className="max-w-5xl mx-auto bg-neutral-900 rounded-2xl shadow-xl p-6 md:p-8">
          <header className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-center">Fees & Product Overview</h1>
            <p className="text-center text-neutral-400 mt-2">Flat fees of <span className="text-emerald-400 font-semibold">0.02%</span> per side for both buyers and sellers, on both Options and Futures.</p>
          </header>

          {/* FEES TABLE */}
          <section aria-labelledby="fees" className="mb-8">
            <h2 id="fees" className="text-xl md:text-2xl font-semibold text-emerald-400 mb-3">Fees Schedule</h2>
            <div className="overflow-x-auto">
              <table className="table-auto w-full border border-gray-700 text-gray-300">
                <thead className="bg-neutral-900 text-emerald-400">
                  <tr>
                    <th className="px-4 py-2 border border-gray-700 text-left">Product</th>
                    <th className="px-4 py-2 border border-gray-700 text-left">Buyer Fee</th>
                    <th className="px-4 py-2 border border-gray-700 text-left">Seller Fee</th>
                    <th className="px-4 py-2 border border-gray-700 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-2 border border-gray-700">Options (Calls & Puts)</td>
                    <td className="px-4 py-2 border border-gray-700">0.02%</td>
                    <td className="px-4 py-2 border border-gray-700">0.02%</td>
                    <td className="px-4 py-2 border border-gray-700">Applied per side on each trade.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border border-gray-700">Futures (Long & Short)</td>
                    <td className="px-4 py-2 border border-gray-700">0.02%</td>
                    <td className="px-4 py-2 border border-gray-700">0.02%</td>
                    <td className="px-4 py-2 border border-gray-700">Applied per side on each trade.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-neutral-500 mt-3">"Per side" means each party to a trade (buyer and seller) pays the indicated fee.</p>
          </section>

          {/* OPTIONS QUICK REFERENCE (existing content, kept below) */}
          <section aria-labelledby="options-reference">
            <h2 id="options-reference" className="text-xl md:text-2xl font-semibold text-emerald-400 mb-3">Options – Quick Reference</h2>
            <div className="overflow-x-auto">
              <table className="table-auto w-full border border-gray-700 text-gray-300">
                <thead className="bg-neutral-900 text-emerald-400">
                  <tr>
                    <th className="px-4 py-2 border border-gray-700">Feature</th>
                    <th className="px-4 py-2 border border-gray-700">Call Option</th>
                    <th className="px-4 py-2 border border-gray-700">Put Option</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-2 border border-gray-700">Right to</td>
                    <td className="px-4 py-2 border border-gray-700">Buy the asset</td>
                    <td className="px-4 py-2 border border-gray-700">Sell the asset</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border border-gray-700">Best if price</td>
                    <td className="px-4 py-2 border border-gray-700">Goes up</td>
                    <td className="px-4 py-2 border border-gray-700">Goes down</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border border-gray-700">Example use case</td>
                    <td className="px-4 py-2 border border-gray-700">Speculating on a bull market</td>
                    <td className="px-4 py-2 border border-gray-700">Protecting against a market downturn</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border border-gray-700">Potential Profit</td>
                    <td className="px-4 py-2 border border-gray-700">Unlimited (if price keeps rising)</td>
                    <td className="px-4 py-2 border border-gray-700">Significant (as price falls)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border border-gray-700">Maximum Loss</td>
                    <td className="px-4 py-2 border border-gray-700">Limited to the premium paid</td>
                    <td className="px-4 py-2 border border-gray-700">Limited to the premium paid</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-neutral-900 shadow-inner z-10 relative">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-emerald-400">
          © 2025 DeOpt. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
