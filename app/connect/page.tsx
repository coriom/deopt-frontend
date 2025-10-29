'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import Link from 'next/link';
import BackgroundImages from '../components/BackgroundImages';

export default function ConnectPage() {
  const { isConnected, address, connector } = useAccount();
  const { connect, connectors, status, error } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      <BackgroundImages />

      <main className="flex-grow px-4 py-10 z-10 relative">
        <div className="max-w-xl mx-auto bg-neutral-900 rounded-2xl shadow-xl p-6 md:p-8">
          <header className="mb-6 md:mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold">Connect your wallet</h1>
            <p className="text-neutral-400 mt-2">
              Choose a wallet provider to connect to DeOpt.
            </p>
          </header>

          {isConnected ? (
            <div className="space-y-4 text-center">
              <p className="text-neutral-300">
                Connected with <span className="font-semibold text-white">{connector?.name}</span> —{' '}
                <span className="text-emerald-400">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => disconnect()}
                  className="bg-neutral-800 text-white py-2 px-5 rounded-xl hover:bg-neutral-700 transition"
                >
                  Disconnect
                </button>
                <Link
                  href="/dashboard"
                  className="bg-emerald-500 text-black py-2 px-5 rounded-xl hover:bg-emerald-600 transition"
                >
                  Go to dashboard
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                {connectors.map((c) => (
                  <button
                    key={(c as any).id ?? (c as any).uid ?? c.name}
                    onClick={() => connect({ connector: c })}
                    disabled={status === 'pending'}
                    className="bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-black py-3 px-6 rounded-xl hover:bg-emerald-600 transition"
                  >
                    {status === 'pending' ? 'Connecting…' : `Connect with ${c.name}`}
                  </button>
                ))}
              </div>
              {error && (
                <p className="mt-3 text-sm text-red-400 text-center">
                  {error.message}
                </p>
              )}
              <div className="mt-6 text-center">
                <Link
                  href="/"
                  className="text-emerald-300 hover:text-emerald-400 underline underline-offset-4"
                >
                  Back to home
                </Link>
              </div>
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
