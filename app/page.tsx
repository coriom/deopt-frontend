'use client';

import Link from 'next/link';
import BackgroundImages from './components/BackgroundImages';
import { useAccount } from 'wagmi';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="bg-[#111111] text-white font-sans min-h-screen flex flex-col relative overflow-hidden">
      <BackgroundImages />

      <main className="flex-grow flex flex-col items-center justify-center px-4 text-center z-10 relative">
        <h1 className="text-4xl font-bold mb-4">
          Decentralized, Simple and Flexible Options and Futurs
        </h1>
        <p className="text-lg text-gray-300 mb-8 max-w-xl">
          Create, exercise, or trade options or futurs you need to have on digital assets with full transparency using blockchain technology.
        </p>

        <div className="flex gap-3">
          {!isConnected ? (
            <Link
              href="/connect"
              className="bg-emerald-500 text-black py-3 px-6 rounded-xl hover:bg-emerald-600 transition"
            >
              Connect wallet
            </Link>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="bg-emerald-500 text-black py-3 px-6 rounded-xl hover:bg-emerald-600 transition"
              >
                Go to dashboard
              </Link>
              <Link
                href="/connect"
                className="bg-neutral-800 text-white py-3 px-6 rounded-xl hover:bg-neutral-700 transition"
              >
                Manage connection
              </Link>
            </>
          )}
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
